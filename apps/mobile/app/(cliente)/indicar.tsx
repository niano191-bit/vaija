import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

async function copyText(text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  await Share.share({ message: text });
  return false;
}

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
          onPress={async () => {
            const copied = await copyText(code);
            Alert.alert(copied ? "Copiado" : "Pronto", code);
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
      {Platform.OS !== "web" ? (
        <Text style={styles.hint}>No celular, o copiar abre o compartilhar se a área de transferência não estiver disponível.</Text>
      ) : null}
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
  hint: { color: theme.colors.textMuted, fontSize: 11, marginTop: 12 },
});
