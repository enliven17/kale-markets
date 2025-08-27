import { configureStore } from "@reduxjs/toolkit";
import marketsReducer from "@/store/marketsSlice";
import walletReducer from "@/store/walletSlice";

export const store = configureStore({
  reducer: {
    markets: marketsReducer,
    wallet: walletReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 