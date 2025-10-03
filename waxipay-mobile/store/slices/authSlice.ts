// ===========================================
// store/slices/authSlice.ts
// ===========================================
import api from "@/services/api";
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  tokens: {
    access: string;
    refresh: string;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { phone_number, password }: { phone_number: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/login/", {
        phone_number,
        password,
      });
      await AsyncStorage.setItem(
        "tokens",
        JSON.stringify(response.data.tokens)
      );
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Erreur de connexion"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register/", userData);
      await AsyncStorage.setItem(
        "tokens",
        JSON.stringify(response.data.tokens)
      );
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Erreur d'inscription"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      await api.post("/auth/logout/", {
        refresh: state.auth.tokens?.refresh,
      });
      await AsyncStorage.multiRemove(["tokens", "user"]);
    } catch (error) {
      console.error("Logout error:", error);
      await AsyncStorage.multiRemove(["tokens", "user"]);
    }
  }
);

export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const tokensString = await AsyncStorage.getItem("tokens");
  const userString = await AsyncStorage.getItem("user");

  if (tokensString && userString) {
    return {
      tokens: JSON.parse(tokensString),
      user: JSON.parse(userString),
    };
  }
  throw new Error("No user found");
});

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async () => {
  const response = await api.get("/auth/profile/");
  await AsyncStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
