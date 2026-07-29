import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatDate, type SupportTicket } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
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

const CATEGORIES = ["Geral", "Corridas", "Conta", "Segurança"] as const;

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

export default function SuporteScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Geral");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const all = await api.getTickets(token);
      setTickets(all.filter((t) => t.category !== "Chat"));
    } catch (e: any) {
      setError(e.message || "Falha ao carregar tickets");
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Preencha assunto e mensagem");
      return;
    }
    try {
      setBusy(true);
      await api.createTicket(token, {
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject("");
      setMessage("");
      setShowForm(false);
      await load();
      Alert.alert("Enviado", "Ticket aberto! Acompanhe o status abaixo.");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível abrir o ticket");
    } finally {
      setBusy(false);
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

        <View style={styles.sectionRow}>
          <Text style={[styles.section, { marginTop: 0, marginBottom: 0 }]}>Meus tickets</Text>
          <Pressable onPress={() => setShowForm((v) => !v)}>
            <Text style={styles.link}>{showForm ? "Fechar" : "+ Novo"}</Text>
          </Pressable>
        </View>

        {showForm ? (
          <View style={styles.form}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
                  <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Assunto"
              placeholderTextColor={theme.colors.textMuted}
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput
              style={[styles.input, { minHeight: 90, textAlignVertical: "top" }]}
              placeholder="Descreva o problema"
              placeholderTextColor={theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Button title={busy ? "Enviando..." : "Enviar ticket"} onPress={submit} disabled={busy} loading={busy} />
          </View>
        ) : null}

        {error ? (
          <Pressable onPress={load}>
            <Text style={styles.error}>{error} · tocar para tentar de novo</Text>
          </Pressable>
        ) : null}

        {tickets.length === 0 && !error ? (
          <Text style={styles.empty}>Nenhum ticket ainda</Text>
        ) : (
          tickets.map((t) => (
            <View key={t.id} style={styles.ticket}>
              <View style={styles.ticketHead}>
                <Text style={styles.ticketSubject}>{t.subject}</Text>
                <Text style={[styles.badge, t.status === "resolvido" && styles.badgeOk]}>
                  {STATUS_LABEL[t.status] || t.status}
                </Text>
              </View>
              <Text style={styles.ticketMeta}>
                {t.category} · {formatDate(t.createdAt)}
              </Text>
              <Text style={styles.ticketMsg} numberOfLines={3}>
                {t.message}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.footer}>24h por dia, 7 dias por semana</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, marginBottom: 8, fontWeight: "800", color: theme.colors.navy },
  sectionRow: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: { color: theme.colors.blue, fontWeight: "700" },
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
  form: { gap: 10, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.gray,
  },
  chipOn: { backgroundColor: theme.colors.navy },
  chipText: { color: theme.colors.textMuted, fontWeight: "600", fontSize: 13 },
  chipTextOn: { color: theme.colors.white },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.gray,
    color: theme.colors.navy,
  },
  ticket: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: theme.colors.white,
  },
  ticketHead: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "flex-start" },
  ticketSubject: { flex: 1, fontWeight: "700", color: theme.colors.navy },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.blue,
    backgroundColor: "#E8F1FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  badgeOk: { color: theme.colors.green, backgroundColor: "#E8F8EE" },
  ticketMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  ticketMsg: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 18 },
  empty: { color: theme.colors.textMuted, marginVertical: 8 },
  error: { color: theme.colors.danger, fontWeight: "600", marginBottom: 8 },
  footer: { marginTop: 28, textAlign: "center", color: theme.colors.textMuted },
});
