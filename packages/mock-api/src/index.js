import cors from "cors";
import express from "express";
import {
  coupons,
  createId,
  drivers,
  favorites,
  getUserByToken,
  now,
  passwords,
  places,
  rides,
  sessions,
  sosAlerts,
  tickets,
  transactions,
  users,
  wallets,
} from "./store.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  req.user = user;
  req.token = token;
  next();
}

function categoryQuotes(distanceKm) {
  const base = Math.max(8, distanceKm * 3.2);
  return [
    { id: "economico", name: "Econômico", capacity: 4, price: +(base * 1).toFixed(2), etaMin: 3, icon: "car" },
    { id: "comfort", name: "Comfort", capacity: 4, price: +(base * 1.35).toFixed(2), etaMin: 4, icon: "car" },
    { id: "suv", name: "SUV", capacity: 6, price: +(base * 1.75).toFixed(2), etaMin: 6, icon: "suv" },
    { id: "moto", name: "Moto", capacity: 1, price: +(base * 0.7).toFixed(2), etaMin: 2, icon: "moto" },
  ];
}

function enrichRide(ride) {
  const client = users.find((u) => u.id === ride.clientId);
  const driver = ride.driverId ? drivers.find((d) => d.userId === ride.driverId) : undefined;
  const driverUser = ride.driverId ? users.find((u) => u.id === ride.driverId) : undefined;
  return {
    ...ride,
    clientName: client?.name,
    driverName: driverUser?.name,
    driverRating: driverUser?.rating,
    vehicle: driver?.vehicle,
  };
}

app.get("/health", (_req, res) => res.json({ ok: true, brand: "vaijá" }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === String(email || "").toLowerCase());
  if (!user || passwords[user.email] !== password) {
    return res.status(401).json({ error: "E-mail ou senha inválidos" });
  }
  if (user.blocked) {
    return res.status(403).json({ error: "Conta bloqueada" });
  }
  const token = createId("tok");
  sessions[token] = user.id;
  const driver = drivers.find((d) => d.userId === user.id);
  res.json({ token, user, driver });
});

app.post("/auth/register", (req, res) => {
  const { name, email, phone, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Dados incompletos" });
  }
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }
  const user = {
    id: createId("u"),
    name,
    email,
    phone: phone || "",
    role: role === "motorista" ? "motorista" : "cliente",
    referralCode: `${String(name).split(" ")[0].toUpperCase()}10`,
    rating: 5,
  };
  users.push(user);
  passwords[email] = password;
  wallets.push({
    userId: user.id,
    balance: 0,
    methods: [{ id: createId("pm"), type: "pix", label: "PIX", selected: true }],
  });
  if (user.role === "motorista") {
    drivers.push({
      userId: user.id,
      online: false,
      vehicle: { model: "A definir", color: "-", plate: "-" },
      documentsApproved: false,
      earningsToday: 0,
      earningsWeek: 0,
      lat: -23.55,
      lng: -46.63,
    });
  }
  const token = createId("tok");
  sessions[token] = user.id;
  res.json({ token, user, driver: drivers.find((d) => d.userId === user.id) });
});

app.get("/auth/me", auth, (req, res) => {
  res.json(req.user);
});

app.get("/categories", auth, (req, res) => {
  const distanceKm = Number(req.query.distanceKm || 5);
  res.json(categoryQuotes(distanceKm));
});

app.get("/favorites", auth, (req, res) => {
  res.json(favorites.filter((f) => f.userId === req.user.id));
});

app.post("/favorites", auth, (req, res) => {
  const place = req.body;
  const fav = { id: createId("f"), userId: req.user.id, place: { ...place, id: place.id || createId("p") } };
  favorites.push(fav);
  res.json(fav);
});

app.get("/wallet", auth, (req, res) => {
  let wallet = wallets.find((w) => w.userId === req.user.id);
  if (!wallet) {
    wallet = { userId: req.user.id, balance: 0, methods: [] };
    wallets.push(wallet);
  }
  res.json(wallet);
});

app.post("/wallet/select", auth, (req, res) => {
  const wallet = wallets.find((w) => w.userId === req.user.id);
  if (!wallet) return res.status(404).json({ error: "Carteira não encontrada" });
  wallet.methods = wallet.methods.map((m) => ({
    ...m,
    selected: m.id === req.body.methodId,
  }));
  res.json(wallet);
});

app.post("/wallet/add", auth, (req, res) => {
  const wallet = wallets.find((w) => w.userId === req.user.id);
  if (!wallet) return res.status(404).json({ error: "Carteira não encontrada" });
  const amount = Number(req.body.amount || 0);
  wallet.balance += amount;
  transactions.push({
    id: createId("t"),
    userId: req.user.id,
    type: "credito",
    amount,
    description: "Adicionar saldo",
    createdAt: now(),
  });
  res.json(wallet);
});

app.get("/coupons", auth, (_req, res) => {
  res.json(coupons.filter((c) => c.active));
});

app.post("/coupons/apply", auth, (req, res) => {
  const coupon = coupons.find(
    (c) => c.code.toUpperCase() === String(req.body.code || "").toUpperCase() && c.active
  );
  if (!coupon) return res.status(404).json({ error: "Cupom inválido" });
  res.json(coupon);
});

app.post("/coupons", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const coupon = {
    id: createId("c"),
    code: String(req.body.code || "").toUpperCase(),
    description: req.body.description || "",
    discountPercent: Number(req.body.discountPercent || 10),
    expiresAt: req.body.expiresAt || "2026-12-31",
    active: true,
  };
  coupons.push(coupon);
  res.json(coupon);
});

app.get("/rides/pending", auth, (req, res) => {
  if (req.user.role === "motorista") {
    const pending = rides.find((r) => r.status === "solicitada");
    return res.json(pending ? enrichRide(pending) : null);
  }
  const mine = rides.find(
    (r) => r.clientId === req.user.id && !["concluida", "cancelada"].includes(r.status)
  );
  res.json(mine ? enrichRide(mine) : null);
});

app.get("/rides", auth, (req, res) => {
  let list = [...rides];
  if (req.query.mine === "1") {
    if (req.user.role === "cliente") list = list.filter((r) => r.clientId === req.user.id);
    else if (req.user.role === "motorista") list = list.filter((r) => r.driverId === req.user.id);
  }
  if (req.query.status) {
    const statuses = String(req.query.status).split(",");
    list = list.filter((r) => statuses.includes(r.status));
  }
  list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  res.json(list.map(enrichRide));
});

app.get("/rides/:id", auth, (req, res) => {
  const ride = rides.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: "Corrida não encontrada" });
  res.json(enrichRide(ride));
});

app.post("/rides", auth, (req, res) => {
  if (req.user.role !== "cliente") return res.status(403).json({ error: "Apenas clientes" });

  const active = rides.find(
    (r) => r.clientId === req.user.id && !["concluida", "cancelada"].includes(r.status)
  );
  if (active) return res.status(400).json({ error: "Você já tem uma corrida ativa" });

  const origin = req.body.origin;
  const destination = req.body.destination;
  const category = req.body.category || "economico";
  const quotes = categoryQuotes(5);
  const quote = quotes.find((q) => q.id === category) || quotes[0];
  let price = quote.price;
  let couponCode;
  if (req.body.couponCode) {
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === String(req.body.couponCode).toUpperCase() && c.active
    );
    if (coupon) {
      price = +(price * (1 - coupon.discountPercent / 100)).toFixed(2);
      couponCode = coupon.code;
    }
  }
  const serviceFee = 2.5;
  const wallet = wallets.find((w) => w.userId === req.user.id);
  const payment = wallet?.methods.find((m) => m.selected)?.label || "PIX";

  const ride = {
    id: createId("r"),
    clientId: req.user.id,
    status: "solicitada",
    origin,
    destination,
    category,
    price,
    serviceFee,
    total: +(price + serviceFee).toFixed(2),
    paymentMethod: req.body.paymentMethod || payment,
    couponCode,
    etaMin: quote.etaMin,
    distanceKm: 4.2,
    createdAt: now(),
    updatedAt: now(),
  };
  rides.push(ride);
  res.status(201).json(enrichRide(ride));
});

app.patch("/rides/:id", auth, (req, res) => {
  const ride = rides.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: "Corrida não encontrada" });

  const { status, rating, comment } = req.body || {};

  if (status === "aceita") {
    if (req.user.role !== "motorista") return res.status(403).json({ error: "Apenas motorista" });
    if (ride.status !== "solicitada") return res.status(400).json({ error: "Corrida indisponível" });
    ride.driverId = req.user.id;
    ride.status = "aceita";
  } else if (status === "a_caminho") {
    if (req.user.id !== ride.driverId) return res.status(403).json({ error: "Não autorizado" });
    ride.status = "a_caminho";
  } else if (status === "em_andamento") {
    if (req.user.id !== ride.driverId) return res.status(403).json({ error: "Não autorizado" });
    ride.status = "em_andamento";
  } else if (status === "concluida") {
    if (req.user.id !== ride.driverId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }
    ride.status = "concluida";
    const driverWallet = wallets.find((w) => w.userId === ride.driverId);
    const driverEarn = +(ride.price * 0.8).toFixed(2);
    if (driverWallet) driverWallet.balance += driverEarn;
    const driver = drivers.find((d) => d.userId === ride.driverId);
    if (driver) {
      driver.earningsToday += driverEarn;
      driver.earningsWeek += driverEarn;
    }
    transactions.push({
      id: createId("t"),
      rideId: ride.id,
      userId: ride.clientId,
      type: "corrida",
      amount: -ride.total,
      description: `Corrida até ${ride.destination.label}`,
      createdAt: now(),
    });
    transactions.push({
      id: createId("t"),
      rideId: ride.id,
      userId: ride.driverId,
      type: "credito",
      amount: driverEarn,
      description: `Ganho — ${ride.destination.label}`,
      createdAt: now(),
    });
    transactions.push({
      id: createId("t"),
      rideId: ride.id,
      userId: "u-admin",
      type: "taxa",
      amount: ride.serviceFee + +(ride.price * 0.2).toFixed(2),
      description: "Taxa plataforma",
      createdAt: now(),
    });
  } else if (status === "cancelada") {
    if (req.user.id !== ride.clientId && req.user.id !== ride.driverId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }
    ride.status = "cancelada";
  }

  if (typeof rating === "number") {
    ride.rating = rating;
    ride.comment = comment;
  }

  ride.updatedAt = now();
  res.json(enrichRide(ride));
});

app.post("/drivers/status", auth, (req, res) => {
  const driver = drivers.find((d) => d.userId === req.user.id);
  if (!driver) return res.status(404).json({ error: "Motorista não encontrado" });
  driver.online = Boolean(req.body.online);
  res.json(driver);
});

app.get("/drivers", auth, (_req, res) => {
  const list = drivers.map((d) => ({
    ...d,
    user: users.find((u) => u.id === d.userId),
  }));
  res.json(list);
});

app.post("/drivers/:userId/approve", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const driver = drivers.find((d) => d.userId === req.params.userId);
  if (!driver) return res.status(404).json({ error: "Não encontrado" });
  driver.documentsApproved = Boolean(req.body.approved);
  res.json(driver);
});

app.get("/users", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  res.json(users.filter((u) => u.role !== "admin"));
});

app.post("/users/:id/block", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "Não encontrado" });
  target.blocked = Boolean(req.body.blocked);
  res.json(target);
});

app.get("/admin/dashboard", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const activeStatuses = ["solicitada", "aceita", "a_caminho", "em_andamento"];
  const revenueToday = transactions
    .filter((t) => t.type === "taxa")
    .reduce((s, t) => s + t.amount, 0);
  res.json({
    activeRides: rides.filter((r) => activeStatuses.includes(r.status)).length,
    revenueToday: +revenueToday.toFixed(2),
    driversOnline: drivers.filter((d) => d.online).length,
    openSos: sosAlerts.filter((s) => s.status === "aberto").length,
    openTickets: tickets.filter((t) => t.status !== "resolvido").length,
    totalClients: users.filter((u) => u.role === "cliente").length,
    totalDrivers: users.filter((u) => u.role === "motorista").length,
  });
});

app.get("/transactions", auth, (req, res) => {
  let list = [...transactions];
  if (req.user.role !== "admin") list = list.filter((t) => t.userId === req.user.id);
  list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  res.json(list);
});

app.get("/support", auth, (req, res) => {
  let list = [...tickets];
  if (req.user.role !== "admin") list = list.filter((t) => t.userId === req.user.id);
  res.json(list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
});

app.post("/support", auth, (req, res) => {
  const ticket = {
    id: createId("tk"),
    userId: req.user.id,
    userName: req.user.name,
    category: req.body.category || "Geral",
    subject: req.body.subject || "Ajuda",
    message: req.body.message || "",
    status: "aberto",
    createdAt: now(),
  };
  tickets.push(ticket);
  res.status(201).json(ticket);
});

app.patch("/support/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Não encontrado" });
  ticket.status = req.body.status;
  res.json(ticket);
});

app.get("/sos", auth, (req, res) => {
  let list = [...sosAlerts];
  if (req.user.role !== "admin") list = list.filter((s) => s.userId === req.user.id);
  res.json(list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
});

app.post("/sos", auth, (req, res) => {
  const alert = {
    id: createId("sos"),
    userId: req.user.id,
    userName: req.user.name,
    rideId: req.body.rideId,
    status: "aberto",
    createdAt: now(),
    lat: req.body.lat ?? -23.55,
    lng: req.body.lng ?? -46.63,
  };
  sosAlerts.push(alert);
  res.status(201).json(alert);
});

app.patch("/sos/:id", auth, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  const alert = sosAlerts.find((s) => s.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Não encontrado" });
  alert.status = "atendido";
  res.json(alert);
});

app.get("/places", auth, (_req, res) => {
  res.json(places);
});

app.listen(PORT, () => {
  console.log(`vaijá mock-api rodando em http://localhost:${PORT}`);
});
