import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, formatDate, type Transaction } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

async function copyText(text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  await Share.share({ message: text });
  return false;
}

export default function IndicarScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const code = user?.referralCode || "VAIJA10";
  const [credits, setCredits] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!token) return;
    api
      .getTransactions(token)
      .then((txs) =>
        setCredits(
          txs.filter(
            (t) =>
              t.type === "credito" &&
              (t.description?.toLowerCase().includes("indicação") ||
                t.description?.toLowerCase().includes("bonus código") ||
                t.description?.toLowerCase().includes("bônus código")),
          ),
        ),
      )
      .catch(() => {});
  }, [token]);

  const earned = credits.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <Screen style={{ padding: 20, paddingTop: 52 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Indique e ganhe</Title>
      <Text style={styles.sub}>
        Convide amigos com seu código. Vocês dois ganham R$ 10,00 no cadastro.
      </Text>

      <View style={styles.earnBox}>
        <Text style={styles.earnLabel}>Créditos de indicação</Text>
        <Text style={styles.earnValue}>{formatBRL(earned)}</Text>
        <Text style={styles.earnMeta}>{credits.length} bônus registrado(s)</Text>
      </View>

      <View style={styles.codeBox}>
        <Text style={styles.code}>{code}</Text>
        <Pressable
          onPress={async () => {
            const copied = await copyText(code);
            Alert.alert(copied ? "Copiado" : "Pronto", code);
          }}
        >
          <Ionicons name="copy-outline" size={22} color={theme.colors.navy} />
        </Pressable>
      </View>
      <Button
        title="Compartilhar convite"
        onPress={() =>
          Share.share({
            message: `Use meu código ${code} na vaijá e ganhe R$ 10 de bônus!`,
          })
        }
        style={{ marginTop: 20 }}
      />

      {credits.length > 0 ? (
        <View style={{ marginTop: 28, gap: 8 }}>
          <Text style={styles.histTitle}>Histórico</Text>
          {credits.slice(0, 8).map((t) => (
            <View key={t.id} style={styles.histRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.histDesc}>{t.description}</Text>
                <Text style={styles.histDate}>{formatDate(t.createdAt)}</Text>
              </View>
              <Text style={styles.histAmt}>+{formatBRL(t.amount)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {Platform.OS !== "web" ? (
        <Text style={styles.hint}>
          No celular, o copiar abre o compartilhar se a área de transferência não estiver disponível.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  earnBox: {
    marginTop: 20,
    backgroundColor: theme.colors.navy,
    borderRadius: 14,
    padding: 16,
  },
  earnLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: 13 },
  earnValue: { color: theme.colors.yellow, fontWeight: "800", fontSize: 28, marginTop: 4 },
  earnMeta: { color: "rgba(255,255,255,0.6)", marginTop: 4, fontSize: 12 },
  codeBox: {
    marginTop: 20,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  code: { fontSize: 28, fontWeight: "800", color: theme.colors.navy, letterSpacing: 2 },
  histTitle: { fontWeight: "800", color: theme.colors.navy },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  histDesc: { fontWeight: "600", color: theme.colors.navy },
  histDate: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  histAmt: { fontWeight: "800", color: theme.colors.green },
  hint: { color: theme.colors.textMuted, fontSize: 11, marginTop: 12 },
});
