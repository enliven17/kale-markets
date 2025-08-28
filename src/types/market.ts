export type MarketStatus = "open" | "closed" | "resolved";

export type BetSide = "yes" | "no";

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  amount: number; // ETH cinsinden
  side: BetSide;
  timestamp: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: number;
  closesAt: number;
  initialPool: number; // Market açılışında eklenen ETH
  minBet: number;
  maxBet: number;
  status: MarketStatus;
  bets: Bet[];
  result?: BetSide; // Oracle sonucu
  txHash?: string; // Transaction hash for creation
} 