# mSomnia – Somnia Testnet Prediction Markets

<div align="center">
  <h3>Prediction markets on Stellar (KALE)</h3>
  <p>Buy YES/NO shares, see TX links and dynamic probabilities.</p>
</div>

## Features
- 16 preset funny markets
- Buy YES/NO at 0.5 KALE/share, quick amounts (1/5/10/20)
- Dynamic YES probability based on bet totals
- TX badge on cards → Somnia explorer
- Wallet UX: if rejected, retry button remains
- Local bet persistence (survives refresh)

## Stack
- Next.js 15, React 19, TypeScript, styled-components
- Redux Toolkit
- Ethers v6 (Somnia testnet)

## Environment
Create `.env`:
```
NEXT_PUBLIC_SOMNIA_RPC=https://dream-rpc.somnia.network/
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc0b33Cc720025dD0AcF56e249C8b76A6A34170B6
# Optional (local scripts)
PRIVATE_KEY=your_private_key
```

## Run locally
```
npm install
npm run dev
# http://localhost:3000
```

## Vercel Deploy
- `.vercelignore` included
- Set project envs on Vercel: `NEXT_PUBLIC_SOMNIA_RPC`, `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Build: `next build` (handled by Vercel)

## Somnia Network
- Chain ID: 50312
- RPC: https://dream-rpc.somnia.network/
- Explorer: https://shannon-explorer.somnia.network/

## Notes
- No hardcoded private keys in source; scripts read `PRIVATE_KEY` from env.
- Contracts: deployed SimpleSomniaMarket at `NEXT_PUBLIC_CONTRACT_ADDRESS`; `scripts/create-markets.js` can seed markets.

<div align="center">
  <p><strong>Built for the Somnia ecosystem. 🌌✨</strong></p>
  <p>Made with ❤️ for on-chain fun.</p>
</div>
