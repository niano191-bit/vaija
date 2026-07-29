import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

const FAQ = [
  {
    q: "Como cancelar uma corrida?",
    a: "Na tela de espera ou durante a viagem, toque em Cancelar corrida. Em andamento, confirme no aviso.",
  },
  {
    q: "Formas de pagamento",
    a: "PIX, cartão e carteira vaijá. Escolha em Carteira antes de solicitar.",
  },
  {
    q: "Cupom não aplica",
    a: "Confira se o código está ativo no admin e digite na confirmação da corrida.",
  },
];

const TICKETS = [
  { label: "Fale com o suporte", icon: "chatbubbles-outline", category: "Geral" },
  { label: "Corridas / Pagamentos", icon: "car-outline", category: "Corridas" },
  { label: "Conta / Cadastro", icon: "person-outline", category: "Conta" },
  { label: "Segurança", icon: "shield-outline", category: "Segurança" },
] as const;

export default function SuporteScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [busy, setBusy] = useState<string | null>(null);

  const openTicket = async (category: string) => {
    try {
      setBusy(category);
      await api.createTicket(token, {
        category,
        subject: `Ajuda: ${category}`,
        message: "Preciso de ajuda com este assunto.",
      });
      Alert.alert("Suporte", "Ticket aberto! O admin verá no painel.");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível abrir o ticket");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen style={{ paddingTop: 52 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Como podemos ajudar?</Title>

        <Text style={styles.section}>FAQ</Text>
        {FAQ.map((item, i) => (
          <Pressable key={item.q} style={styles.faq} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
            <View style={styles.faqHead}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Ionicons name={openFaq === i ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textMuted} />
            </View>
            {openFaq === i ? <Text style={styles.faqA}>{item.a}</Text> : null}
          </Pressable>
        ))}

        <Text style={styles.section}>Abrir ticket</Text>
        {TICKETS.map((item) => (
          <Pressable
            key={item.label}
            style={styles.row}
            disabled={busy === item.category}
            onPress={() => openTicket(item.category)}
          >
            <Ionicons name={item.icon as any} size={20} color={theme.colors.navy} />
            <Text style={styles.label}>{busy === item.category ? "Enviando..." : item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}
        <Text style={styles.footer}>24h por dia, 7 dias por semana</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, marginBottom: 8, fontWeight: "800", color: theme.colors.navy },
  faq: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: theme.colors.white,
  },
  faqHead: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" },
  faqQ: { flex: 1, fontWeight: "700", color: theme.colors.navy },
  faqA: { marginTop: 10, color: theme.colors.textMuted, lineHeight: 20 },
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
