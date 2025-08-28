import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chain: "EVM" | "STELLAR" | null;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chain: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    connectWallet(state, action: PayloadAction<{ address: string; chain: "EVM" | "STELLAR" }>) {
      state.address = action.payload.address;
      state.isConnected = true;
      state.chain = action.payload.chain;
    },
    disconnectWallet(state) {
      state.address = null;
      state.isConnected = false;
      state.chain = null;
    },
  },
});

export const { connectWallet, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
export type { WalletState }; 