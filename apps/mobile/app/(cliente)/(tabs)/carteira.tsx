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
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getWallet(token)
      .then((w) => {
        setWallet(w);
        setError("");
      })
      .catch((e: any) => setError(e.message || "Falha ao carregar carteira"));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const addBalance = async (amount: number) => {
    try {
      const w = await api.addBalance(token, amount);
      setWallet(w);
      Alert.alert("Saldo", `${formatBRL(amount)} adicionados à carteira`);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao adicionar saldo");
    }
  };

  const select = async (methodId: string) => {
    try {
      const w = await api.selectPayment(token, methodId);
      setWallet(w);
      const method = w.methods.find((m) => m.id === methodId);
      Alert.alert("Pagamento", `${method?.label || "Método"} definido como padrão`);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao selecionar pagamento");
    }
  };

  const pickByType = (kind: "pix" | "card") => {
    if (kind === "pix") {
      const pix = wallet?.methods?.find((m) => m.type === "pix");
      if (pix) return select(pix.id);
      Alert.alert("PIX", "Nenhuma chave PIX cadastrada nesta demo.");
      return;
    }
    const card = wallet?.methods?.find((m) => m.type === "visa" || m.type === "mastercard");
    if (card) return select(card.id);
    Alert.alert("Cartões", "Nenhum cartão cadastrado nesta demo.");
  };

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Title>Carteira</Title>
        {error ? (
          <Pressable onPress={load}>
            <Text style={styles.error}>{error} · tocar para tentar de novo</Text>
          </Pressable>
        ) : null}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Text style={styles.balance}>{formatBRL(wallet?.balance || 0)}</Text>
          <View style={styles.balanceActions}>
            <Button title="+ R$ 50" onPress={() => addBalance(50)} style={{ flex: 1 }} />
            <Button title="+ R$ 100" variant="secondary" onPress={() => addBalance(100)} style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.grid}>
          {[
            { label: "PIX", icon: "flash", onPress: () => pickByType("pix") },
            { label: "Cartões", icon: "card", onPress: () => pickByType("card") },
            {
              label: "Cupons",
              icon: "pricetag",
              onPress: () => router.push("/(cliente)/cupons"),
            },
            {
              label: "Extrato",
              icon: "document-text",
              onPress: () => router.push("/(cliente)/extrato"),
            },
          ].map((item) => (
            <Pressable key={item.label} style={styles.gridItem} onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={22} color={theme.colors.navy} />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Formas de pagamento</Text>
        <View>
          {wallet?.methods?.length ? (
            wallet.methods.map((m) => (
              <Pressable key={m.id} style={styles.method} onPress={() => select(m.id)}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <View style={[styles.radio, m.selected && styles.radioOn]} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.empty}>{error ? "—" : "Nenhuma forma cadastrada."}</Text>
          )}
        </View>
        <Text style={styles.add}>Toque em um método para selecionar como padrão.</Text>
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
  balanceActions: { flexDirection: "row", gap: 10, marginTop: 12 },
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
  add: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  empty: { color: theme.colors.textMuted },
  error: { color: theme.colors.danger, fontWeight: "600", textAlign: "center" },
});
