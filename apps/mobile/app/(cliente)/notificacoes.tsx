import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Title } from "../../src/components/ui";
import { loadJson, saveJson } from "../../src/prefs";
import { theme } from "../../src/theme";

type Prefs = {
  rideUpdates: boolean;
  promos: boolean;
  security: boolean;
};

const KEY = "vaija_notif_prefs";
const DEFAULTS: Prefs = { rideUpdates: true, promos: true, security: true };

export default function NotificacoesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadJson(KEY, DEFAULTS).then((p) => {
      setPrefs(p);
      setReady(true);
    });
  }, []);

  const update = async (partial: Partial<Prefs>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    await saveJson(KEY, next);
  };

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Notificações</Title>
      </View>
      <View style={{ padding: 20, gap: 14, opacity: ready ? 1 : 0.5 }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Atualizações da corrida</Text>
            <Text style={styles.sub}>Status, motorista e chegada</Text>
          </View>
          <Switch
            value={prefs.rideUpdates}
            onValueChange={(v) => update({ rideUpdates: v })}
            trackColor={{ true: theme.colors.green }}
          />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Promoções e cupons</Text>
            <Text style={styles.sub}>Ofertas da vaijá</Text>
          </View>
          <Switch
            value={prefs.promos}
            onValueChange={(v) => update({ promos: v })}
            trackColor={{ true: theme.colors.green }}
          />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Alertas de segurança</Text>
            <Text style={styles.sub}>SOS e avisos importantes</Text>
          </View>
          <Switch
            value={prefs.security}
            onValueChange={(v) => update({ security: v })}
            trackColor={{ true: theme.colors.green }}
          />
        </View>
        <Text style={styles.hint}>Preferências salvas neste aparelho.</Text>
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
