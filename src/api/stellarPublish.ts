import { Server, TransactionBuilder, BASE_FEE, Operation, Memo } from 'stellar-sdk';
import { getWalletKit } from '@/api/walletKit';
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import { STELLAR_NETWORK_PASSPHRASE } from '@/config/stellar';

type PublishMarketParams = {
  title: string;
  description: string;
  closesAt: number; // ms
};

// Placeholder: publish as a data entry on testnet. In a real app, replace with contract call.
export async function publishMarketToTestnet(params: PublishMarketParams) {
  const server = new Server('https://horizon-testnet.stellar.org');
  const networkPassphrase = STELLAR_NETWORK_PASSPHRASE.TESTNET;
  const kit = getWalletKit();
  await kit.setNetwork(WalletNetwork.TESTNET);
  const { address } = await kit.getAddress();

  const account = await server.loadAccount(address);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
    .addOperation(Operation.manageData({ name: `market:${params.title.slice(0, 28)}`, value: new TextEncoder().encode(JSON.stringify({ d: params.description, c: params.closesAt })) }))
    .setTimeout(180)
    .build();

  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), { address, networkPassphrase });
  const res = await server.submitTransaction(signedTxXdr);
  return res;
}





