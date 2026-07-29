import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function NavegarScreen() {
  const router = useRouter();
  const { token, activeRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const rideIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !activeRideId) return;
    const tick = async () => {
      try {
        const r = await api.getRide(token, activeRideId);
        setRide((prev) => {
          if (prev && prev.id === r.id && prev.status === r.status && prev.clientName === r.clientName) {
            return prev;
          }
          return r;
        });
        if (r.status === "em_andamento" && rideIdRef.current !== `go:${r.id}`) {
          rideIdRef.current = `go:${r.id}`;
          router.replace("/(motorista)/em-andamento");
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [token, activeRideId]);

  const arrived = async () => {
    if (!ride) return;
    await api.updateRide(token!, ride.id, { status: "a_caminho" });
    await api.updateRide(token!, ride.id, { status: "em_andamento" });
    router.replace("/(motorista)/em-andamento");
  };

  const mapLat = ride?.origin.lat ?? -23.55;
  const mapLng = ride?.origin.lng ?? -46.63;

  return (
    <Screen>
      <MapPlaceholder
        height={360}
        label="Até o passageiro"
        route
        lat={mapLat}
        lng={mapLng}
      />
      <View style={styles.sheet}>
        <Text style={styles.title}>Buscar passageiro</Text>
        <Text style={styles.name}>{ride?.clientName || "Carregando…"}</Text>
        <Text style={styles.addr}>{ride?.origin.address || "—"}</Text>
        <Text style={styles.dest}>Destino: {ride?.destination.label || "—"}</Text>
        <Button title="Cheguei / Iniciar corrida" onPress={arrived} style={{ marginTop: 24 }} disabled={!ride} />
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
  title: { fontWeight: "800", fontSize: 20, color: theme.colors.navy },
  name: { marginTop: 12, fontWeight: "700", color: theme.colors.navy, fontSize: 16 },
  addr: { color: theme.colors.textMuted, marginTop: 4 },
  dest: { marginTop: 12, color: theme.colors.blue, fontWeight: "600" },
});
