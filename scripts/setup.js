const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Setting up Umi Devnet deployment...");
  
  // Check if we have a private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log("⚠️  No PRIVATE_KEY found in environment variables");
    console.log("Please set your private key:");
    console.log("export PRIVATE_KEY=your_private_key_here");
    console.log("Or create a .env file with PRIVATE_KEY=your_private_key_here");
    return;
  }

  // Check account balance
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("📊 Account Info:");
  console.log("Address:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Low balance detected. You may need to get some test ETH from Umi faucet.");
    console.log("Faucet URL: https://devnet.uminetwork.com/faucet");
  }

  // Deploy contract
  console.log("\n🔨 Deploying SimplePredictionMarket contract...");
  const SimplePredictionMarket = await hre.ethers.getContractFactory("SimplePredictionMarket");
  const predictionMarket = await SimplePredictionMarket.deploy();
  
  console.log("Transaction hash:", predictionMarket.deploymentTransaction().hash);
  await predictionMarket.waitForDeployment();
  
  const address = await predictionMarket.getAddress();
  console.log("✅ Contract deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "SimplePredictionMarket",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorer: `https://devnet.explorer.uminetwork.com/address/${address}`,
    rpcUrl: "https://devnet.uminetwork.com",
    chainId: 42069
  };

  // Save to file
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Create environment file
  const envContent = `# Umi Devnet Configuration
NEXT_PUBLIC_RPC_URL=https://devnet.uminetwork.com
NEXT_PUBLIC_CHAIN_ID=42069
NEXT_PUBLIC_EXPLORER_URL=https://devnet.explorer.uminetwork.com

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=${address}

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=dummydummydummydummydummydummydummydummy

# Private Key for deployment (optional)
PRIVATE_KEY=${privateKey}
`;

  const envPath = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envPath, envContent);
  
  console.log("\n📝 Environment file created:", envPath);
  console.log("⚠️  Remember to add .env.local to your .gitignore file!");

  console.log("\n🎉 Setup completed successfully!");
  console.log("\n📖 Next steps:");
  console.log("1. Start the development server: npm run dev");
  console.log("2. Connect your wallet to Umi Devnet");
  console.log("3. Test the prediction market functionality");
  console.log("\n🔗 Useful links:");
  console.log("- Explorer:", deploymentInfo.explorer);
  console.log("- RPC URL:", deploymentInfo.rpcUrl);
  console.log("- Faucet: https://devnet.uminetwork.com/faucet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }); 