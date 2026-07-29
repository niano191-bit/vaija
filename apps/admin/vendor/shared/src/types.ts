export type UserRole = "cliente" | "motorista" | "admin";

export type RideStatus =
  | "solicitada"
  | "aceita"
  | "a_caminho"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export type VehicleCategory = "economico" | "comfort" | "suv" | "moto";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  blocked?: boolean;
  referralCode?: string;
  rating?: number;
}

export interface DriverProfile {
  userId: string;
  online: boolean;
  vehicle: {
    model: string;
    color: string;
    plate: string;
  };
  documentsApproved: boolean;
  earningsToday: number;
  earningsWeek: number;
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  icon?: "home" | "work" | "airport" | "pin";
}

export interface CategoryQuote {
  id: VehicleCategory;
  name: string;
  capacity: number;
  price: number;
  etaMin: number;
  icon: string;
}

export interface Ride {
  id: string;
  clientId: string;
  driverId?: string;
  status: RideStatus;
  origin: Place;
  destination: Place;
  category: VehicleCategory;
  price: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
  couponCode?: string;
  etaMin: number;
  distanceKm: number;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  driverName?: string;
  driverRating?: number;
  vehicle?: DriverProfile["vehicle"];
  rating?: number;
  comment?: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  methods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: "pix" | "visa" | "mastercard";
  label: string;
  selected: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  expiresAt: string;
  active: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  place: Place;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  category: string;
  subject: string;
  message: string;
  status: "aberto" | "em_andamento" | "resolvido";
  createdAt: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  rideId?: string;
  status: "aberto" | "atendido";
  createdAt: string;
  lat: number;
  lng: number;
}

export interface Transaction {
  id: string;
  rideId?: string;
  userId: string;
  type: "corrida" | "taxa" | "credito" | "saque";
  amount: number;
  description: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  driver?: DriverProfile;
}

export interface DashboardStats {
  activeRides: number;
  revenueToday: number;
  driversOnline: number;
  openSos: number;
  openTickets: number;
  totalClients: number;
  totalDrivers: number;
}
