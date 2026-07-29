import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { api, formatBRL, type Ride } from "@vaija/shared";
import { Button, MapPlaceholder, Screen } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

export default function MotoristaInicio() {
  const router = useRouter();
  const { token, user, driver, setDriver, setActiveRideId, activeRideId } = useAuth();
  const [online, setOnline] = useState(driver?.online || false);
  const [pending, setPending] = useState<Ride | null>(null);

  useEffect(() => {
    if (!token) return;
    const tick = async () => {
      try {
        const ride = await api.getPendingRide(token);
        if (ride && ride.status === "solicitada" && online) {
          setPending(ride);
        } else {
          setPending(null);
        }
        const active = await api.getRides(token, {
          mine: true,
          status: "aceita,a_caminho,em_andamento",
        });
        if (active[0] && !activeRideId) {
          setActiveRideId(active[0].id);
          if (active[0].status === "em_andamento") router.push("/(motorista)/em-andamento");
          else if (["aceita", "a_caminho"].includes(active[0].status)) {
            router.push("/(motorista)/navegar");
          }
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [token, online]);

  const toggle = async (value: boolean) => {
    setOnline(value);
    const d = await api.setDriverOnline(token!, value);
    setDriver(d);
  };

  const accept = async () => {
    if (!pending) return;
    const ride = await api.updateRide(token!, pending.id, { status: "aceita" });
    setActiveRideId(ride.id);
    setPending(null);
    router.push("/(motorista)/navegar");
  };

  const refuse = () => setPending(null);

  return (
    <Screen>
      <MapPlaceholder height={320} label={online ? "Você está online" : "Offline"} />
      <View style={styles.sheet}>
        <View style={styles.row}>
          <View>
            <Text style={styles.hello}>Olá, {user?.name?.split(" ")[0]}</Text>
            <Text style={styles.status}>{online ? "Disponível para corridas" : "Fique online para receber"}</Text>
          </View>
          <Switch value={online} onValueChange={toggle} trackColor={{ true: theme.colors.green }} />
        </View>

        <View style={styles.earn}>
          <Text style={styles.earnLabel}>Ganhos de hoje</Text>
          <Text style={styles.earnValue}>{formatBRL(driver?.earningsToday || 0)}</Text>
        </View>

        {pending ? (
          <View style={styles.request}>
            <Text style={styles.reqTitle}>Nova solicitação</Text>
            <Text style={styles.reqRoute}>
              {pending.origin.label} → {pending.destination.label}
            </Text>
            <Text style={styles.reqPrice}>{formatBRL(pending.price * 0.8)} estimado</Text>
            <View style={styles.actions}>
              <Button title="Recusar" variant="outline" style={{ flex: 1 }} onPress={refuse} />
              <Button title="Aceitar" style={{ flex: 1 }} onPress={accept} />
            </View>
          </View>
        ) : (
          <Text style={styles.idle}>
            {online ? "Aguardando solicitações..." : "Ative o modo online"}
          </Text>
        )}

        {activeRideId ? (
          <Button title="Continuar corrida ativa" onPress={() => router.push("/(motorista)/navegar")} style={{ marginTop: 12 }} />
        ) : null}
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hello: { fontWeight: "800", fontSize: 20, color: theme.colors.navy },
  status: { color: theme.colors.textMuted, marginTop: 2 },
  earn: {
    marginTop: 20,
    backgroundColor: theme.colors.navy,
    borderRadius: 14,
    padding: 16,
  },
  earnLabel: { color: "rgba(255,255,255,0.7)" },
  earnValue: { color: theme.colors.yellow, fontSize: 28, fontWeight: "800", marginTop: 4 },
  request: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: theme.colors.yellow,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFF8E1",
  },
  reqTitle: { fontWeight: "800", color: theme.colors.navy },
  reqRoute: { marginTop: 6, color: theme.colors.textMuted },
  reqPrice: { marginTop: 8, fontWeight: "800", fontSize: 18, color: theme.colors.green },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  idle: { marginTop: 24, textAlign: "center", color: theme.colors.textMuted },
});
