import { somniaTestnet } from './somniaChain';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dummydummydummydummydummydummydummydummy';

export const metadata = {
  name: 'MarketSomnia',
  description: 'Prediction Markets on Somnia Testnet',
  url: 'https://marketsomnia.app',
  icons: ['https://shannon-explorer.somnia.network/favicon.ico'],
};

let wagmiConfig: any = undefined;
if (typeof window !== "undefined") {
  const { defaultWagmiConfig } = require('@web3modal/wagmi/react/config');
  const { somniaTestnet } = require('./somniaChain');
  wagmiConfig = defaultWagmiConfig({
    chains: [somniaTestnet],
    projectId,
    metadata,
    ssr: false,
  });
}
export { wagmiConfig }; 