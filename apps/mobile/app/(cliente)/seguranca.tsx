import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function SegurancaScreen() {
  const router = useRouter();
  const { token, activeRideId } = useAuth();
  const [record, setRecord] = useState(false);
  const [loading, setLoading] = useState(false);

  const sos = async () => {
    try {
      setLoading(true);
      await api.createSos(token!, { rideId: activeRideId || undefined });
      Alert.alert("SOS enviado", "O admin foi notificado imediatamente.");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: 20, paddingTop: 52 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Segurança</Title>

      <Pressable style={styles.sos} onPress={sos} disabled={loading}>
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>
      <Text style={styles.hint}>Use apenas em emergências reais</Text>

      <Pressable style={styles.row} onPress={() => Alert.alert("Contatos", "Gerenciar contatos de emergência (demo)")}>
        <Text style={styles.rowLabel}>Contatos de emergência</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Gravar áudio da viagem</Text>
        <Switch value={record} onValueChange={setRecord} trackColor={{ true: theme.colors.yellow }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sos: {
    marginTop: 32,
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: { color: theme.colors.white, fontSize: 36, fontWeight: "900" },
  hint: { textAlign: "center", color: theme.colors.textMuted, marginTop: 12, marginBottom: 28 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: { fontWeight: "600", color: theme.colors.navy },
});
