import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { api, type Ride } from "@vaija/shared";
import { RideChatModal } from "../../src/components/RideChatModal";
import { Button, MapPlaceholder, Screen } from "../../src/components/ui";
import { watchRideMessages } from "../../src/rideChat";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function NavegarScreen() {
  const router = useRouter();
  const { token, user, activeRideId, setActiveRideId } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [busy, setBusy] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navKey = useRef<string | null>(null);
  const seenMsgs = useRef({ seen: new Set<string>(), primed: false });

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        let current: Ride | null = null;
        if (activeRideId) {
          current = await api.getRide(token, activeRideId);
        } else {
          const list = await api.getRides(token, {
            mine: true,
            status: "aceita,a_caminho,em_andamento",
          });
          current = list[0] || null;
          if (current) await setActiveRideId(current.id);
        }
        if (!current) return;

        setRide((prev) =>
          prev &&
          prev.id === current!.id &&
          prev.status === current!.status &&
          prev.clientName === current!.clientName &&
          prev.destination?.label === current!.destination?.label
            ? prev
            : current,
        );

        if (user?.id && !chatOpen) {
          watchRideMessages(token, current.id, user.id, seenMsgs.current, (text, fromName) => {
            Alert.alert(`Mensagem de ${fromName}`, text, [
              { text: "OK" },
              { text: "Abrir chat", onPress: () => setChatOpen(true) },
            ]);
          });
        }

        const key = `${current.id}:${current.status}`;
        if (navKey.current === key) return;
        if (current.status === "em_andamento") {
          navKey.current = key;
          router.replace("/(motorista)/em-andamento");
        }
      } catch {
        // keep polling
      }
    };

    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token, activeRideId, user?.id, chatOpen]);

  const arrived = async () => {
    if (!ride || busy) return;
    try {
      setBusy(true);
      await api.updateRide(token!, ride.id, { status: "a_caminho" });
      await api.updateRide(token!, ride.id, { status: "em_andamento" });
      router.replace("/(motorista)/em-andamento");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível iniciar a corrida");
    } finally {
      setBusy(false);
    }
  };

  const messageClient = () => {
    if (!ride || !token) return;
    setChatOpen(true);
  };

  const mapLat = ride?.origin.lat ?? -23.55;
  const mapLng = ride?.origin.lng ?? -46.63;

  return (
    <Screen>
      <MapPlaceholder height={360} label="Até o passageiro" route lat={mapLat} lng={mapLng} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Buscar passageiro</Text>
        <Text style={styles.name}>{ride?.clientName || "Carregando…"}</Text>
        <Text style={styles.addr}>{ride?.origin?.address || "—"}</Text>
        <Text style={styles.dest}>Destino: {ride?.destination?.label || "—"}</Text>
        <View style={styles.actions}>
          <Button title="Mensagem" variant="secondary" style={{ flex: 1 }} onPress={messageClient} disabled={!ride} />
          <Button
            title={busy ? "Iniciando..." : "Cheguei"}
            onPress={arrived}
            style={{ flex: 1 }}
            disabled={!ride || busy}
            loading={busy}
          />
        </View>
        <Pressable
          onPress={() => {
            if (!ride || busy) return;
            Alert.alert("Cancelar corrida?", "O passageiro será notificado.", [
              { text: "Não", style: "cancel" },
              {
                text: "Sim, cancelar",
                style: "destructive",
                onPress: async () => {
                  try {
                    setBusy(true);
                    await api.updateRide(token!, ride.id, { status: "cancelada" });
                    setActiveRideId(null);
                    router.replace("/(motorista)/(tabs)/inicio");
                  } catch (e: any) {
                    Alert.alert("Erro", e.message || "Não foi possível cancelar");
                  } finally {
                    setBusy(false);
                  }
                },
              },
            ]);
          }}
          disabled={busy}
        >
          <Text style={[styles.cancel, busy && { opacity: 0.5 }]}>Cancelar corrida</Text>
        </Pressable>
      </View>
      {ride && user && token ? (
        <RideChatModal
          visible={chatOpen}
          onClose={() => setChatOpen(false)}
          token={token}
          rideId={ride.id}
          myUserId={user.id}
          peerName={ride.clientName || "Passageiro"}
          quickReplies={["Chegando", "Estou no local", "Onde você está?"]}
        />
      ) : null}
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
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  cancel: { color: theme.colors.danger, textAlign: "center", marginTop: 16, fontWeight: "700" },
});
