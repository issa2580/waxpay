// ===========================================
// services/api.ts
// ===========================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "../constants/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const tokensString = await AsyncStorage.getItem("tokens");
        if (tokensString) {
          const tokens = JSON.parse(tokensString);
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokensString = await AsyncStorage.getItem("tokens");
            if (tokensString) {
              const tokens = JSON.parse(tokensString);
              const response = await axios.post(
                `${API_BASE_URL}/auth/token/refresh/`,
                { refresh: tokens.refresh }
              );

              const newTokens = { ...tokens, access: response.data.access };
              await AsyncStorage.setItem("tokens", JSON.stringify(newTokens));

              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            await AsyncStorage.multiRemove(["tokens", "user"]);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getInstance() {
    return this.api;
  }
}

export default new ApiService().getInstance();
