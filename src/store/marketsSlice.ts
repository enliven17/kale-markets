import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Market, Bet, BetSide } from "@/types/market";
import { creativeSeedMarkets } from "@/constants/seedMarkets";
import { seedTxs } from '@/constants/seedTxs';
import { RootState } from './index';

// Demo verileri kaldırıldı, başlangıç boş
const initialMarkets: Market[] = [];

interface ClaimableReward {
  userId: string;
  marketId: string;
  amount: number;
  claimed: boolean;
}

interface MarketsState {
  markets: Market[];
  claimableRewards: ClaimableReward[];
  userDefiQ: Record<string, number>;
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

// localStorage'dan user bets yükle
function loadUserBetsFromStorage() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('kale_user_bets');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

// localStorage'a user bets kaydet
function saveUserBetsToStorage(userBets: Record<string, Bet[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('kale_user_bets', JSON.stringify(userBets));
  } catch (e) {}
}

// Artık localStorage temizlenmiyor; kullanıcı bahisleri kalıcı

// localStorage'dan stored markets yükle veya seed markets kullan
function getInitialMarkets(): Market[] {
  const stored = loadMarketsFromStorage();
  
  // Her zaman seed markets'i kullan ve txHash'leri ekle
  const seedMarkets = creativeSeedMarkets.map((m) => {
    const tx = seedTxs.find((t) => t.id === m.id)?.tx;
    return { ...m, txHash: tx, bets: [] } as any;
  });
  
  if (stored && Array.isArray(stored) && stored.length > 0) {
    console.log('Loading markets from localStorage and preserving bets');
    // Stored markets'ten bet'leri al ve seed markets'e ekle
    const marketsWithBets = seedMarkets.map((seedMarket) => {
      const storedMarket = stored.find((s) => s.id === seedMarket.id);
      if (storedMarket && storedMarket.bets) {
        return { ...seedMarket, bets: storedMarket.bets };
      }
      return seedMarket;
    });
    
    // localStorage'ı güncelle
    saveMarketsToStorage(marketsWithBets);
    return marketsWithBets;
  }
  
  console.log('No stored markets found, using seed markets');
  // localStorage'a seed markets'i kaydet
  saveMarketsToStorage(seedMarkets);
  console.log('Seed markets saved to localStorage');
  
  return seedMarkets;
}

const initialState: MarketsState = {
  markets: getInitialMarkets(),
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
    setMarkets(state, action: PayloadAction<Market[]>) {
      state.markets = action.payload;
      saveMarketsToStorage(state.markets);
    },
    addBet(state, action: PayloadAction<Bet>) {
      console.log('=== addBet Reducer Debug ===');
      console.log('Adding bet:', action.payload);
      console.log('Current markets:', state.markets);
      
      const market = state.markets.find(m => m.id === action.payload.marketId);
      console.log('Found market:', market);
      
      if (market) {
        market.bets = [...market.bets, action.payload];
        console.log('Updated market bets:', market.bets);
        saveMarketsToStorage(state.markets);
        console.log('Markets saved to storage');
        
        // User bets'i ayrıca sakla
        const userBets = loadUserBetsFromStorage();
        console.log('Current userBets from storage:', userBets);
        
        if (!userBets[action.payload.userId]) {
          userBets[action.payload.userId] = [];
          console.log('Created new user array for:', action.payload.userId);
        }
        
        userBets[action.payload.userId].push(action.payload);
        console.log('Added bet to user bets:', userBets[action.payload.userId]);
        
        saveUserBetsToStorage(userBets);
        console.log('User bets saved to storage');
        console.log('=== End addBet Reducer Debug ===');
      } else {
        console.error('Market not found for bet:', action.payload.marketId);
      }
    },
    closeMarket(state, action: PayloadAction<{ marketId: string; result: BetSide }>) {
      const market = state.markets.find(m => m.id === action.payload.marketId);
      if (market) {
        market.status = "resolved";
        market.result = action.payload.result;
        saveMarketsToStorage(state.markets);
        
        // User bets'i güncelle
        const userBets = loadUserBetsFromStorage();
        Object.keys(userBets).forEach(userId => {
          userBets[userId] = userBets[userId].map((bet: any) => {
            if (bet.marketId === action.payload.marketId) {
              return { ...bet, marketStatus: 'resolved', marketResult: action.payload.result };
            }
            return bet;
          });
        });
        saveUserBetsToStorage(userBets);
        
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
    },
    refreshMarkets(state) {
      // Seed markets'i yeniden yükle ve txHash'leri ekle
      const seedMarkets = creativeSeedMarkets.map((m) => {
        const tx = seedTxs.find((t) => t.id === m.id)?.tx;
        return { ...m, txHash: tx, bets: [] } as any;
      });
      
      // Mevcut bet'leri koru
      const marketsWithBets = seedMarkets.map((seedMarket) => {
        const existingMarket = state.markets.find((s) => s.id === seedMarket.id);
        if (existingMarket && existingMarket.bets) {
          return { ...seedMarket, bets: existingMarket.bets };
        }
        return seedMarket;
      });
      
      state.markets = marketsWithBets;
      saveMarketsToStorage(marketsWithBets);
    }
  }
});

export const { addMarket, addBet, closeMarket, claimReward, setUserDefiQ, refreshMarkets } = marketsSlice.actions;

export default marketsSlice.reducer;
export type { ClaimableReward }; 