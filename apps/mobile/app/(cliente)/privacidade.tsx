import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function PrivacidadeScreen() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const requestDelete = () => {
    Alert.alert(
      "Excluir conta?",
      "Vamos abrir um pedido de exclusão para o suporte. Nesta demo você também será desconectado.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Solicitar exclusão",
          style: "destructive",
          onPress: async () => {
            if (!token || busy) return;
            try {
              setBusy(true);
              await api.createTicket(token, {
                category: "Conta",
                subject: "Exclusão de conta",
                message: `Pedido de exclusão da conta ${user?.email || user?.id || ""}. Remover dados pessoais, corridas e carteira conforme LGPD (demo).`,
              });
              Alert.alert("Pedido enviado", "O suporte recebeu sua solicitação de exclusão.", [
                {
                  text: "Sair",
                  onPress: async () => {
                    await logout();
                    router.replace("/(auth)/welcome");
                  },
                },
              ]);
            } catch (e: any) {
              Alert.alert("Erro", e.message || "Não foi possível enviar o pedido");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

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
            Você pode solicitar a exclusão da conta. O pedido aparece no painel de suporte do admin.
          </Text>
          <Button
            title={busy ? "Enviando..." : "Solicitar exclusão da conta"}
            variant="outline"
            onPress={requestDelete}
            disabled={busy}
            loading={busy}
            style={{ marginTop: 14 }}
          />
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
