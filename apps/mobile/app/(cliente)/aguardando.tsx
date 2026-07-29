import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function AguardandoScreen() {
  const router = useRouter();
  const { token, activeRideId, setActiveRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (!token || !activeRideId) return;
    const tick = () => {
      api.getRide(token, activeRideId).then((r) => {
        setRide(r);
        if (r.status === "em_andamento") router.replace("/(cliente)/corrida");
        else if (r.status === "concluida") router.replace("/(cliente)/concluida");
        else if (r.status === "cancelada") {
          setActiveRideId(null);
          router.replace("/(cliente)/(tabs)/inicio");
        }
      }).catch(() => {});
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [token, activeRideId]);

  const cancel = async () => {
    if (!ride) return;
    await api.updateRide(token!, ride.id, { status: "cancelada" });
    setActiveRideId(null);
    router.replace("/(cliente)/(tabs)/inicio");
  };

  const found = ride && ["aceita", "a_caminho"].includes(ride.status);

  return (
    <Screen>
      <MapPlaceholder height={360} label={found ? "Motorista a caminho" : "Buscando motorista..."} route />
      <View style={styles.sheet}>
        <Text style={styles.status}>
          {found ? "Encontramos um motorista" : "Procurando motorista..."}
        </Text>
        <Text style={styles.eta}>{ride?.etaMin || 3} min</Text>

        {found && ride?.driverName ? (
          <View style={styles.driver}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ride.driverName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{ride.driverName}</Text>
              <Text style={styles.meta}>★ {ride.driverRating?.toFixed(1)} · {ride.vehicle?.model} — {ride.vehicle?.color}</Text>
              <Text style={styles.plate}>{ride.vehicle?.plate}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.wait}>Aguarde — motoristas online receberão sua solicitação</Text>
        )}

        <View style={styles.actions}>
          <Button title="Mensagem" variant="secondary" style={{ flex: 1 }} onPress={() => Alert.alert("Mensagem", "Chat demo")} />
          <Button title="Ligar" variant="outline" style={{ flex: 1 }} onPress={() => Alert.alert("Ligar", ride?.driverName || "Motorista")} />
        </View>
        <Pressable onPress={cancel}>
          <Text style={styles.cancel}>Cancelar corrida</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  status: { fontWeight: "800", fontSize: 18, color: theme.colors.navy },
  eta: { color: theme.colors.blue, fontWeight: "700", marginTop: 4 },
  wait: { color: theme.colors.textMuted, marginTop: 16 },
  driver: { flexDirection: "row", gap: 12, marginTop: 20, alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: theme.colors.yellow, fontWeight: "800", fontSize: 20 },
  name: { fontWeight: "800", color: theme.colors.navy },
  meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  plate: { fontWeight: "700", color: theme.colors.navy, marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancel: { color: theme.colors.danger, textAlign: "center", marginTop: 16, fontWeight: "700" },
});
