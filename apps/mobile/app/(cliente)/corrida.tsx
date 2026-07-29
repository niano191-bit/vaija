import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { api, type Ride } from "@vaija/shared";
import { MapPlaceholder, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function CorridaScreen() {
  const router = useRouter();
  const { token, activeRideId, setActiveRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const navKey = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !activeRideId) return;
    const tick = () => {
      api.getRide(token, activeRideId).then((r) => {
        setRide((prev) => (prev?.id === r.id && prev.status === r.status ? prev : r));
        const key = `${r.id}:${r.status}`;
        if (navKey.current === key) return;
        if (r.status === "concluida") {
          navKey.current = key;
          router.replace("/(cliente)/concluida");
        } else if (r.status === "cancelada") {
          navKey.current = key;
          setActiveRideId(null);
          router.replace("/(cliente)/(tabs)/inicio");
        }
      });
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [token, activeRideId]);

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.driver}>{ride?.driverName} · {ride?.vehicle?.plate}</Text>
      </View>
      <MapPlaceholder height={400} label="Em andamento" route />
      <View style={styles.sheet}>
        <Text style={styles.eta}>Chegada em {ride?.etaMin || 8} min</Text>
        <Text style={styles.dist}>{ride?.distanceKm || 2.4} km · {ride?.destination?.label}</Text>
        <Pressable
          style={styles.share}
          onPress={() => Share.share({ message: `Estou a caminho de ${ride?.destination?.label} com a vaijá!` })}
        >
          <Text style={styles.shareText}>Compartilhar corrida</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            if (!ride) return;
            await api.updateRide(token!, ride.id, { status: "cancelada" });
            setActiveRideId(null);
            router.replace("/(cliente)/(tabs)/inicio");
          }}
        >
          <Text style={styles.cancel}>Cancelar corrida</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  driver: { fontWeight: "700", color: theme.colors.navy, textAlign: "center" },
  sheet: {
    marginTop: -20,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    flex: 1,
  },
  eta: { fontWeight: "800", fontSize: 22, color: theme.colors.navy },
  dist: { color: theme.colors.textMuted, marginTop: 4 },
  share: {
    marginTop: 20,
    backgroundColor: theme.colors.navy,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  shareText: { color: theme.colors.white, fontWeight: "700" },
  cancel: { color: theme.colors.danger, textAlign: "center", marginTop: 16, fontWeight: "700" },
});
