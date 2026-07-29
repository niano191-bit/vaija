import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen } from "../../src/components/ui";
import { theme } from "../../src/theme";

export default function MotoristaConcluida() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={48} color={theme.colors.white} />
      </View>
      <Text style={styles.title}>Corrida finalizada!</Text>
      <Text style={styles.sub}>Valor creditado na sua carteira</Text>
      <Button
        title="Voltar ao início"
        onPress={() => router.replace("/(motorista)/(tabs)/inicio")}
        style={{ width: "100%", marginTop: 32 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 24 },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginTop: 20, fontSize: 24, fontWeight: "800", color: theme.colors.navy },
  sub: { color: theme.colors.textMuted, marginTop: 6 },
});
