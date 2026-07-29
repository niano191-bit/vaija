import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type Ride } from "@vaija/shared";
import { Button, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function MotoristaConcluida() {
  const router = useRouter();
  const { token } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getRides(token, { mine: true })
      .then((list) => {
        const last = list.find((r) => r.status === "concluida");
        setRide(last || null);
      })
      .catch(() => {});
  }, [token]);

  const earn = (ride?.price || 0) * 0.8;

  return (
    <Screen style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={48} color={theme.colors.white} />
      </View>
      <Text style={styles.title}>Corrida finalizada!</Text>
      <Text style={styles.sub}>
        {ride?.destination?.label ? `Destino: ${ride.destination.label}` : "Valor creditado na sua carteira"}
      </Text>
      <Text style={styles.earn}>+{formatBRL(earn)}</Text>
      <Text style={styles.hint}>Crédito na carteira / ganhos do dia</Text>
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
  sub: { color: theme.colors.textMuted, marginTop: 6, textAlign: "center" },
  earn: { marginTop: 16, fontSize: 36, fontWeight: "800", color: theme.colors.green },
  hint: { color: theme.colors.textMuted, marginTop: 4, fontSize: 12 },
});
