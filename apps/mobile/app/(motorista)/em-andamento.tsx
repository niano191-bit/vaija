import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { api, formatBRL, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { sendQuickRideMessage, watchRideMessages } from "../../src/rideChat";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function EmAndamentoMotorista() {
  const router = useRouter();
  const { token, activeRideId, setActiveRideId, setDriver, user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);
  const seenMsgs = useRef({ seen: new Set<string>(), primed: false });

  useEffect(() => {
    if (!token || !activeRideId) return;
    const tick = () => {
      api
        .getRide(token, activeRideId)
        .then(setRide)
        .catch((e: any) => Alert.alert("Erro", e.message || "Falha ao carregar corrida"));
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

  const finish = async () => {
    if (!ride || busy) return;
    try {
      setBusy(true);
      await api.updateRide(token!, ride.id, { status: "concluida" });
      const drivers = await api.getDrivers(token!);
      const me = drivers.find((d) => d.userId === user?.id);
      if (me) setDriver(me);
      setActiveRideId(null);
      router.replace("/(motorista)/concluida");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível finalizar");
    } finally {
      setBusy(false);
    }
  };

  const messageClient = () => {
    if (!ride || !token) return;
    sendQuickRideMessage(token, ride.id, ride.clientName || "Passageiro", [
      "Chegando ao destino",
      "Trânsito lento",
      "Tudo bem aí?",
    ]);
  };

  const mapLat = ride?.destination.lat ?? -23.55;
  const mapLng = ride?.destination.lng ?? -46.63;

  return (
    <Screen>
      <MapPlaceholder height={360} label="Rota até o destino" route lat={mapLat} lng={mapLng} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Corrida em andamento</Text>
        <Text style={styles.dest}>{ride?.destination?.label || "—"}</Text>
        <Text style={styles.addr}>{ride?.destination?.address || "—"}</Text>
        <Text style={styles.earn}>Você receberá {formatBRL((ride?.price || 0) * 0.8)}</Text>
        <View style={styles.actions}>
          <Button title="Mensagem" variant="secondary" style={{ flex: 1 }} onPress={messageClient} disabled={!ride} />
          <Button
            title={busy ? "Finalizando..." : "Finalizar"}
            onPress={finish}
            style={{ flex: 1 }}
            disabled={!ride || busy}
            loading={busy}
          />
        </View>
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
  dest: { marginTop: 12, fontWeight: "700", fontSize: 18, color: theme.colors.navy },
  addr: { color: theme.colors.textMuted, marginTop: 4 },
  earn: { marginTop: 16, color: theme.colors.green, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
});
