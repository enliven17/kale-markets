import { ethers } from 'ethers';
import { txFallbackMap } from '@/constants/txFallback';

// Environment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xc0b33Cc720025dD0AcF56e249C8b76A6A34170B6';
const RPC_URL = process.env.NEXT_PUBLIC_SOMNIA_RPC || 'https://dream-rpc.somnia.network/';
const EXPLORER_TX = 'https://shannon-explorer.somnia.network/tx/';

// Minimal ABI for SimpleSomniaMarket (deployed)
const ABI = [
  // events
  'event MarketCreated(uint256 indexed marketId, address indexed creator, string title)',
  // writes
  'function placeBet(uint256 marketId, bool prediction) payable',
  // reads
  'function getMarket(uint256 marketId) view returns (tuple(uint256 id,address creator,string title,string description,uint256 closingTime,uint256 totalYesBets,uint256 totalNoBets,bool isResolved,bool outcome,bool isClosed))',
  'function getMarketCount() view returns (uint256)',
];

export interface OnChainMarket {
  id: number;
  title: string;
  description: string;
  closesAt: number;
  createdAt: number;
  creator: string;
  txHash?: string;
}

class SolidityClient {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.provider);
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getContract(): ethers.Contract {
    return this.contract;
  }

  async fetchMarketCreatedTxMap(): Promise<Record<number, string>> {
    const map: Record<number, string> = {};
    try {
      const filter = {
        address: CONTRACT_ADDRESS,
        topics: [ethers.id('MarketCreated(uint256,address,string)')]
      };
      // Ethers v6: query via contract.queryFilter for better decoding
      const iface = new ethers.Interface(ABI);
      const logs = await this.provider.getLogs({ ...filter, fromBlock: 0n, toBlock: 'latest' });
      for (const log of logs) {
        try {
          const parsed = iface.parseLog({ topics: log.topics, data: log.data }) as any;
          const marketId: bigint | undefined = parsed?.args?.[0];
          if (marketId !== undefined) {
            map[Number(marketId)] = log.transactionHash;
          }
        } catch {}
      }
    } catch (e) {
      // fallback: empty map
    }
    return map;
  }

  private async fetchTxForMarket(marketId: number): Promise<string | undefined> {
    try {
      const topic0 = ethers.id('MarketCreated(uint256,address,string)');
      const topic1 = ethers.zeroPadValue(ethers.toBeHex(BigInt(marketId)), 32);
      const logs = await this.provider.getLogs({
        address: CONTRACT_ADDRESS,
        topics: [topic0, topic1],
        fromBlock: 0n,
        toBlock: 'latest'
      });
      if (logs.length > 0) return logs[0].transactionHash;
    } catch {}
    return undefined;
  }

  async fetchOnChainMarkets(): Promise<OnChainMarket[]> {
    const markets: OnChainMarket[] = [];
    const txMap = await this.fetchMarketCreatedTxMap();
    const count: bigint = await this.contract.getMarketCount();
    const now = Math.floor(Date.now() / 1000);
    for (let i = 1; i <= Number(count); i++) {
      try {
        const m = await this.contract.getMarket(i);
        let txHash: string | undefined = txMap[Number(m.id)] || txFallbackMap[Number(m.id)];
        if (!txHash) {
          txHash = await this.fetchTxForMarket(Number(m.id));
        }
        markets.push({
          id: Number(m.id),
          title: m.title as string,
          description: m.description as string,
          closesAt: Number(m.closingTime),
          createdAt: now,
          creator: (m.creator as string),
          txHash,
        });
      } catch (e) {
        // skip missing
      }
    }
    return markets;
  }
}

export const solidityClient = new SolidityClient();

// Buy helper: qty shares at 0.5 KALE per share (native token)
export async function buyShares(marketId: number, isYes: boolean, quantity: number) {
  if (typeof window === 'undefined' || !(window as any).ethereum) throw new Error('Wallet not available');
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const pricePerShare = ethers.parseEther('0.5');
  const total = pricePerShare * BigInt(Math.max(0, Math.floor(quantity)));
  const tx = await contract.placeBet(marketId, isYes, { value: total });
  return await tx.wait();
}

export default solidityClient; 