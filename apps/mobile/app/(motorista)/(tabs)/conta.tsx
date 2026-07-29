import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function MotoristaConta() {
  const router = useRouter();
  const { user, driver, logout } = useAuth();

  return (
    <Screen style={{ padding: 20, paddingTop: 56 }}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.phone}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Veículo</Text>
        <Text style={styles.value}>
          {driver?.vehicle.model} — {driver?.vehicle.color}
        </Text>
        <Text style={styles.plate}>{driver?.vehicle.plate}</Text>
        <Text style={styles.docs}>
          Documentos: {driver?.documentsApproved ? "Aprovados" : "Pendentes"}
        </Text>
      </View>
      <Pressable onPress={() => Alert.alert("Docs", "Upload de documentos (demo)")}>
        <Text style={styles.link}>Enviar documentos</Text>
      </Pressable>
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
  link: { marginTop: 16, color: theme.colors.blue, fontWeight: "700" },
  logout: { color: theme.colors.danger, fontWeight: "700", textAlign: "center" },
});
