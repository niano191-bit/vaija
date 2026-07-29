import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, formatBRL, formatDate, STATUS_LABELS, type Ride } from "@vaija/shared";
import { Screen, Title } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function AtividadeScreen() {
  const token = useAuth((s) => s.token);
  const [rides, setRides] = useState<Ride[]>([]);
  const [tab, setTab] = useState<"todos" | "corridas">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      setLoading(true);
      setRides(await api.getRides(token, { mine: true }));
    } catch (e: any) {
      setError(e.message || "Falha ao carregar atividade");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const list = rides;

  return (
    <Screen style={{ paddingTop: 56 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Title>Atividade</Title>
        <View style={styles.tabs}>
          {(["todos", "corridas"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                {t === "todos" ? "Todos" : "Corridas"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {error ? (
          <Pressable onPress={load}>
            <Text style={styles.error}>{error} · tocar para tentar de novo</Text>
          </Pressable>
        ) : null}
        {loading ? <Text style={styles.empty}>Carregando...</Text> : null}
        {!loading && !error && list.length === 0 ? (
          <Text style={styles.empty}>Nenhuma corrida ainda</Text>
        ) : null}
        {!loading
          ? list.map((r) => (
              <View key={r.id} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dest}>{r.destination.label}</Text>
                  <Text style={styles.meta}>{formatDate(r.createdAt)}</Text>
                  <Text style={styles.status}>{STATUS_LABELS[r.status] || r.status}</Text>
                </View>
                <Text style={styles.price}>{formatBRL(r.total)}</Text>
              </View>
            ))
          : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 8, marginTop: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.gray },
  tabOn: { backgroundColor: theme.colors.navy },
  tabText: { color: theme.colors.textMuted, fontWeight: "600", fontSize: 13 },
  tabTextOn: { color: theme.colors.white },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  dest: { fontWeight: "700", color: theme.colors.navy },
  meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  status: { color: theme.colors.green, fontSize: 12, fontWeight: "600", marginTop: 4 },
  price: { fontWeight: "800", color: theme.colors.navy },
  empty: { color: theme.colors.textMuted, textAlign: "center", marginTop: 40 },
  error: { color: theme.colors.danger, textAlign: "center", fontWeight: "600", marginTop: 20 },
});
