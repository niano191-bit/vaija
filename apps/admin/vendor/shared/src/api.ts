import type {
  AuthResponse,
  Coupon,
  DashboardStats,
  Favorite,
  Ride,
  SosAlert,
  SupportTicket,
  Transaction,
  User,
  Wallet,
  DriverProfile,
  CategoryQuote,
  RideStatus,
  VehicleCategory,
  Place,
} from "./types";
import { API_BASE_URL } from "./tokens";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Erro na requisição");
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean; brand?: string; supabase?: boolean }>("/health"),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  register: (data: { name: string; email: string; phone: string; password: string; role?: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: data }),

  me: (token: string) => request<User>("/auth/me", { token }),

  updateProfile: (token: string, data: { name?: string; phone?: string }) =>
    request<User>("/auth/me", { method: "PATCH", body: data, token }),

  getCategories: (token: string, distanceKm = 5) =>
    request<CategoryQuote[]>(`/categories?distanceKm=${distanceKm}`, { token }),

  getFavorites: (token: string) => request<Favorite[]>("/favorites", { token }),

  addFavorite: (token: string, place: Place) =>
    request<Favorite>("/favorites", { method: "POST", body: place, token }),

  getWallet: (token: string) => request<Wallet>("/wallet", { token }),

  selectPayment: (token: string, methodId: string) =>
    request<Wallet>("/wallet/select", { method: "POST", body: { methodId }, token }),

  addPaymentMethod: (
    token: string,
    data: { type: "pix" | "visa" | "mastercard"; label?: string; selected?: boolean }
  ) => request<Wallet>("/wallet/methods", { method: "POST", body: data, token }),

  addBalance: (token: string, amount: number) =>
    request<Wallet>("/wallet/add", { method: "POST", body: { amount }, token }),

  getCoupons: (token: string) => request<Coupon[]>("/coupons", { token }),

  applyCoupon: (token: string, code: string) =>
    request<Coupon>("/coupons/apply", { method: "POST", body: { code }, token }),

  createCoupon: (token: string, data: Partial<Coupon>) =>
    request<Coupon>("/coupons", { method: "POST", body: data, token }),

  updateCoupon: (token: string, data: { id: string; active: boolean }) =>
    request<Coupon>("/coupons", { method: "PATCH", body: data, token }),

  createRide: (
    token: string,
    data: {
      origin: Place;
      destination: Place;
      category: VehicleCategory;
      couponCode?: string;
      paymentMethod?: string;
    }
  ) => request<Ride>("/rides", { method: "POST", body: data, token }),

  getRides: (token: string, params?: { status?: string; mine?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.mine) q.set("mine", "1");
    const qs = q.toString();
    return request<Ride[]>(`/rides${qs ? `?${qs}` : ""}`, { token });
  },

  getRide: (token: string, id: string) => request<Ride>(`/rides/${id}`, { token }),

  updateRide: (token: string, id: string, data: { status?: RideStatus; rating?: number; comment?: string }) =>
    request<Ride>(`/rides/${id}`, { method: "PATCH", body: data, token }),

  getPendingRide: (token: string) => request<Ride | null>("/rides/pending", { token }),

  setDriverOnline: (token: string, online: boolean) =>
    request<DriverProfile>("/drivers/status", { method: "POST", body: { online }, token }),

  getDrivers: (token: string) => request<(DriverProfile & { user: User })[]>("/drivers", { token }),

  getUsers: (token: string) => request<User[]>("/users", { token }),

  blockUser: (token: string, userId: string, blocked: boolean) =>
    request<User>(`/users/${userId}/block`, { method: "POST", body: { blocked }, token }),

  approveDriver: (token: string, userId: string, approved: boolean) =>
    request<DriverProfile>(`/drivers/${userId}/approve`, {
      method: "POST",
      body: { approved },
      token,
    }),

  getDashboard: (token: string) => request<DashboardStats>("/admin/dashboard", { token }),

  getTransactions: (token: string) => request<Transaction[]>("/transactions", { token }),

  getTickets: (token: string) => request<SupportTicket[]>("/support", { token }),

  createTicket: (token: string, data: { category: string; subject: string; message: string }) =>
    request<SupportTicket>("/support", { method: "POST", body: data, token }),

  updateTicket: (token: string, id: string, status: SupportTicket["status"]) =>
    request<SupportTicket>(`/support/${id}`, { method: "PATCH", body: { status }, token }),

  getSos: (token: string) => request<SosAlert[]>("/sos", { token }),

  createSos: (token: string, data?: { rideId?: string; lat?: number; lng?: number }) =>
    request<SosAlert>("/sos", { method: "POST", body: data || {}, token }),

  resolveSos: (token: string, id: string) =>
    request<SosAlert>(`/sos/${id}`, { method: "PATCH", body: { status: "atendido" }, token }),
};
