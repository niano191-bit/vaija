import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, formatBRL, formatDate, type Ride, type Transaction } from "@vaija/shared";
import { Screen, Title } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function GanhosScreen() {
  const { token, driver } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([api.getRides(token, { mine: true }), api.getTransactions(token)])
      .then(([r, t]) => {
        setRides(r);
        setTxs(t);
        setError("");
      })
      .catch((e: any) => setError(e.message || "Falha ao carregar ganhos"))
      .finally(() => setLoading(false));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const concluded = rides.filter((r) => r.status === "concluida");
  const credits = txs.filter((t) => t.type === "credito" || t.type === "corrida");

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Title>Ganhos</Title>
        {error ? (
          <Pressable onPress={load}>
            <Text style={styles.error}>{error} · tocar para tentar de novo</Text>
          </Pressable>
        ) : null}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.label}>Hoje</Text>
            <Text style={styles.value}>{formatBRL(driver?.earningsToday || 0)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Semana</Text>
            <Text style={styles.value}>{formatBRL(driver?.earningsWeek || 0)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Corridas concluídas</Text>
        {loading ? <Text style={styles.empty}>Carregando...</Text> : null}
        {!loading && concluded.length === 0 ? <Text style={styles.empty}>Nenhuma corrida concluída ainda</Text> : null}
        {concluded.map((r) => (
          <View key={r.id} style={styles.row}>
            <View>
              <Text style={styles.dest}>{r.destination.label}</Text>
              <Text style={styles.meta}>{formatDate(r.createdAt)}</Text>
            </View>
            <Text style={styles.earn}>+{formatBRL(r.price * 0.8)}</Text>
          </View>
        ))}

        <Text style={styles.section}>Créditos / extrato</Text>
        {!loading && credits.length === 0 ? <Text style={styles.empty}>Sem lançamentos ainda</Text> : null}
        {credits.slice(0, 12).map((t) => (
          <View key={t.id} style={styles.row}>
            <View>
              <Text style={styles.dest}>{t.description || t.type}</Text>
              <Text style={styles.meta}>{formatDate(t.createdAt)}</Text>
            </View>
            <Text style={styles.earn}>{t.amount >= 0 ? "+" : ""}{formatBRL(t.amount)}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: "row", gap: 10 },
  card: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    borderRadius: 14,
    padding: 16,
  },
  label: { color: "rgba(255,255,255,0.7)" },
  value: { color: theme.colors.yellow, fontWeight: "800", fontSize: 20, marginTop: 4 },
  section: { fontWeight: "800", color: theme.colors.navy, marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dest: { fontWeight: "700", color: theme.colors.navy },
  meta: { color: theme.colors.textMuted, fontSize: 12 },
  earn: { fontWeight: "800", color: theme.colors.green },
  empty: { color: theme.colors.textMuted },
  error: { color: theme.colors.danger, fontWeight: "600", textAlign: "center" },
});
