import { Chain } from 'wagmi/chains';

export const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    name: 'KALE',
    symbol: 'KALE',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network/'] },
    public: { http: ['https://dream-rpc.somnia.network/'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network/' },
  },
  testnet: true,
};
