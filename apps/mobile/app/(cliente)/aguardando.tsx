import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
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

export default function AguardandoScreen() {
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
            prev?.id === r.id && prev.status === r.status && prev.driverName === r.driverName && prev.driverPhone === r.driverPhone
              ? prev
              : r
          );
          const key = `${r.id}:${r.status}`;
          if (navKey.current === key) return;
          if (r.status === "em_andamento") {
            navKey.current = key;
            router.replace("/(cliente)/corrida");
          } else if (r.status === "concluida") {
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

  const cancel = async () => {
    if (!ride || busy) return;
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
  };

  const messageDriver = () => {
    if (!ride?.driverName) {
      Alert.alert("Aguarde", "Assim que um motorista aceitar, você poderá enviar mensagem.");
      return;
    }
    Alert.alert("Mensagem para " + ride.driverName, "Escolha uma mensagem rápida", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Estou aqui",
        onPress: () => Alert.alert("Enviado", "Mensagem enviada ao motorista."),
      },
      {
        text: "Já estou saindo",
        onPress: () => Alert.alert("Enviado", "Mensagem enviada ao motorista."),
      },
    ]);
  };

  const callDriver = async () => {
    if (!ride?.driverName) {
      Alert.alert("Aguarde", "Assim que um motorista aceitar, você poderá ligar.");
      return;
    }
    const href = toTel(ride.driverPhone);
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
              <Text style={styles.meta}>
                ★ {ride.driverRating?.toFixed(1)} · {ride.vehicle?.model} — {ride.vehicle?.color}
              </Text>
              <Text style={styles.plate}>{ride.vehicle?.plate}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.wait}>Aguarde — motoristas online receberão sua solicitação</Text>
        )}

        <View style={styles.actions}>
          <Button title="Mensagem" variant="secondary" style={{ flex: 1 }} onPress={messageDriver} />
          <Button title="Ligar" variant="outline" style={{ flex: 1 }} onPress={callDriver} />
        </View>
        <Pressable onPress={cancel} disabled={busy}>
          <Text style={[styles.cancel, busy && { opacity: 0.5 }]}>{busy ? "Cancelando..." : "Cancelar corrida"}</Text>
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
