import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function DadosPessoaisScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  const rows = [
    { label: "Nome", value: user?.name || "—" },
    { label: "E-mail", value: user?.email || "—" },
    { label: "Telefone", value: user?.phone || "—" },
    { label: "Tipo de conta", value: user?.role || "—" },
    { label: "Código de indicação", value: user?.referralCode || "—" },
    { label: "Avaliação", value: user?.rating != null ? `★ ${user.rating.toFixed(1)}` : "—" },
  ];

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Dados pessoais</Title>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.label}>{r.label}</Text>
            <Text style={styles.value}>{r.value}</Text>
          </View>
        ))}
        <Text style={styles.hint}>Edição de perfil entra na próxima versão.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.colors.gray,
    borderRadius: 12,
    padding: 14,
  },
  label: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" },
  value: { color: theme.colors.navy, fontWeight: "700", marginTop: 4, fontSize: 15 },
  hint: { color: theme.colors.textMuted, marginTop: 8, fontSize: 12 },
});
