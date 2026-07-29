import { Alert } from "react-native";
import { api } from "@vaija/shared";

export function sendQuickRideMessage(
  token: string,
  rideId: string,
  peerName: string,
  options: string[],
  onSent?: () => void,
) {
  Alert.alert(`Mensagem para ${peerName}`, "Escolha uma mensagem rápida", [
    { text: "Cancelar", style: "cancel" },
    ...options.map((text) => ({
      text,
      onPress: async () => {
        try {
          await api.sendRideMessage(token, rideId, text);
          onSent?.();
          Alert.alert("Enviado", "Mensagem entregue na corrida.");
        } catch (e: any) {
          Alert.alert("Erro", e.message || "Não foi possível enviar");
        }
      },
    })),
  ]);
}

/** First poll only seeds seen IDs; later polls alert for new peer messages. */
export function watchRideMessages(
  token: string,
  rideId: string,
  myUserId: string,
  state: { seen: Set<string>; primed: boolean },
  onIncoming: (text: string, fromName: string) => void,
) {
  return api
    .getRideMessages(token, rideId)
    .then((msgs) => {
      for (const m of msgs) {
        if (state.seen.has(m.id)) continue;
        state.seen.add(m.id);
        if (!state.primed) continue;
        if (m.fromUserId !== myUserId) onIncoming(m.text, m.fromName);
      }
      state.primed = true;
    })
    .catch(() => {});
}
