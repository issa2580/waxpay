// ===========================================
// constants/api.ts
// ===========================================
export const API_BASE_URL = __DEV__
  ? "https://4c21f1e8ea4c.ngrok-free.app/api"
  : "https://api.waxipay.sn/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register/",
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/token/refresh/",
    PROFILE: "/auth/profile/",
    WALLET: "/auth/wallet/",
    SEND_OTP: "/auth/send-otp/",
    VERIFY_OTP: "/auth/verify-otp/",
  },
  TRANSACTIONS: {
    LIST: "/transactions/",
    DETAIL: (id: string) => `/transactions/${id}/`,
    STATS: "/transactions/stats/",
  },
  PAYMENTS: {
    INITIATE: "/payments/initiate/",
    PAYOUT: "/payments/payout/",
    VERIFY: (id: string) => `/payments/verify/${id}/`,
  },
};
