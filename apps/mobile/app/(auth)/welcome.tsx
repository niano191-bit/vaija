import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Logo, Screen } from "../../src/components/ui";
import { theme } from "../../src/theme";
import { brand } from "@vaija/shared";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen navy style={styles.container}>
      <View style={styles.center}>
        <Logo size="lg" />
        <Text style={styles.tag}>{brand.tagline}</Text>
      </View>
      <View style={styles.actions}>
        <Button title="Entrar" onPress={() => router.push("/(auth)/login")} />
        <Button
          title="Criar conta"
          variant="outline"
          style={styles.outline}
          onPress={() => router.push("/(auth)/register")}
        />
        <Text style={styles.hint}>Demo: lucas@vaija.com / carlos@vaija.com — senha 123456</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "space-between", padding: 24, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tag: { color: "rgba(255,255,255,0.8)", marginTop: 12, fontSize: 15 },
  actions: { gap: 12 },
  outline: { borderColor: theme.colors.white },
  hint: { color: "rgba(255,255,255,0.55)", fontSize: 12, textAlign: "center", marginTop: 8 },
});
