// ===========================================
// src/store/slices/transactionSlice.ts
// ===========================================
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { Transaction, TransactionStats } from "../../types";

interface TransactionState {
  transactions: Transaction[];
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  stats: null,
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (filters?: {
    type?: string;
    status?: string;
    payment_method?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.payment_method)
      params.append("payment_method", filters.payment_method);

    const response = await api.get(`/transactions/?${params.toString()}`);
    return response.data.results || response.data;
  }
);

export const fetchTransactionStats = createAsyncThunk(
  "transactions/fetchStats",
  async () => {
    const response = await api.get("/transactions/stats/");
    return response.data.data;
  }
);

export const initiatePayment = createAsyncThunk(
  "transactions/initiatePayment",
  async (
    data: { amount: string; payment_method: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/payments/initiate/", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Erreur de paiement"
      );
    }
  }
);

export const initiatePayout = createAsyncThunk(
  "transactions/initiatePayout",
  async (
    data: {
      amount: string;
      recipient_phone: string;
      payment_method: string;
      description?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/payments/payout/", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Erreur de retrait"
      );
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur de chargement";
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(initiatePayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayout.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initiatePayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
