# KALE Markets – Stellar Prediction Markets

A decentralized prediction market platform built on the Stellar blockchain, using KALE tokens for payments and Stellar Testnet for market data.

## 🌟 Features

- **16 Creative KALE Markets**: Pre-seeded prediction markets on Stellar Testnet
- **Stellar Wallet Integration**: Connect with any Stellar wallet (Freighter, Albedo, etc.)
- **KALE Token Payments**: All bets and rewards in KALE tokens on Stellar Mainnet
- **Real-time Updates**: Live market data and betting information
- **Persistent Storage**: User bets saved locally and synced across sessions
- **Modern UI**: Beautiful, responsive interface built with Next.js and styled-components

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kale-markets
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Stellar configuration:
   ```env
   NEXT_PUBLIC_KALE_ISSUER=GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE
   NEXT_PUBLIC_KALE_TREASURY=GA2OFZVRG2QYK3Y7HOWJ3T575ZM7J22GJTMEDBJODW6QE7LC3T4BYMY7
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### **Market Creation**
- 16 pre-seeded KALE markets are deployed to Stellar Testnet
- Each market has a unique transaction hash visible on the frontend
- Markets are stored using Stellar's `manageData` operations

### **Betting Process**
1. Connect your Stellar wallet
2. Choose a market and bet amount
3. Sign the KALE payment transaction on Mainnet
4. Bet is recorded locally and displayed in real-time

### **Technology Stack**
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: styled-components
- **State Management**: Redux Toolkit
- **Blockchain**: Stellar SDK, Stellar Wallets Kit
- **Storage**: localStorage for persistence

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run gen-stellar-account` - Generate new Stellar keypair
- `npm run publish-seeds` - Deploy seed markets to Stellar Testnet

## 🌐 Stellar Network

- **Testnet**: Markets and data storage
- **Mainnet**: KALE token payments and transactions
- **KALE Token**: Stellar memecoin asset
- **Explorer**: [Stellar Expert](https://stellar.expert/)

## 📁 Project Structure

```
src/
├── api/             # Stellar API clients
├── components/      # Reusable UI components
├── config/          # Stellar network configuration
├── constants/       # Seed markets and transaction data
├── hooks/           # Custom React hooks
├── screens/         # Screen components
├── store/           # Redux state management
├── theme/           # Styling and design system
└── types/           # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

<p><strong>Built for the KALE ecosystem on Stellar. 🌟✨</strong></p>
