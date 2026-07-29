import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Coupon } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function CuponsScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const setBooking = useAuth((s) => s.setBooking);
  const [code, setCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.getCoupons(token).then(setCoupons).catch(() => {});
    }, [token])
  );

  const apply = async () => {
    try {
      const c = await api.applyCoupon(token, code);
      setBooking({ couponCode: c.code });
      Alert.alert("Cupom aplicado", c.description);
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Cupons</Title>
        <View style={styles.row}>
          <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Código" autoCapitalize="characters" />
          <Button title="Aplicar" onPress={apply} style={{ width: 100 }} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {coupons.map((c) => (
          <Pressable
            key={c.id}
            style={styles.card}
            onPress={() => {
              setBooking({ couponCode: c.code });
              Alert.alert(c.code, "Cupom selecionado para a próxima corrida");
            }}
          >
            <Text style={styles.code}>{c.code}</Text>
            <Text style={styles.desc}>{c.description}</Text>
            <Text style={styles.exp}>Validade: {c.expiresAt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginTop: 16, alignItems: "center" },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.gray,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    backgroundColor: "#FFF8E1",
  },
  code: { fontWeight: "800", fontSize: 18, color: theme.colors.navy },
  desc: { color: theme.colors.textMuted, marginTop: 4 },
  exp: { color: theme.colors.blue, marginTop: 8, fontSize: 12, fontWeight: "600" },
});
