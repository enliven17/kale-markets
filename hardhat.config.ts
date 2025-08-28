import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@moved/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "somnia",
  networks: {
    somnia: {
      url: "https://testnet-rpc.somnia.com", // Alternatif RPC endpoint
      chainId: 50312,
      accounts: [process.env.PRIVATE_KEY?.startsWith("0x") ? process.env.PRIVATE_KEY! : "0x" + process.env.PRIVATE_KEY!],
      gas: 100000000, // 100M gas
      gasPrice: 100000000000, // 100 gwei - çok yüksek!
      timeout: 600000 // 10 dakika
    }
  }
};

export default config; 