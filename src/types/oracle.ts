import { BetSide } from "@/types/market";

export interface OracleResult {
  marketId: string;
  result: BetSide;
  resolvedAt: number;
} 