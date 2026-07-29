import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Favorite, type Place } from "@vaija/shared";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

const FALLBACK_SAVED: Place[] = [
  { id: "p-home", label: "Casa", address: "Rua das Flores, 120 — Pinheiros", lat: -23.5615, lng: -46.691, icon: "home" },
  { id: "p-work", label: "Trabalho", address: "Av. Paulista, 1000", lat: -23.5614, lng: -46.6559, icon: "work" },
  { id: "p-airport", label: "Aeroporto", address: "Congonhas — SP", lat: -23.6261, lng: -46.6566, icon: "airport" },
];

const RECENT: Place[] = [
  { id: "p-morumbi", label: "Shopping Morumbi", address: "Av. Roque Petroni Júnior, 1089", lat: -23.6226, lng: -46.6986 },
  { id: "p-ibirapuera", label: "Parque Ibirapuera", address: "Av. Pedro Álvares Cabral", lat: -23.5873, lng: -46.6576 },
];

export default function DestinoScreen() {
  const router = useRouter();
  const { token, booking, setBooking } = useAuth();
  const [query, setQuery] = useState(booking.destination?.label || "");
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getFavorites(token).then(setFavorites).catch(() => {});
  }, [token]);

  const saved = useMemo(() => {
    if (favorites.length) {
      return favorites.map((f) => f.place);
    }
    return FALLBACK_SAVED;
  }, [favorites]);

  const select = (place: Place) => {
    setBooking({ destination: place });
    router.push("/(cliente)/categoria");
  };

  const filteredRecent = RECENT.filter(
    (p) => !query || p.label.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredSaved = saved.filter(
    (p) => !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Para onde?</Title>
        <View style={styles.field}>
          <Ionicons name="radio-button-on" size={16} color={theme.colors.blue} />
          <Text style={styles.fieldText}>{booking.origin?.label || "Meu local"}</Text>
        </View>
        <View style={styles.field}>
          <Ionicons name="location" size={16} color={theme.colors.yellow} />
          <TextInput
            style={styles.input}
            placeholder="Digite o destino"
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
        <Text style={styles.section}>Salvos</Text>
        {filteredSaved.map((p) => (
          <Pressable key={p.id} style={styles.row} onPress={() => select(p)}>
            <Ionicons name="bookmark-outline" size={18} color={theme.colors.navy} />
            <View>
              <Text style={styles.label}>{p.label}</Text>
              <Text style={styles.addr}>{p.address}</Text>
            </View>
          </Pressable>
        ))}
        <Text style={[styles.section, { marginTop: 12 }]}>Recentes</Text>
        {filteredRecent.map((p) => (
          <Pressable key={p.id} style={styles.row} onPress={() => select(p)}>
            <Ionicons name="time-outline" size={18} color={theme.colors.navy} />
            <View>
              <Text style={styles.label}>{p.label}</Text>
              <Text style={styles.addr}>{p.address}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.gray,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  fieldText: { color: theme.colors.navy, fontWeight: "600" },
  input: { flex: 1, color: theme.colors.navy, fontSize: 15 },
  section: { fontWeight: "800", color: theme.colors.navy, marginBottom: 4 },
  row: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 10 },
  label: { fontWeight: "700", color: theme.colors.navy },
  addr: { color: theme.colors.textMuted, fontSize: 12 },
});
