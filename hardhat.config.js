require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.moved.network", // UMI EVM endpoint
      chainId: 42069,
      accounts: [
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.startsWith("0x")
          ? process.env.PRIVATE_KEY
          : "0x" + process.env.PRIVATE_KEY
      ]
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      devnet: "dummy" // Umi devnet doesn't need real API key
    },
    customChains: [
      {
        network: "devnet",
        chainId: 42069,
        urls: {
          apiURL: "https://devnet.explorer.uminetwork.com/api",
          browserURL: "https://devnet.explorer.uminetwork.com"
        }
      }
    ]
  }
}; 