import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Favorite } from "@vaija/shared";
import { Screen, Title } from "../../src/components/ui";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function FavoritosScreen() {
  const router = useRouter();
  const token = useAuth((s) => s.token)!;
  const [list, setList] = useState<Favorite[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.getFavorites(token).then(setList).catch(() => {});
    }, [token])
  );

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
          </Pressable>
          <Title style={{ marginTop: 12 }}>Favoritos</Title>
        </View>
        <Pressable
          onPress={async () => {
            await api.addFavorite(token, {
              id: `p-${Date.now()}`,
              label: "Novo local",
              address: "Endereço salvo",
              lat: -23.55,
              lng: -46.63,
            });
            const favs = await api.getFavorites(token);
            setList(favs);
          }}
        >
          <Text style={styles.add}>+ Adicionar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {list.map((f) => (
          <View key={f.id} style={styles.row}>
            <Ionicons name="heart" size={18} color={theme.colors.danger} />
            <View>
              <Text style={styles.label}>{f.place.label}</Text>
              <Text style={styles.addr}>{f.place.address}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { color: theme.colors.blue, fontWeight: "700", marginTop: 36 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: { fontWeight: "700", color: theme.colors.navy },
  addr: { color: theme.colors.textMuted, fontSize: 12 },
});
