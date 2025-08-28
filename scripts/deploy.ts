import { ethers } from 'hardhat';

async function main() {
  const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  // Get the generated contract address from the transaction receipt
  const receipt = await ethers.provider.getTransactionReceipt(predictionMarket.deploymentTransaction()?.hash!);
  console.log('PredictionMarket is deployed to:', receipt?.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  }); 