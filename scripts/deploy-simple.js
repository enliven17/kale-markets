const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleSomniaMarket to Somnia Testnet...");

  try {
    console.log("📝 Creating contract factory...");
    const SimpleSomniaMarket = await hre.ethers.getContractFactory("SimpleSomniaMarket");
    
    console.log("🔨 Deploying contract...");
    
    // Deploy with specific gas settings for Somnia
    const predictionMarket = await SimpleSomniaMarket.deploy({
      gasLimit: 3000000,
      gasPrice: hre.ethers.parseUnits("50", "gwei")
    });

    console.log("⏳ Waiting for deployment...");
    await predictionMarket.waitForDeployment();

    const address = await predictionMarket.getAddress();
    console.log("✅ SimpleSomniaMarket deployed to:", address);

    // Wait for confirmations
    console.log("⏳ Waiting for block confirmations...");
    const deploymentTx = predictionMarket.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(2);
      console.log("✅ Contract confirmed on blockchain");
    }

    console.log("🎉 Deployment successful!");
    console.log("Contract Address:", address);
    console.log("Network:", hre.network.name);
    console.log("Chain ID:", hre.network.config.chainId);
    
    // Save contract address for later use
    console.log("\n📋 Next steps:");
    console.log("1. Update create-markets.js with contract address:", address);
    console.log("2. Run: npm run create:markets");

  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error("Error:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("💡 Tip: Make sure you have enough KALE tokens for fees");
    } else if (error.code === 'NETWORK_ERROR') {
      console.error("💡 Tip: Check your network connection");
    }
    
    throw error;
  }
}

main()
  .then(() => {
    console.log("🚀 Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment script failed:", error);
    process.exit(1);
  }); 