import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type Ride } from "@vaija/shared";
import { Button, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function ConcluidaScreen() {
  const router = useRouter();
  const { token, activeRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (!token || !activeRideId) return;
    api.getRide(token, activeRideId).then(setRide);
  }, [token, activeRideId]);

  return (
    <Screen style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={48} color={theme.colors.white} />
      </View>
      <Text style={styles.title}>Viagem concluída!</Text>
      <Text style={styles.sub}>Obrigado por escolher a Vaijá!</Text>
      <Text style={styles.total}>{formatBRL(ride?.total || 0)}</Text>
      <Text style={styles.pay}>{ride?.paymentMethod || "PIX"}</Text>
      <Button
        title="Avaliar corrida"
        onPress={() => router.replace("/(cliente)/avaliar")}
        style={{ width: "100%", marginTop: 32 }}
      />
      <Button
        title="OK"
        variant="outline"
        onPress={() => router.replace("/(cliente)/avaliar")}
        style={{ width: "100%", marginTop: 10 }}
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
  total: { marginTop: 24, fontSize: 36, fontWeight: "800", color: theme.colors.navy },
  pay: { color: theme.colors.textMuted, marginTop: 4 },
});
