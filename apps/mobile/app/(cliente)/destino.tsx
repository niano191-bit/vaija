import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Favorite, type Place } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
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

async function searchPlaces(query: string): Promise<Place[]> {
  const q = encodeURIComponent(`${query}, São Paulo, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=br&q=${q}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR",
    },
  });
  if (!res.ok) throw new Error("Falha na busca de endereço");
  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
  }>;
  return data.map((item) => {
    const parts = item.display_name.split(",");
    const label = (item.name || parts[0] || query).trim();
    return {
      id: `geo-${item.place_id}`,
      label,
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      icon: "pin" as const,
    };
  });
}

export default function DestinoScreen() {
  const router = useRouter();
  const { token, booking, setBooking } = useAuth();
  const [query, setQuery] = useState(booking.destination?.label || "");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getFavorites(token).then(setFavorites).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(() => {
      searchPlaces(q)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 450);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

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

  const confirmTyped = async () => {
    const label = query.trim();
    if (label.length < 2 || confirming) return;
    try {
      setConfirming(true);
      const found = suggestions[0] || (await searchPlaces(label))[0];
      if (found) {
        select(found);
        return;
      }
      Alert.alert(
        "Endereço não encontrado",
        "Não achamos esse local. Tente um nome mais completo (bairro/rua) ou escolha um salvo.",
      );
    } catch (e: any) {
      Alert.alert("Busca", e.message || "Não foi possível buscar o endereço agora.");
    } finally {
      setConfirming(false);
    }
  };

  const filteredRecent = RECENT.filter(
    (p) => !query || p.label.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredSaved = saved.filter(
    (p) =>
      !query ||
      p.label.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase()),
  );
  const showTyped = query.trim().length >= 2;

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
            onSubmitEditing={confirmTyped}
            returnKeyType="done"
          />
          {searching ? <ActivityIndicator color={theme.colors.navy} /> : null}
        </View>
        {showTyped ? (
          <Button
            title={confirming ? "Buscando..." : `Ir para “${query.trim()}”`}
            onPress={confirmTyped}
            loading={confirming}
            style={{ marginTop: 12 }}
          />
        ) : null}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
        {suggestions.length > 0 ? (
          <>
            <Text style={styles.section}>Resultados</Text>
            {suggestions.map((p) => (
              <Pressable key={p.id} style={styles.row} onPress={() => select(p)}>
                <Ionicons name="navigate-outline" size={18} color={theme.colors.navy} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{p.label}</Text>
                  <Text style={styles.addr} numberOfLines={2}>
                    {p.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}

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
