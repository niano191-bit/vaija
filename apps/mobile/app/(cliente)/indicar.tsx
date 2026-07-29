import { useRouter } from "expo-router";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function IndicarScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const code = user?.referralCode || "VAIJA10";

  return (
    <Screen style={{ padding: 20, paddingTop: 52 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Indique e ganhe</Title>
      <Text style={styles.sub}>Convide amigos e ganhe R$ 10,00 a cada corrida deles</Text>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{code}</Text>
        <Pressable
          onPress={() => {
            Alert.alert("Copiado", code);
          }}
        >
          <Ionicons name="copy-outline" size={22} color={theme.colors.navy} />
        </Pressable>
      </View>
      <Button
        title="Compartilhar convite"
        onPress={() =>
          Share.share({
            message: `Use meu código ${code} na vaijá e ganhe desconto! mobilidade para sua vida.`,
          })
        }
        style={{ marginTop: 20 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  codeBox: {
    marginTop: 28,
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  code: { fontSize: 28, fontWeight: "800", color: theme.colors.navy, letterSpacing: 2 },
});
