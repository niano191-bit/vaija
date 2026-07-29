import { randomUUID } from "crypto";

const now = () => new Date().toISOString();

export const places = [
  {
    id: "p-home",
    label: "Casa",
    address: "Rua das Flores, 120 — Pinheiros",
    lat: -23.5615,
    lng: -46.691,
    icon: "home",
  },
  {
    id: "p-work",
    label: "Trabalho",
    address: "Av. Paulista, 1000 — Bela Vista",
    lat: -23.5614,
    lng: -46.6559,
    icon: "work",
  },
  {
    id: "p-airport",
    label: "Aeroporto",
    address: "Aeroporto de Congonhas — SP",
    lat: -23.6261,
    lng: -46.6566,
    icon: "airport",
  },
  {
    id: "p-morumbi",
    label: "Shopping Morumbi",
    address: "Av. Roque Petroni Júnior, 1089",
    lat: -23.6226,
    lng: -46.6986,
    icon: "pin",
  },
  {
    id: "p-ibirapuera",
    label: "Parque Ibirapuera",
    address: "Av. Pedro Álvares Cabral — SP",
    lat: -23.5873,
    lng: -46.6576,
    icon: "pin",
  },
];

export const users = [
  {
    id: "u-lucas",
    name: "Lucas Oliveira",
    email: "lucas@vaija.com",
    phone: "(11) 98888-0001",
    role: "cliente",
    referralCode: "LUCAS10",
    rating: 4.9,
  },
  {
    id: "u-carlos",
    name: "Carlos Silva",
    email: "carlos@vaija.com",
    phone: "(11) 97777-0002",
    role: "motorista",
    rating: 4.9,
  },
  {
    id: "u-admin",
    name: "Admin Vaijá",
    email: "admin@vaija.com",
    phone: "(11) 90000-0000",
    role: "admin",
  },
];

export const passwords = {
  "lucas@vaija.com": "123456",
  "carlos@vaija.com": "123456",
  "admin@vaija.com": "123456",
};

export const drivers = [
  {
    userId: "u-carlos",
    online: false,
    vehicle: {
      model: "Chevrolet Onix",
      color: "Prata",
      plate: "ABC1D23",
    },
    documentsApproved: true,
    earningsToday: 186.5,
    earningsWeek: 1240.0,
    lat: -23.56,
    lng: -46.66,
  },
];

export const wallets = [
  {
    userId: "u-lucas",
    balance: 120.5,
    methods: [
      { id: "pm-pix", type: "pix", label: "PIX", selected: true },
      { id: "pm-visa", type: "visa", label: "Visa •••• 4242", selected: false },
      { id: "pm-master", type: "mastercard", label: "Mastercard •••• 8899", selected: false },
    ],
  },
  {
    userId: "u-carlos",
    balance: 980.0,
    methods: [{ id: "pm-pix-d", type: "pix", label: "PIX", selected: true }],
  },
];

export const coupons = [
  {
    id: "c1",
    code: "VAIJA10",
    description: "10% OFF na próxima corrida",
    discountPercent: 10,
    expiresAt: "2026-12-31",
    active: true,
  },
  {
    id: "c2",
    code: "VAIJA20",
    description: "20% OFF até R$ 15",
    discountPercent: 20,
    expiresAt: "2026-09-30",
    active: true,
  },
];

export const favorites = [
  { id: "f1", userId: "u-lucas", place: places[0] },
  { id: "f2", userId: "u-lucas", place: places[1] },
  { id: "f3", userId: "u-lucas", place: places[2] },
];

export const rides = [
  {
    id: "r-hist-1",
    clientId: "u-lucas",
    driverId: "u-carlos",
    status: "concluida",
    origin: places[0],
    destination: places[3],
    category: "economico",
    price: 18.5,
    serviceFee: 2.5,
    total: 21.0,
    paymentMethod: "PIX",
    etaMin: 3,
    distanceKm: 4.2,
    createdAt: "2026-07-27T14:30:00.000Z",
    updatedAt: "2026-07-27T15:00:00.000Z",
    rating: 5,
  },
  {
    id: "r-hist-2",
    clientId: "u-lucas",
    driverId: "u-carlos",
    status: "concluida",
    origin: places[1],
    destination: places[4],
    category: "comfort",
    price: 24.9,
    serviceFee: 2.5,
    total: 27.4,
    paymentMethod: "Visa",
    etaMin: 5,
    distanceKm: 3.1,
    createdAt: "2026-07-26T10:00:00.000Z",
    updatedAt: "2026-07-26T10:40:00.000Z",
    rating: 4,
  },
];

export const tickets = [];
export const sosAlerts = [];
export const transactions = [
  {
    id: "t1",
    rideId: "r-hist-1",
    userId: "u-lucas",
    type: "corrida",
    amount: -21.0,
    description: "Corrida até Shopping Morumbi",
    createdAt: "2026-07-27T15:00:00.000Z",
  },
  {
    id: "t2",
    rideId: "r-hist-1",
    userId: "u-carlos",
    type: "credito",
    amount: 16.8,
    description: "Ganho — Shopping Morumbi",
    createdAt: "2026-07-27T15:00:00.000Z",
  },
];

export const sessions = {};

export function createId(prefix = "id") {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function getUserByToken(token) {
  if (!token) return undefined;
  const userId = sessions[token];
  return users.find((u) => u.id === userId);
}

export { now };
