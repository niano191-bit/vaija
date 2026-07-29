import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api, formatBRL, formatDate, type Ride, type Transaction } from "@vaija/shared";
import { Screen, Title } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function GanhosScreen() {
  const { token, driver } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      api.getRides(token, { mine: true }).then(setRides).catch(() => {});
      api.getTransactions(token).then(setTxs).catch(() => {});
    }, [token])
  );

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Title>Ganhos</Title>
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
        <Text style={styles.section}>Histórico</Text>
        {rides.filter((r) => r.status === "concluida").map((r) => (
          <View key={r.id} style={styles.row}>
            <View>
              <Text style={styles.dest}>{r.destination.label}</Text>
              <Text style={styles.meta}>{formatDate(r.createdAt)}</Text>
            </View>
            <Text style={styles.earn}>+{formatBRL(r.price * 0.8)}</Text>
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
});
