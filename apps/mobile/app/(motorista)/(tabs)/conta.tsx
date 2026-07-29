import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, formatBRL } from "@vaija/shared";
import { Button, Screen } from "../../../src/components/ui";
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
  const { user, driver, token, logout, setUser, setDriver } = useAuth();
  const approved = Boolean(driver?.documentsApproved);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setName(user?.name || "");
      setPhone(user?.phone || "");
      if (!token) return;
      api
        .getDrivers(token)
        .then((list) => {
          const mine = list.find((d) => d.userId === user?.id);
          if (mine) setDriver(mine);
        })
        .catch(() => {});
    }, [token, user?.id, user?.name, user?.phone])
  );

  const save = async () => {
    if (!token) return;
    try {
      setSaving(true);
      const updated = await api.updateProfile(token, { name: name.trim(), phone: phone.trim() });
      await setUser(updated);
      Alert.alert("Salvo", "Dados atualizados.");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={{ padding: 20, paddingTop: 56 }}>
      <Text style={styles.heading}>Minha conta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={[styles.label, { marginTop: 12 }]}>Telefone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={[styles.label, { marginTop: 12 }]}>E-mail</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Button title="Salvar" onPress={save} loading={saving} style={{ marginTop: 14 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Veículo</Text>
        <Text style={styles.value}>
          {driver?.vehicle?.model || "—"} — {driver?.vehicle?.color || "—"}
        </Text>
        <Text style={styles.plate}>{driver?.vehicle?.plate || "—"}</Text>
        <Text style={styles.earn}>
          Hoje {formatBRL(driver?.earningsToday || 0)} · Semana {formatBRL(driver?.earningsWeek || 0)}
        </Text>
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
        O admin libera o motorista em Motoristas no painel. Carlos já vem aprovado no seed de demo.
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
  heading: { fontSize: 24, fontWeight: "800", color: theme.colors.navy, marginBottom: 8 },
  card: {
    marginTop: 16,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 16,
  },
  label: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" },
  value: { fontWeight: "700", color: theme.colors.navy, fontSize: 16, marginTop: 4 },
  input: {
    marginTop: 4,
    fontWeight: "700",
    color: theme.colors.navy,
    fontSize: 16,
    paddingVertical: 4,
  },
  plate: { fontWeight: "800", color: theme.colors.blue, marginTop: 4 },
  earn: { marginTop: 8, color: theme.colors.navy, fontWeight: "600", fontSize: 13 },
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
