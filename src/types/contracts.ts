import { ethers } from 'ethers';

// Contract ABI (simplified version for now)
export const PREDICTION_MARKET_ABI = [
  // Events
  "event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 closingTime, uint256 initialPool)",
  "event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction)",
  "event MarketResolved(uint256 indexed marketId, bool outcome)",
  "event MarketClosed(uint256 indexed marketId)",
  "event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount)",
  "event BalanceWithdrawn(address indexed user, uint256 amount)",
  
  // View functions
  "function getMarket(uint256 marketId) external view returns (tuple(uint256 id, address creator, string title, string description, uint256 closingTime, uint256 totalYesBets, uint256 totalNoBets, uint256 minBet, uint256 maxBet, uint256 initialPool, bool isResolved, bool outcome, bool isClosed, uint256 totalBets, uint256 totalPool))",
  "function getMarketBets(uint256 marketId) external view returns (tuple(address user, uint256 amount, bool prediction, uint256 timestamp, bool claimed)[])",
  "function getUserBets(address user) external view returns (uint256[])",
  "function getUserBalance(address user) external view returns (uint256)",
  "function getMarketCount() external view returns (uint256)",
  "function getUserBetAmount(uint256 marketId, address user) external view returns (uint256)",
  "function getMarketStats(uint256 marketId) external view returns (uint256 totalYesBets, uint256 totalNoBets, uint256 totalBets, uint256 totalPool, bool isResolved, bool outcome)",
  
  // State changing functions
  "function createMarket(string memory title, string memory description, uint256 closingTime, uint256 minBet, uint256 maxBet) external payable",
  "function placeBet(uint256 marketId, bool prediction) external payable",
  "function resolveMarket(uint256 marketId, bool outcome) external",
  "function closeMarket(uint256 marketId) external",
  "function claimReward(uint256 marketId) external",
  "function withdrawBalance() external",
  "function emergencyWithdraw() external"
];

// Contract factory
export class PredictionMarket__factory {
  static connect(address: string, signer: ethers.Signer): ethers.Contract {
    return new ethers.Contract(address, PREDICTION_MARKET_ABI, signer);
  }
}

// Market interface
export interface Market {
  id: number;
  creator: string;
  title: string;
  description: string;
  closingTime: number;
  totalYesBets: string;
  totalNoBets: string;
  minBet: string;
  maxBet: string;
  initialPool: string;
  isResolved: boolean;
  outcome: boolean;
  isClosed: boolean;
  totalBets: number;
  totalPool: string;
}

// Bet interface
export interface Bet {
  user: string;
  amount: string;
  prediction: boolean;
  timestamp: number;
  claimed: boolean;
}

// Market stats interface
export interface MarketStats {
  totalYesBets: string;
  totalNoBets: string;
  totalBets: number;
  totalPool: string;
  isResolved: boolean;
  outcome: boolean;
} 