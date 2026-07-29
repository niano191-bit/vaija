import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function DadosPessoaisScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!token) return;
    try {
      setSaving(true);
      const updated = await api.updateProfile(token, { name: name.trim(), phone: phone.trim() });
      await setUser(updated);
      Alert.alert("Salvo", "Dados atualizados.");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Dados pessoais</Title>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user?.email || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo de conta</Text>
          <Text style={styles.value}>{user?.role || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Código de indicação</Text>
          <Text style={styles.value}>{user?.referralCode || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Avaliação</Text>
          <Text style={styles.value}>
            {user?.rating != null ? `★ ${user.rating.toFixed(1)}` : "—"}
          </Text>
        </View>
        <Button title="Salvar alterações" onPress={save} loading={saving} style={{ marginTop: 8 }} />
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
  input: {
    marginTop: 6,
    color: theme.colors.navy,
    fontWeight: "700",
    fontSize: 15,
    padding: 0,
  },
});
