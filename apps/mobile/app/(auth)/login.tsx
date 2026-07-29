import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Input, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("lucas@vaija.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      if (user.role === "motorista") router.replace("/(motorista)/(tabs)/inicio");
      else if (user.role === "admin") {
        Alert.alert("Admin", "Use o painel web em localhost:3000");
        router.replace("/(auth)/welcome");
      } else router.replace("/(cliente)/(tabs)/inicio");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Title>Entrar na sua conta</Title>
      <Text style={styles.sub}>Bem-vindo de volta à vaijá</Text>
      <View style={{ marginTop: 28 }}>
        <Input label="E-mail ou telefone" value={email} onChangeText={setEmail} placeholder="seu@email.com" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
        <Text style={styles.forgot}>Esqueceu a senha?</Text>
        <Button title="Entrar" onPress={onSubmit} loading={loading} />
        <View style={styles.social}>
          <Text style={styles.socialText}>Google</Text>
          <Text style={styles.socialText}>Apple</Text>
          <Text style={styles.socialText}>Facebook</Text>
        </View>
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>
            Não tem conta? <Text style={styles.linkBold}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64 },
  sub: { color: theme.colors.textMuted, marginTop: 6 },
  forgot: { color: theme.colors.blue, alignSelf: "flex-end", marginBottom: 16, fontWeight: "600" },
  social: { flexDirection: "row", justifyContent: "center", gap: 24, marginVertical: 20 },
  socialText: { color: theme.colors.navy, fontWeight: "600" },
  link: { textAlign: "center", color: theme.colors.textMuted },
  linkBold: { color: theme.colors.navy, fontWeight: "700" },
});
