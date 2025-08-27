import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Market, Bet, MarketStatus, BetSide } from "@/types/market";
import { AppDispatch, RootState } from './index';

import { createAsyncThunk } from '@reduxjs/toolkit';

// Fun sample markets (KALE units). These are preloaded demo markets.
const now = Date.now();
const day = 1000 * 60 * 60 * 24;
const initialMarkets: Market[] = [
  { id: "1", title: "Will a cat become mayor of any town in 2026?", description: "Any recognized municipality elects or appoints a cat as mayor by Dec 31, 2026.", creatorId: "seed", createdAt: now - day, closesAt: now + 30 * day, initialPool: 250, minBet: 1, maxBet: 500, status: "open", bets: [] },
  { id: "2", title: "Will pineapple on pizza win an international award?", description: "Any major culinary award honors a pineapple-on-pizza dish by 2026.", creatorId: "seed", createdAt: now - 2 * day, closesAt: now + 60 * day, initialPool: 180, minBet: 1, maxBet: 400, status: "open", bets: [] },
  { id: "3", title: "Will a robot win a televised dance contest?", description: "A non-humanoid robot wins a televised dance competition by 2026.", creatorId: "seed", createdAt: now - 3 * day, closesAt: now + 90 * day, initialPool: 220, minBet: 1, maxBet: 600, status: "open", bets: [] },
  { id: "4", title: "Will 'AI-generated song' hit #1 on any global chart?", description: "A primarily AI-generated song reaches #1 on a recognized global music chart.", creatorId: "seed", createdAt: now - 4 * day, closesAt: now + 120 * day, initialPool: 300, minBet: 1, maxBet: 700, status: "open", bets: [] },
  { id: "5", title: "Will a human run a sub-1:50 marathon (2 legs)?", description: "A novelty event where two runners alternate legs to complete a marathon under 1:50.", creatorId: "seed", createdAt: now - 5 * day, closesAt: now + 150 * day, initialPool: 150, minBet: 1, maxBet: 350, status: "open", bets: [] },
  { id: "6", title: "Will a pizza be delivered by space balloon?", description: "A documented commercial pizza delivery using a near-space balloon by end of 2026.", creatorId: "seed", createdAt: now - 6 * day, closesAt: now + 180 * day, initialPool: 200, minBet: 1, maxBet: 450, status: "open", bets: [] },
  { id: "7", title: "Will K-pop collaborate with a whale song album?", description: "A charting album featuring authentic whale song as primary musical element.", creatorId: "seed", createdAt: now - 7 * day, closesAt: now + 200 * day, initialPool: 210, minBet: 1, maxBet: 500, status: "open", bets: [] },
  { id: "8", title: "Will a selfie from the Moon trend worldwide?", description: "A human-taken selfie on the Moon trends #1 worldwide on any platform.", creatorId: "seed", createdAt: now - 8 * day, closesAt: now + 240 * day, initialPool: 400, minBet: 1, maxBet: 800, status: "open", bets: [] },
  { id: "9", title: "Will a tomato be CRISPR-named \"Tommy 2.0\"?", description: "A CRISPR-edited tomato cultivar officially named 'Tommy 2.0' by 2027.", creatorId: "seed", createdAt: now - 9 * day, closesAt: now + 300 * day, initialPool: 120, minBet: 1, maxBet: 300, status: "open", bets: [] },
  { id: "10", title: "Will a dog star in a courtroom drama as a lawyer?", description: "A mainstream TV series casts a dog as an actual lawyer character.", creatorId: "seed", createdAt: now - 10 * day, closesAt: now + 210 * day, initialPool: 260, minBet: 1, maxBet: 550, status: "open", bets: [] },
  { id: "11", title: "Will a city legalize napping pods on sidewalks?", description: "A city passes an ordinance explicitly permitting temporary sidewalk napping pods.", creatorId: "seed", createdAt: now - 11 * day, closesAt: now + 130 * day, initialPool: 140, minBet: 1, maxBet: 320, status: "open", bets: [] },
  { id: "12", title: "Will a chess world champion lose to a toaster?", description: "A verified match shows a champion losing to a DIY toaster-computer hybrid.", creatorId: "seed", createdAt: now - 12 * day, closesAt: now + 260 * day, initialPool: 190, minBet: 1, maxBet: 420, status: "open", bets: [] },
  { id: "13", title: "Will someone 3D-print a habitable treehouse?", description: "A livable treehouse is 3D-printed (majority structure) and certified safe.", creatorId: "seed", createdAt: now - 13 * day, closesAt: now + 280 * day, initialPool: 230, minBet: 1, maxBet: 520, status: "open", bets: [] },
  { id: "14", title: "Will a meme win a Pulitzer Prize?", description: "Any recognized Pulitzer category awards a meme or meme creator.", creatorId: "seed", createdAt: now - 14 * day, closesAt: now + 320 * day, initialPool: 175, minBet: 1, maxBet: 410, status: "open", bets: [] },
  { id: "15", title: "Will a viral app only use fax machines?", description: "An app relying primarily on fax communication enters top app charts.", creatorId: "seed", createdAt: now - 15 * day, closesAt: now + 100 * day, initialPool: 160, minBet: 1, maxBet: 380, status: "open", bets: [] },
  { id: "16", title: "Will KALE be accepted at a salad-only festival?", description: "An official festival accepts KALE token for on-site salad purchases.", creatorId: "seed", createdAt: now - 16 * day, closesAt: now + 170 * day, initialPool: 500, minBet: 1, maxBet: 900, status: "open", bets: [] },
];

interface ClaimableReward {
  userId: string;
  marketId: string;
  amount: number;
  claimed: boolean;
}

interface MarketsState {
  markets: Market[];
  claimableRewards: ClaimableReward[];
  userDefiQ: Record<string, number>; // address -> DEFiq puanı
}

// localStorage'dan markets yükle
function loadMarketsFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('kale_markets');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// localStorage'a markets kaydet
function saveMarketsToStorage(markets: Market[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('kale_markets', JSON.stringify(markets));
  } catch (e) {}
}

// Uygulama başlatılırken localStorage temizle (tam reload veya yeni tab)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    localStorage.removeItem('kale_markets');
  });
}

const initialState: MarketsState = {
  markets: (typeof window !== 'undefined' && loadMarketsFromStorage()) || initialMarkets,
  claimableRewards: [],
  userDefiQ: {
    // Demo kullanıcılar için temsili DEFiq puanları
    "user1": 85,
    "user2": 120,
    "user3": 65,
    "user4": 95,
    "user5": 150,
    "user6": 75,
    "user7": 110,
    "user8": 45,
  },
};

const marketsSlice = createSlice({
  name: "markets",
  initialState,
  reducers: {
    addMarket(state, action: PayloadAction<Market>) {
      state.markets = [action.payload, ...state.markets];
      saveMarketsToStorage(state.markets);
    },
    addBet(state, action: PayloadAction<Bet>) {
      const market = state.markets.find(m => m.id === action.payload.marketId);
      if (market) {
        market.bets = [...market.bets, action.payload];
        saveMarketsToStorage(state.markets);
      }
    },
    closeMarket(state, action: PayloadAction<{ marketId: string; result: BetSide }>) {
      const market = state.markets.find(m => m.id === action.payload.marketId);
      if (market) {
        market.status = "resolved";
        market.result = action.payload.result;
        saveMarketsToStorage(state.markets);
        // Payout hesapla
        const totalPool = market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0);
        const winners = market.bets.filter(b => b.side === action.payload.result);
        const totalWinnerBet = winners.reduce((sum, b) => sum + b.amount, 0);
        if (totalWinnerBet > 0) {
          winners.forEach(bet => {
            const pay = (bet.amount / totalWinnerBet) * totalPool;
            state.claimableRewards.push({
              userId: bet.userId,
              marketId: market.id,
              amount: pay,
              claimed: false
            });
            // DEFiq puanını güncelle (ör: +10 her kazanç için)
            if (!state.userDefiQ[bet.userId]) state.userDefiQ[bet.userId] = 0;
            state.userDefiQ[bet.userId] += 10;
          });
        }
      }
    },
    claimReward(state, action: PayloadAction<{ userId: string; marketId: string }>) {
      const reward = state.claimableRewards.find(r => r.userId === action.payload.userId && r.marketId === action.payload.marketId && !r.claimed);
      if (reward) {
        reward.claimed = true;
      }
    },
    setUserDefiQ(state, action: PayloadAction<{ address: string; score: number }>) {
      state.userDefiQ[action.payload.address] = action.payload.score;
    }
  }
});

export const { addMarket, addBet, closeMarket, claimReward, setUserDefiQ } = marketsSlice.actions;

// Marketi kapatıp ödülleri otomatik dağıtan thunk
export const closeMarketAndDistributeRewards = createAsyncThunk(
  'markets/closeMarketAndDistributeRewards',
  async ({ marketId, result }: { marketId: string; result: BetSide }, { dispatch, getState }) => {
    // 1. Marketi kapat
    dispatch(closeMarket({ marketId, result }));
    // 2. Kazananlara ödül miktarını ekle
    const state = getState() as RootState;
    const market = state.markets.markets.find(m => m.id === marketId);
    if (!market) return;
    const totalPool = market.initialPool + market.bets.reduce((sum, b) => sum + b.amount, 0);
    const winners = market.bets.filter(b => b.side === result);
    const totalWinnerBet = winners.reduce((sum, b) => sum + b.amount, 0);
    if (totalWinnerBet > 0) {
              winners.forEach(bet => {
          const pay = (bet.amount / totalWinnerBet) * totalPool;
          // Note: Rewards are now handled by smart contract
          console.log(`Reward calculated for ${bet.userId}: ${pay} ETH`);
        });
    }
  }
);

export default marketsSlice.reducer;
export type { ClaimableReward }; 