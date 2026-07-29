import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { loadJson, saveJson } from "../../src/prefs";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

type Contact = { name: string; phone: string };

const CONTACTS_KEY = "vaija_emergency_contacts";

export default function SegurancaScreen() {
  const router = useRouter();
  const { token, activeRideId, user } = useAuth();
  const [record, setRecord] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadJson<Contact[]>(CONTACTS_KEY, []).then((saved) => {
      if (saved.length) setContacts(saved);
      else {
        setContacts([{ name: "Contato principal", phone: user?.phone || "(11) 90000-0000" }]);
      }
    });
  }, [user?.phone]);

  const persist = async (next: Contact[]) => {
    setContacts(next);
    await saveJson(CONTACTS_KEY, next);
  };

  const sos = async () => {
    try {
      setLoading(true);
      await api.createSos(token!, { rideId: activeRideId || undefined });
      Alert.alert("SOS enviado", "O admin foi notificado imediatamente.");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Preencha nome e telefone");
      return;
    }
    persist([...contacts, { name: name.trim(), phone: phone.trim() }]);
    setName("");
    setPhone("");
    setShowForm(false);
  };

  return (
    <Screen style={{ padding: 20, paddingTop: 52 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Segurança</Title>

      <Pressable style={styles.sos} onPress={sos} disabled={loading}>
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>
      <Text style={styles.hint}>Use apenas em emergências reais</Text>

      <Text style={styles.section}>Contatos de emergência</Text>
      {contacts.map((c, i) => (
        <View key={`${c.phone}-${i}`} style={styles.contact}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{c.name}</Text>
            <Text style={styles.contactPhone}>{c.phone}</Text>
          </View>
        </View>
      ))}
      {showForm ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor={theme.colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button title="Salvar contato" onPress={addContact} />
        </View>
      ) : (
        <Pressable onPress={() => setShowForm(true)}>
          <Text style={styles.add}>+ Adicionar contato</Text>
        </Pressable>
      )}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Gravar áudio da viagem</Text>
        <Switch value={record} onValueChange={setRecord} trackColor={{ true: theme.colors.yellow }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sos: {
    marginTop: 32,
    alignSelf: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: { color: "#fff", fontWeight: "900", fontSize: 28 },
  hint: { textAlign: "center", color: theme.colors.textMuted, marginTop: 10 },
  section: { marginTop: 28, fontWeight: "800", color: theme.colors.navy, marginBottom: 8 },
  contact: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactName: { fontWeight: "700", color: theme.colors.navy },
  contactPhone: { color: theme.colors.textMuted, marginTop: 2 },
  add: { color: theme.colors.blue, fontWeight: "700", marginTop: 12 },
  form: { marginTop: 12, gap: 10 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.gray,
    color: theme.colors.navy,
  },
  row: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: { fontWeight: "600", color: theme.colors.navy },
});
