import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { api, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { sendQuickRideMessage, watchRideMessages } from "../../src/rideChat";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

function toTel(phone?: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("55") ? `tel:+${digits}` : `tel:+55${digits}`;
}

export default function CorridaScreen() {
  const router = useRouter();
  const { token, user, activeRideId, setActiveRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);
  const navKey = useRef<string | null>(null);
  const seenMsgs = useRef({ seen: new Set<string>(), primed: false });

  useEffect(() => {
    if (!token || !activeRideId) return;
    const tick = () => {
      api
        .getRide(token, activeRideId)
        .then((r) => {
          setRide((prev) =>
            prev?.id === r.id && prev.status === r.status && prev.driverPhone === r.driverPhone ? prev : r
          );
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
        })
        .catch(() => {});
      if (user?.id) {
        watchRideMessages(token, activeRideId, user.id, seenMsgs.current, (text, fromName) => {
          Alert.alert(`Mensagem de ${fromName}`, text);
        });
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [token, activeRideId, user?.id]);

  const messageDriver = () => {
    if (!ride?.driverName || !token) return;
    sendQuickRideMessage(token, ride.id, ride.driverName, ["Estou aqui", "Já estou saindo", "Pode acelerar?"]);
  };

  const callDriver = async () => {
    const href = toTel(ride?.driverPhone);
    if (!href) {
      Alert.alert("Ligação", "Telefone do motorista indisponível nesta corrida.");
      return;
    }
    try {
      await Linking.openURL(href);
    } catch {
      Alert.alert("Ligação", "Não foi possível abrir o discador.");
    }
  };

  const cancel = () => {
    if (!ride || busy) return;
    Alert.alert("Cancelar corrida?", "O motorista será notificado.", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await api.updateRide(token!, ride.id, { status: "cancelada" });
            setActiveRideId(null);
            router.replace("/(cliente)/(tabs)/inicio");
          } catch (e: any) {
            Alert.alert("Erro", e.message || "Não foi possível cancelar");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const mapLat = ride?.destination.lat ?? ride?.origin.lat ?? -23.55;
  const mapLng = ride?.destination.lng ?? ride?.origin.lng ?? -46.63;

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.driver}>
          {ride?.driverName || "Motorista"} · {ride?.vehicle?.plate || "—"}
        </Text>
      </View>
      <MapPlaceholder height={400} label="Em andamento" route lat={mapLat} lng={mapLng} />
      <View style={styles.sheet}>
        <Text style={styles.eta}>Chegada em {ride?.etaMin || 8} min</Text>
        <Text style={styles.dist}>
          {ride?.distanceKm || 2.4} km · {ride?.destination?.label || "Destino"}
        </Text>
        <View style={styles.actions}>
          <Button title="Mensagem" variant="secondary" style={{ flex: 1 }} onPress={messageDriver} />
          <Button title="Ligar" variant="outline" style={{ flex: 1 }} onPress={callDriver} />
        </View>
        <Pressable
          style={styles.share}
          onPress={() =>
            Share.share({ message: `Estou a caminho de ${ride?.destination?.label || "destino"} com a vaijá!` })
          }
        >
          <Text style={styles.shareText}>Compartilhar corrida</Text>
        </Pressable>
        <Pressable onPress={cancel} disabled={busy}>
          <Text style={[styles.cancel, busy && { opacity: 0.5 }]}>
            {busy ? "Cancelando..." : "Cancelar corrida"}
          </Text>
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
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  share: {
    marginTop: 16,
    backgroundColor: theme.colors.navy,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  shareText: { color: theme.colors.white, fontWeight: "700" },
  cancel: { color: theme.colors.danger, textAlign: "center", marginTop: 16, fontWeight: "700" },
});
