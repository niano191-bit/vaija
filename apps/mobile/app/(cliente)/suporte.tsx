import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

const ITEMS = [
  { label: "FAQ", icon: "help-circle-outline" },
  { label: "Fale com o suporte", icon: "chatbubbles-outline" },
  { label: "Corridas / Pagamentos", icon: "car-outline" },
  { label: "Conta / Cadastro", icon: "person-outline" },
  { label: "Segurança", icon: "shield-outline" },
];

export default function SuporteScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;

  const openTicket = async (category: string) => {
    await api.createTicket(token, {
      category,
      subject: `Ajuda: ${category}`,
      message: "Preciso de ajuda com este assunto.",
    });
    Alert.alert("Suporte", "Ticket aberto! O admin verá no painel.");
  };

  return (
    <Screen style={{ padding: 20, paddingTop: 52 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Como podemos ajudar?</Title>
      <View style={{ marginTop: 20, gap: 8 }}>
        {ITEMS.map((item) => (
          <Pressable key={item.label} style={styles.row} onPress={() => openTicket(item.label)}>
            <Ionicons name={item.icon as any} size={20} color={theme.colors.navy} />
            <Text style={styles.label}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </View>
      <Text style={styles.footer}>24h por dia, 7 dias por semana</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: { flex: 1, fontWeight: "600", color: theme.colors.navy },
  footer: { marginTop: 28, textAlign: "center", color: theme.colors.textMuted },
});
