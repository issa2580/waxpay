// ===========================================
// store/slices/walletSlice.ts
// ===========================================
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { Wallet } from "../../types";

interface WalletState {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk("wallet/fetch", async () => {
  const response = await api.get("/auth/wallet/");
  return response.data;
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      if (state.wallet) {
        state.wallet.balance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
        state.loading = false;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur de chargement";
      });
  },
});

export const { updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
