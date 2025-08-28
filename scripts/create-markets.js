const hre = require("hardhat");

async function main() {
  console.log("Creating 16 FUNNY prediction markets on Somnia Testnet...");

  // Contract address - replace with actual deployed contract address
  const CONTRACT_ADDRESS = "0xc0b33Cc720025dD0AcF56e249C8b76A6A34170B6";
  
  const SomniaPredictionMarket = await hre.ethers.getContractFactory("SomniaPredictionMarket");
  const predictionMarket = SomniaPredictionMarket.attach(CONTRACT_ADDRESS);

  const markets = [
    {
      title: "Will Elon Musk tweet 'Doge to the moon' again in 2026? 🚀",
      description: "The most predictable prediction in crypto history - will the Doge father strike again?",
      closingTime: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("1")
    },
    {
      title: "Will someone create a 'Pizza for Bitcoin' NFT worth more than the original pizza? 🍕",
      description: "History repeats itself - but this time as expensive digital art",
      closingTime: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60), // 14 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.5")
    },
    {
      title: "Will 'HODL' be added to the Oxford Dictionary in 2026? 📚",
      description: "The ultimate validation for crypto culture - will HODL become official English?",
      closingTime: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      minBet: hre.ethers.parseEther("0.005"),
      maxBet: hre.ethers.parseEther("0.3")
    },
    {
      title: "Will someone propose marriage via smart contract on blockchain? 💍",
      description: "Love is blind, but the blockchain is transparent - romantic proposals go digital",
      closingTime: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days from now
      minBet: hre.ethers.parseEther("0.005"),
      maxBet: hre.ethers.parseEther("0.2")
    },
    {
      title: "Will a cat become the CEO of a DAO in 2026? 😸",
      description: "Dogs have their day, but cats are taking over the decentralized world",
      closingTime: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60), // 180 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.4")
    },
    {
      title: "Will someone create a 'Proof of Sleep' blockchain? 😴",
      description: "The most energy-efficient consensus mechanism - you literally sleep to mine",
      closingTime: Math.floor(Date.now() / 1000) + (120 * 24 * 60 * 60), // 120 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.3")
    },
    {
      title: "Will 'WAGMI' be used in a presidential speech in 2026? 🗣️",
      description: "We're All Gonna Make It - but will politicians finally understand crypto slang?",
      closingTime: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.5")
    },
    {
      title: "Will someone create a 'Proof of Meme' consensus mechanism? 🎭",
      description: "The blockchain that runs on pure comedy - the more you laugh, the more you earn",
      closingTime: Math.floor(Date.now() / 1000) + (200 * 24 * 60 * 60), // 200 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.4")
    },
    {
      title: "Will 'Diamond Hands' become a medical condition in 2026? 💎",
      description: "Doctors finally recognize the psychological effects of never selling",
      closingTime: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days from now
      minBet: hre.ethers.parseEther("0.005"),
      maxBet: hre.ethers.parseEther("0.2")
    },
    {
      title: "Will someone create a 'Proof of Coffee' blockchain? ☕",
      description: "The most caffeinated consensus mechanism - your morning coffee powers the network",
      closingTime: Math.floor(Date.now() / 1000) + (150 * 24 * 60 * 60), // 150 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.3")
    },
    {
      title: "Will 'FOMO' be officially recognized as a psychological disorder? 😱",
      description: "The Fear Of Missing Out - finally gets the medical recognition it deserves",
      closingTime: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 365 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.4")
    },
    {
      title: "Will someone create a 'Proof of Dance' blockchain? 💃",
      description: "Move to earn - the most entertaining way to validate transactions",
      closingTime: Math.floor(Date.now() / 1000) + (120 * 24 * 60 * 60), // 120 days from now
      minBet: hre.ethers.parseEther("0.005"),
      maxBet: hre.ethers.parseEther("0.2")
    },
    {
      title: "Will 'Paper Hands' become a psychological therapy technique? 📄",
      description: "Therapists start using 'paper hands' as a metaphor for letting go",
      closingTime: Math.floor(Date.now() / 1000) + (180 * 24 * 60 * 60), // 180 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.3")
    },
    {
      title: "Will someone create a 'Proof of Pizza' blockchain? 🍕",
      description: "The tastiest consensus mechanism - you earn tokens by eating pizza",
      closingTime: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.3")
    },
    {
      title: "Will 'Ape In' become a financial advisor's official recommendation? 🦍",
      description: "Professional financial planners start using crypto slang in their advice",
      closingTime: Math.floor(Date.now() / 1000) + (120 * 24 * 60 * 60), // 120 days from now
      minBet: hre.ethers.parseEther("0.005"),
      maxBet: hre.ethers.parseEther("0.2")
    },
    {
      title: "Will someone create a 'Proof of Laughter' blockchain? 😂",
      description: "The happiest blockchain - your joy powers the network and spreads positivity",
      closingTime: Math.floor(Date.now() / 1000) + (200 * 24 * 60 * 60), // 200 days from now
      minBet: hre.ethers.parseEther("0.01"),
      maxBet: hre.ethers.parseEther("0.4")
    }
  ];

  console.log("Creating FUNNY markets...");
  
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`Creating market ${i + 1}: ${market.title}`);
    
    try {
      const tx = await predictionMarket.createMarket(
        market.title,
        market.description,
        market.closingTime,
        market.minBet,
        market.maxBet
      );
      
      await tx.wait();
      console.log(`Market ${i + 1} created successfully! 🎉`);
      
      // Wait a bit between transactions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to create market ${i + 1}:`, error.message);
    }
  }

  console.log("All FUNNY markets created! 🎭🎪🎨");
  
  // Get the total market count
  const marketCount = await predictionMarket.marketCount();
  console.log(`Total markets created: ${marketCount} 🚀`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
