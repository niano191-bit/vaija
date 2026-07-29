import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { api, formatBRL, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function EmAndamentoMotorista() {
  const router = useRouter();
  const { token, activeRideId, setActiveRideId, setDriver, user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !activeRideId) return;
    api
      .getRide(token, activeRideId)
      .then(setRide)
      .catch((e: any) => Alert.alert("Erro", e.message || "Falha ao carregar corrida"));
  }, [token, activeRideId]);

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

  return (
    <Screen>
      <MapPlaceholder height={360} label="Rota até o destino" route />
      <View style={styles.sheet}>
        <Text style={styles.title}>Corrida em andamento</Text>
        <Text style={styles.dest}>{ride?.destination?.label || "—"}</Text>
        <Text style={styles.addr}>{ride?.destination?.address || "—"}</Text>
        <Text style={styles.earn}>Você receberá {formatBRL((ride?.price || 0) * 0.8)}</Text>
        <Button
          title={busy ? "Finalizando..." : "Finalizar corrida"}
          onPress={finish}
          style={{ marginTop: 24 }}
          disabled={!ride || busy}
          loading={busy}
        />
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
});
