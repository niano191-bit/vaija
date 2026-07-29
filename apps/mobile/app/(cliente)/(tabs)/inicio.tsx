import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type CategoryQuote, type Place } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../../src/components/ui";
import { getCurrentPlace } from "../../../src/geo";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

const QUICK: Place[] = [
  { id: "p-home", label: "Casa", address: "Rua das Flores, 120", lat: -23.5615, lng: -46.691, icon: "home" },
  { id: "p-work", label: "Trabalho", address: "Av. Paulista, 1000", lat: -23.5614, lng: -46.6559, icon: "work" },
  { id: "p-airport", label: "Aeroporto", address: "Congonhas — SP", lat: -23.6261, lng: -46.6566, icon: "airport" },
];

export default function InicioScreen() {
  const router = useRouter();
  const { user, token, setBooking, activeRideId, setActiveRideId } = useAuth();
  const [categories, setCategories] = useState<CategoryQuote[]>([]);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getCategories(token).then(setCategories).catch(() => {});
    api
      .getFavorites(token)
      .then((list) => setFavorites(list.map((f) => f.place)))
      .catch(() => {});
    api
      .getPendingRide(token)
      .then((ride) => {
        if (!ride) {
          setActiveStatus(null);
          return;
        }
        setActiveRideId(ride.id);
        setActiveStatus(ride.status);
      })
      .catch(() => {});
  }, [token]);

  const quickPlaces = useMemo(() => {
    if (!favorites.length) return QUICK;
    const merged = [...favorites];
    for (const q of QUICK) {
      if (merged.length >= 3) break;
      if (!merged.some((p) => p.label === q.label)) merged.push(q);
    }
    return merged.slice(0, 3);
  }, [favorites]);

  const openActiveRide = () => {
    if (!activeStatus) {
      router.push("/(cliente)/aguardando");
      return;
    }
    if (activeStatus === "em_andamento") router.push("/(cliente)/corrida");
    else if (activeStatus === "concluida") router.push("/(cliente)/concluida");
    else router.push("/(cliente)/aguardando");
  };

  const goDestino = async (place?: Place) => {
    const origin = await getCurrentPlace();
    setBooking({
      origin,
      destination: place,
    });
    if (place) {
      router.push("/(cliente)/categoria");
      return;
    }
    router.push("/(cliente)/destino");
  };

  const iconFor = (p: Place) => {
    if (p.icon === "home" || p.label.toLowerCase().includes("casa")) return "home" as const;
    if (p.icon === "work" || p.label.toLowerCase().includes("trabalho")) return "briefcase" as const;
    if (p.icon === "airport" || p.label.toLowerCase().includes("aeroporto")) return "airplane" as const;
    return "heart" as const;
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.hero}>
          <MapPlaceholder height={260} label="São Paulo" />
          <View style={styles.greeting}>
            <Text style={styles.hello}>Olá, {user?.name?.split(" ")[0] || "você"}!</Text>
            <Pressable style={styles.search} onPress={() => goDestino()}>
              <Ionicons name="search" size={18} color={theme.colors.textMuted} />
              <Text style={styles.searchText}>Para onde vamos hoje?</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          {quickPlaces.map((p) => (
            <Pressable key={p.id} style={styles.quick} onPress={() => goDestino(p)}>
              <View style={styles.quickIcon}>
                <Ionicons name={iconFor(p)} size={18} color={theme.colors.navy} />
              </View>
              <View>
                <Text style={styles.quickLabel}>{p.label}</Text>
                <Text style={styles.quickAddr}>{p.address}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.catTitle}>Categorias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
          {(categories.length ? categories : [
            { id: "economico", name: "Econômico", price: 18.5, etaMin: 3, capacity: 4, icon: "car" },
            { id: "comfort", name: "Comfort", price: 24.9, etaMin: 4, capacity: 4, icon: "car" },
            { id: "suv", name: "SUV", price: 32.9, etaMin: 6, capacity: 6, icon: "suv" },
            { id: "moto", name: "Moto", price: 12.9, etaMin: 2, capacity: 1, icon: "moto" },
          ]).map((c) => (
            <Pressable
              key={c.id}
              style={styles.catCard}
              onPress={async () => {
                const origin = await getCurrentPlace();
                setBooking({
                  origin,
                  category: c.id as any,
                });
                router.push("/(cliente)/destino");
              }}
            >
              <Ionicons name="car-sport-outline" size={28} color={theme.colors.navy} />
              <Text style={styles.catName}>{c.name}</Text>
              <Text style={styles.catPrice}>{formatBRL(c.price)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {activeRideId ? (
          <View style={styles.activeBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Corrida em andamento</Text>
              <Text style={styles.activeSub}>Toque para continuar de onde parou</Text>
            </View>
            <Button title="Abrir" onPress={openActiveRide} style={{ minWidth: 100 }} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { position: "relative" },
  greeting: { position: "absolute", left: 16, right: 16, top: 48 },
  hello: { color: theme.colors.navy, fontWeight: "800", fontSize: 22, marginBottom: 12 },
  search: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchText: { color: theme.colors.textMuted, fontSize: 15 },
  section: { padding: 16, gap: 10 },
  quick: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontWeight: "700", color: theme.colors.navy },
  quickAddr: { color: theme.colors.textMuted, fontSize: 12 },
  catTitle: { paddingHorizontal: 16, fontWeight: "800", fontSize: 16, color: theme.colors.navy },
  cats: { padding: 16, gap: 12 },
  catCard: {
    width: 120,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  catName: { fontWeight: "700", color: theme.colors.navy },
  catPrice: { color: theme.colors.blue, fontWeight: "700" },
  activeBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeTitle: { color: theme.colors.yellow, fontWeight: "800", fontSize: 15 },
  activeSub: { color: "rgba(255,255,255,0.7)", marginTop: 2, fontSize: 12 },
});
