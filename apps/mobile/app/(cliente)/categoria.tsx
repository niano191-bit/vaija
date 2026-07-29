import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type CategoryQuote } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function CategoriaScreen() {
  const router = useRouter();
  const { token, booking, setBooking } = useAuth();
  const [categories, setCategories] = useState<CategoryQuote[]>([]);
  const [selected, setSelected] = useState(booking.category || "economico");
  const [payment, setPayment] = useState("PIX");

  useEffect(() => {
    if (!token) return;
    api.getCategories(token).then(setCategories).catch(() => {});
    api.getWallet(token).then((w) => {
      const m = w.methods.find((x) => x.selected);
      if (m) setPayment(m.label);
    }).catch(() => {});
  }, [token]);

  const current = categories.find((c) => c.id === selected);

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
        </Pressable>
        <Title style={{ marginTop: 12 }}>Escolha uma categoria</Title>
        <Text style={styles.dest}>Para: {booking.destination?.label}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.item, selected === c.id && styles.itemOn]}
            onPress={() => setSelected(c.id)}
          >
            <Ionicons name="car-sport" size={28} color={theme.colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.meta}>{c.capacity} passageiros · {c.etaMin} min</Text>
            </View>
            <Text style={styles.price}>{formatBRL(c.price)}</Text>
            <View style={[styles.check, selected === c.id && styles.checkOn]} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.payRow}>
          <Text style={styles.pay}>{payment}</Text>
          <Pressable onPress={() => router.push("/(cliente)/(tabs)/carteira")}>
            <Text style={styles.alterar}>Alterar</Text>
          </Pressable>
        </View>
        <Button
          title={`Confirmar ${current?.name || "categoria"}`}
          onPress={() => {
            setBooking({ category: selected as any, paymentMethod: payment });
            router.push("/(cliente)/confirmar");
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dest: { color: theme.colors.textMuted, marginTop: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemOn: { borderColor: theme.colors.yellow, backgroundColor: "#FFF8E1" },
  name: { fontWeight: "700", color: theme.colors.navy },
  meta: { color: theme.colors.textMuted, fontSize: 12 },
  price: { fontWeight: "800", color: theme.colors.navy },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.colors.border },
  checkOn: { backgroundColor: theme.colors.yellow, borderColor: theme.colors.navy },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 12 },
  payRow: { flexDirection: "row", justifyContent: "space-between" },
  pay: { fontWeight: "700", color: theme.colors.navy },
  alterar: { color: theme.colors.blue, fontWeight: "700" },
});
