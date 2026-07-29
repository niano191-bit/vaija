import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type Wallet } from "@vaija/shared";
import { Button, Screen, Title } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function CarteiraScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const load = useCallback(() => {
    api.getWallet(token).then(setWallet).catch(() => {});
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addBalance = async () => {
    const w = await api.addBalance(token, 50);
    setWallet(w);
    Alert.alert("Saldo", "R$ 50,00 adicionados");
  };

  const select = async (methodId: string) => {
    const w = await api.selectPayment(token, methodId);
    setWallet(w);
  };

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Title>Carteira</Title>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Text style={styles.balance}>{formatBRL(wallet?.balance || 0)}</Text>
          <Button title="Adicionar saldo" onPress={addBalance} style={{ marginTop: 12 }} />
        </View>

        <View style={styles.grid}>
          {[
            { label: "PIX", icon: "flash", route: null },
            { label: "Cartões", icon: "card", route: null },
            { label: "Cupons", icon: "pricetag", route: "/(cliente)/cupons" },
            { label: "Extrato", icon: "document-text", route: null },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.gridItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={22} color={theme.colors.navy} />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Formas de pagamento</Text>
        {wallet?.methods.map((m) => (
          <Pressable key={m.id} style={styles.method} onPress={() => select(m.id)}>
            <Text style={styles.methodLabel}>{m.label}</Text>
            <View style={[styles.radio, m.selected && styles.radioOn]} />
          </Pressable>
        ))}
        <Text style={styles.add}>+ Adicionar forma de pagamento</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: theme.colors.navy,
    borderRadius: 18,
    padding: 20,
  },
  balanceLabel: { color: "rgba(255,255,255,0.7)" },
  balance: { color: theme.colors.yellow, fontSize: 32, fontWeight: "800", marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "47%",
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  gridLabel: { fontWeight: "600", color: theme.colors.navy },
  section: { fontWeight: "800", color: theme.colors.navy, fontSize: 16 },
  method: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  methodLabel: { fontWeight: "600", color: theme.colors.navy },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.navy,
  },
  radioOn: { backgroundColor: theme.colors.yellow },
  add: { color: theme.colors.blue, fontWeight: "700", marginTop: 8 },
});
