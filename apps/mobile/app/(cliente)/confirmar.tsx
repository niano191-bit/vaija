import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, formatBRL, type CategoryQuote } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { distanceKm } from "../../src/geo";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function ConfirmarScreen() {
  const router = useRouter();
  const { token, booking, setBooking, setActiveRideId } = useAuth();
  const [quote, setQuote] = useState<CategoryQuote | null>(null);
  const [coupon, setCoupon] = useState(booking.couponCode || "");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const km = useMemo(() => {
    if (!booking.origin || !booking.destination) return 5;
    return Math.max(1, distanceKm(booking.origin, booking.destination));
  }, [booking.origin, booking.destination]);

  useEffect(() => {
    if (!token) return;
    api.getCategories(token, km).then((cats) => {
      setQuote(cats.find((c) => c.id === booking.category) || cats[0]);
    });
  }, [token, booking.category, km]);

  const price = quote ? +(quote.price * (1 - discount / 100)).toFixed(2) : 0;
  const fee = 2.5;
  const total = +(price + fee).toFixed(2);

  const applyCoupon = async () => {
    try {
      const c = await api.applyCoupon(token!, coupon);
      setDiscount(c.discountPercent);
      setBooking({ couponCode: c.code });
      Alert.alert("Cupom", `${c.discountPercent}% aplicado`);
    } catch (e: any) {
      Alert.alert("Cupom", e.message);
    }
  };

  const confirm = async () => {
    if (!booking.origin || !booking.destination || !booking.category) {
      Alert.alert("Erro", "Complete origem, destino e categoria");
      return;
    }
    try {
      setLoading(true);
      const ride = await api.createRide(token!, {
        origin: booking.origin,
        destination: booking.destination,
        category: booking.category,
        couponCode: booking.couponCode,
        paymentMethod: booking.paymentMethod,
        distanceKm: km,
      });
      setActiveRideId(ride.id);
      router.replace("/(cliente)/aguardando");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ paddingTop: 52, paddingHorizontal: 20 }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
      </Pressable>
      <Title style={{ marginTop: 12 }}>Confirmar corrida</Title>

      <View style={styles.route}>
        <Text style={styles.from}>{booking.origin?.label}</Text>
        <Ionicons name="arrow-down" size={16} color={theme.colors.textMuted} />
        <Text style={styles.to}>{booking.destination?.label}</Text>
        <Text style={styles.eta}>
          ~{km.toFixed(1)} km · previsão {quote?.etaMin || 3} min
        </Text>
      </View>

      <View style={styles.couponRow}>
        <TextInput
          style={styles.couponInput}
          placeholder="Cupom"
          value={coupon}
          onChangeText={setCoupon}
          autoCapitalize="characters"
        />
        <Button title="Aplicar" onPress={applyCoupon} style={{ width: 100 }} />
      </View>

      <View style={styles.breakdown}>
        <Row label="Valor da corrida" value={formatBRL(price)} />
        <Row label="Taxa de serviço" value={formatBRL(fee)} />
        <Row label="Total" value={formatBRL(total)} bold />
        <Text style={styles.pay}>Pagamento: {booking.paymentMethod || "PIX"}</Text>
      </View>

      <Button title="Confirmar corrida" onPress={confirm} loading={loading} style={{ marginTop: "auto", marginBottom: 24 }} />
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { fontWeight: "800" }]}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: "800" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  route: { marginTop: 24, gap: 6 },
  from: { fontWeight: "600", color: theme.colors.textMuted },
  to: { fontWeight: "800", fontSize: 18, color: theme.colors.navy },
  eta: { color: theme.colors.blue, marginTop: 8, fontWeight: "600" },
  couponRow: { flexDirection: "row", gap: 8, marginTop: 24, alignItems: "center" },
  couponInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.gray,
  },
  breakdown: { marginTop: 24, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: theme.colors.textMuted },
  rowValue: { color: theme.colors.navy, fontWeight: "600" },
  pay: { marginTop: 8, color: theme.colors.navy, fontWeight: "600" },
});
