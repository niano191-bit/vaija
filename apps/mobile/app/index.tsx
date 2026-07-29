import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Logo } from "../src/components/ui";
import { useAuth } from "../src/store";
import { theme } from "../src/theme";
import { brand } from "@vaija/shared";

export default function SplashScreen() {
  const router = useRouter();
  const { token, user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      if (token && user) {
        if (user.role === "motorista") router.replace("/(motorista)/(tabs)/inicio");
        else router.replace("/(cliente)/(tabs)/inicio");
      } else {
        router.replace("/(auth)/welcome");
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [hydrated, token, user]);

  return (
    <View style={styles.container}>
      <Logo size="lg" />
      <Text style={styles.tag}>{brand.splashTagline}</Text>
      <View style={styles.wave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  tag: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 16,
    fontSize: 15,
    textAlign: "center",
  },
  wave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: theme.colors.yellow,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});
