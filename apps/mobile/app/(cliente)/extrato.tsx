import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, formatDate, type Transaction } from "@vaija/shared";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function ExtratoScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const [items, setItems] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.getTransactions(token).then(setItems).catch(() => setItems([]));
    }, [token]),
  );

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Extrato</Title>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {items.length === 0 ? (
          <Text style={styles.empty}>Nenhuma movimentação ainda.</Text>
        ) : (
          items.map((t) => (
            <View key={t.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{t.description}</Text>
                <Text style={styles.date}>{formatDate(t.createdAt)}</Text>
              </View>
              <Text style={[styles.amount, t.amount < 0 && styles.neg]}>{formatBRL(t.amount)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: theme.colors.textMuted, textAlign: "center", marginTop: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  desc: { fontWeight: "700", color: theme.colors.navy },
  date: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  amount: { fontWeight: "800", color: theme.colors.green },
  neg: { color: theme.colors.danger },
});
