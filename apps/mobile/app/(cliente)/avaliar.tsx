import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function AvaliarScreen() {
  const router = useRouter();
  const { token, activeRideId, setActiveRideId, clearBooking } = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      if (activeRideId) {
        await api.updateRide(token!, activeRideId, { rating: stars, comment });
      }
      setActiveRideId(null);
      clearBooking();
      router.replace("/(cliente)/(tabs)/inicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <Title>Como foi sua viagem?</Title>
      <Text style={styles.sub}>Avalie seu motorista</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)}>
            <Text style={[styles.star, n <= stars && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Comentário opcional"
        placeholderTextColor={theme.colors.textMuted}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button title="Avaliar" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80 },
  sub: { color: theme.colors.textMuted, marginTop: 6, marginBottom: 24 },
  stars: { flexDirection: "row", gap: 8, marginBottom: 24 },
  star: { fontSize: 36, color: theme.colors.border },
  starOn: { color: theme.colors.yellow },
  input: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    textAlignVertical: "top",
    marginBottom: 20,
    backgroundColor: theme.colors.gray,
    color: theme.colors.navy,
  },
});
