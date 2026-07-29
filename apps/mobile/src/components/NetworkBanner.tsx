import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "@vaija/shared";
import { theme } from "../theme";

export function NetworkBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        await api.health();
        if (alive) setOffline(false);
      } catch {
        if (alive) setOffline(true);
      }
    };
    ping();
    const id = setInterval(ping, 12000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Sem conexão com a API. Verifique a internet.</Text>
      <Pressable
        onPress={async () => {
          try {
            await api.health();
            setOffline(false);
          } catch {
            setOffline(true);
          }
        }}
      >
        <Text style={styles.retry}>Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  text: { color: "#fff", flex: 1, fontWeight: "600", fontSize: 13 },
  retry: { color: "#fff", fontWeight: "800", textDecorationLine: "underline" },
});
