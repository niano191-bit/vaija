import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api, type RideMessage } from "@vaija/shared";
import { theme } from "../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  token: string;
  rideId: string;
  myUserId: string;
  peerName: string;
  quickReplies: string[];
};

export function RideChatModal({
  visible,
  onClose,
  token,
  rideId,
  myUserId,
  peerName,
  quickReplies,
}: Props) {
  const [messages, setMessages] = useState<RideMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const load = async () => {
    try {
      const msgs = await api.getRideMessages(token, rideId);
      setMessages(msgs);
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    load();
    const id = setInterval(load, 2500);
    return () => clearInterval(id);
  }, [visible, token, rideId]);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const send = async (text: string) => {
    if (busy) return;
    try {
      setBusy(true);
      const msg = await api.sendRideMessage(token, rideId, text);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch {
      // parent can still poll
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <View>
              <Text style={styles.title}>Chat da corrida</Text>
              <Text style={styles.sub}>{peerName}</Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.colors.navy} style={{ marginVertical: 24 }} />
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
              ListEmptyComponent={<Text style={styles.empty}>Nenhuma mensagem ainda</Text>}
              renderItem={({ item }) => {
                const mine = item.fromUserId === myUserId;
                return (
                  <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                    {!mine ? <Text style={styles.from}>{item.fromName}</Text> : null}
                    <Text style={[styles.text, mine && styles.textMine]}>{item.text}</Text>
                  </View>
                );
              }}
            />
          )}

          <Text style={styles.quickLabel}>Mensagens rápidas</Text>
          <View style={styles.quickRow}>
            {quickReplies.map((q) => (
              <Pressable key={q} style={[styles.chip, busy && { opacity: 0.5 }]} disabled={busy} onPress={() => send(q)}>
                <Text style={styles.chipText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  dismiss: { flex: 1 },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 28,
    maxHeight: "75%",
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  title: { fontWeight: "800", fontSize: 18, color: theme.colors.navy },
  sub: { color: theme.colors.textMuted, marginTop: 2 },
  close: { color: theme.colors.blue, fontWeight: "700" },
  list: { maxHeight: 280 },
  empty: { textAlign: "center", color: theme.colors.textMuted, marginVertical: 24 },
  bubble: { maxWidth: "82%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: "flex-end", backgroundColor: theme.colors.navy },
  theirs: { alignSelf: "flex-start", backgroundColor: theme.colors.gray },
  from: { fontSize: 11, fontWeight: "700", color: theme.colors.textMuted, marginBottom: 2 },
  text: { color: theme.colors.navy, lineHeight: 18 },
  textMine: { color: theme.colors.white },
  quickLabel: { marginTop: 12, marginBottom: 8, fontWeight: "700", color: theme.colors.navy, fontSize: 13 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: theme.colors.yellow,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontWeight: "600", color: theme.colors.navy, fontSize: 13 },
});
