import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
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
  const methodsRef = useRef<View>(null);

  const load = useCallback(() => {
    api.getWallet(token).then(setWallet).catch(() => {});
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
    const w = await api.selectPayment(token, methodId);
    setWallet(w);
  };

  const focusMethods = () => {
    methodsRef.current?.measureInWindow?.(() => {});
    Alert.alert("Formas de pagamento", "Selecione PIX ou cartão na lista abaixo.");
  };

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Title>Carteira</Title>
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
            { label: "PIX", icon: "flash", onPress: focusMethods },
            { label: "Cartões", icon: "card", onPress: focusMethods },
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
        <View ref={methodsRef}>
          {wallet?.methods?.length ? (
            wallet.methods.map((m) => (
              <Pressable key={m.id} style={styles.method} onPress={() => select(m.id)}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <View style={[styles.radio, m.selected && styles.radioOn]} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.empty}>Nenhuma forma cadastrada.</Text>
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
});
