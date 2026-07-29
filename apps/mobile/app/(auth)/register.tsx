import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Input, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [asDriver, setAsDriver] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const user = await register({
        name,
        email: email.trim(),
        phone,
        password,
        role: asDriver ? "motorista" : "cliente",
      });
      if (user.role === "motorista") router.replace("/(motorista)/(tabs)/inicio");
      else router.replace("/(cliente)/(tabs)/inicio");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Title>Criar conta</Title>
      <Text style={styles.sub}>Mobilize sua vida com a vaijá</Text>
      <View style={{ marginTop: 24 }}>
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
        <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" />
        <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable onPress={() => setAsDriver((v) => !v)} style={styles.role}>
          <View style={[styles.check, asDriver && styles.checkOn]} />
          <Text style={styles.roleText}>Quero ser motorista</Text>
        </Pressable>
        <Button title="Criar conta" onPress={onSubmit} loading={loading} />
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64 },
  sub: { color: theme.colors.textMuted, marginTop: 6 },
  role: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.navy,
  },
  checkOn: { backgroundColor: theme.colors.yellow },
  roleText: { color: theme.colors.navy, fontWeight: "600" },
  link: { textAlign: "center", marginTop: 16, color: theme.colors.navy, fontWeight: "600" },
});
