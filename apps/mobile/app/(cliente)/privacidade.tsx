import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Title } from "../../src/components/ui";
import { theme } from "../../src/theme";

export default function PrivacidadeScreen() {
  const router = useRouter();

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Privacidade</Title>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Como usamos seus dados</Text>
          <Text style={styles.body}>
            A vaijá usa nome, telefone, localização e histórico de corridas para conectar você a motoristas,
            calcular rotas e oferecer suporte. Dados de pagamento ficam com o processador financeiro.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Localização</Text>
          <Text style={styles.body}>
            A localização é usada durante a solicitação e a corrida. Você pode negar permissão no aparelho;
            algumas funções ficam limitadas.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Conta e exclusão</Text>
          <Text style={styles.body}>
            Para excluir a conta nesta demo, fale com o suporte no app. Em produção isso dispara o fluxo
            oficial de remoção de dados.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.gray,
    borderRadius: 14,
    padding: 16,
  },
  title: { fontWeight: "800", color: theme.colors.navy, marginBottom: 6 },
  body: { color: theme.colors.textMuted, lineHeight: 20 },
});
