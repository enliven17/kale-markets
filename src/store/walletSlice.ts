import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  isConnected: boolean;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    connectWallet(state, action: PayloadAction<string>) {
      state.address = action.payload;
      state.isConnected = true;
    },
    disconnectWallet(state) {
      state.address = null;
      state.isConnected = false;
    },
  },
});

export const { connectWallet, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
export type { WalletState }; 