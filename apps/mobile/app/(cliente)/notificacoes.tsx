import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Title } from "../../src/components/ui";
import { theme } from "../../src/theme";

export default function NotificacoesScreen() {
  const router = useRouter();
  const [rideUpdates, setRideUpdates] = useState(true);
  const [promos, setPromos] = useState(true);
  const [security, setSecurity] = useState(true);

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Notificações</Title>
      </View>
      <View style={{ padding: 20, gap: 14 }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Atualizações da corrida</Text>
            <Text style={styles.sub}>Status, motorista e chegada</Text>
          </View>
          <Switch value={rideUpdates} onValueChange={setRideUpdates} trackColor={{ true: theme.colors.green }} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Promoções e cupons</Text>
            <Text style={styles.sub}>Ofertas da vaijá</Text>
          </View>
          <Switch value={promos} onValueChange={setPromos} trackColor={{ true: theme.colors.green }} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Alertas de segurança</Text>
            <Text style={styles.sub}>SOS e avisos importantes</Text>
          </View>
          <Switch value={security} onValueChange={setSecurity} trackColor={{ true: theme.colors.green }} />
        </View>
        <Text style={styles.hint}>Preferências salvas neste aparelho (demo).</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 14,
  },
  label: { fontWeight: "700", color: theme.colors.navy },
  sub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 8 },
});
