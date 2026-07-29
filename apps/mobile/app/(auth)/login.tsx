import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Input, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

const DEMOS = [
  { label: "Cliente", email: "lucas@vaija.com", hint: "Lucas" },
  { label: "Motorista", email: "carlos@vaija.com", hint: "Carlos" },
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("lucas@vaija.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (overrideEmail?: string) => {
    const mail = (overrideEmail || email).trim();
    try {
      setLoading(true);
      if (overrideEmail) {
        setEmail(overrideEmail);
        setPassword("123456");
      }
      const user = await login(mail, overrideEmail ? "123456" : password);
      if (user.role === "motorista") router.replace("/(motorista)/(tabs)/inicio");
      else if (user.role === "admin") {
        Alert.alert("Admin", "Use o painel: https://vaija-admin.vercel.app");
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

      <View style={styles.demoRow}>
        {DEMOS.map((d) => (
          <Pressable
            key={d.email}
            style={styles.demoChip}
            onPress={() => onSubmit(d.email)}
            disabled={loading}
          >
            <Text style={styles.demoLabel}>{d.label}</Text>
            <Text style={styles.demoHint}>{d.hint}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Input label="E-mail ou telefone" value={email} onChangeText={setEmail} placeholder="seu@email.com" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
        <Text style={styles.forgot}>Esqueceu a senha?</Text>
        <Button title="Entrar" onPress={() => onSubmit()} loading={loading} />
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
  demoRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  demoChip: {
    flex: 1,
    backgroundColor: theme.colors.navy,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  demoLabel: { color: theme.colors.yellow, fontWeight: "800", fontSize: 15 },
  demoHint: { color: "rgba(255,255,255,0.7)", marginTop: 2, fontSize: 12 },
  forgot: { color: theme.colors.blue, alignSelf: "flex-end", marginBottom: 16, fontWeight: "600" },
  link: { textAlign: "center", color: theme.colors.textMuted, marginTop: 20 },
  linkBold: { color: theme.colors.navy, fontWeight: "700" },
});
