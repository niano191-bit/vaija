import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

const DOC_ITEMS = [
  { id: "cnh", label: "CNH digital" },
  { id: "crlv", label: "CRLV do veículo" },
  { id: "foto", label: "Foto do motorista" },
  { id: "antecedentes", label: "Antecedentes criminais" },
] as const;

export default function MotoristaConta() {
  const router = useRouter();
  const { user, driver, logout } = useAuth();
  const approved = Boolean(driver?.documentsApproved);

  return (
    <Screen style={{ padding: 20, paddingTop: 56 }}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.phone}</Text>
      <Text style={styles.meta}>{user?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Veículo</Text>
        <Text style={styles.value}>
          {driver?.vehicle.model} — {driver?.vehicle.color}
        </Text>
        <Text style={styles.plate}>{driver?.vehicle.plate}</Text>
        <Text style={[styles.docs, !approved && styles.docsPending]}>
          Documentos: {approved ? "Aprovados pelo admin" : "Em análise / pendentes"}
        </Text>
      </View>

      <Text style={styles.section}>Checklist de documentos</Text>
      {DOC_ITEMS.map((d) => (
        <View key={d.id} style={styles.docRow}>
          <Text style={styles.docLabel}>{d.label}</Text>
          <Text style={[styles.docStatus, approved ? styles.ok : styles.wait]}>
            {approved ? "OK" : "Pendente"}
          </Text>
        </View>
      ))}
      <Text style={styles.hint}>
        Nesta demo os documentos do Carlos já vêm aprovados pelo seed. Em produção o admin valida o envio.
      </Text>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/(auth)/welcome");
        }}
        style={{ marginTop: 32 }}
      >
        <Text style={styles.logout}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 24, fontWeight: "800", color: theme.colors.navy },
  meta: { color: theme.colors.textMuted, marginTop: 4 },
  card: {
    marginTop: 24,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  label: { color: theme.colors.textMuted },
  value: { fontWeight: "700", color: theme.colors.navy, fontSize: 16 },
  plate: { fontWeight: "800", color: theme.colors.blue },
  docs: { marginTop: 8, color: theme.colors.green, fontWeight: "600" },
  docsPending: { color: theme.colors.danger },
  section: { marginTop: 24, fontWeight: "800", color: theme.colors.navy, marginBottom: 8 },
  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  docLabel: { color: theme.colors.navy, fontWeight: "600" },
  docStatus: { fontWeight: "800" },
  ok: { color: theme.colors.green },
  wait: { color: theme.colors.textMuted },
  hint: { marginTop: 12, color: theme.colors.textMuted, fontSize: 12, lineHeight: 18 },
  logout: { color: theme.colors.danger, fontWeight: "700", textAlign: "center" },
});
