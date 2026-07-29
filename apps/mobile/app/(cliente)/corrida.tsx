import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { api, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
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
  const { token, activeRideId, setActiveRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);
  const navKey = useRef<string | null>(null);

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
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [token, activeRideId]);

  const messageDriver = () => {
    if (!ride?.driverName) return;
    Alert.alert("Mensagem para " + ride.driverName, "Escolha uma mensagem rápida", [
      { text: "Cancelar", style: "cancel" },
      { text: "Estou aqui", onPress: () => Alert.alert("Enviado", "Mensagem enviada ao motorista.") },
      { text: "Já estou saindo", onPress: () => Alert.alert("Enviado", "Mensagem enviada ao motorista.") },
    ]);
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

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.driver}>
          {ride?.driverName || "Motorista"} · {ride?.vehicle?.plate || "—"}
        </Text>
      </View>
      <MapPlaceholder height={400} label="Em andamento" route />
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
