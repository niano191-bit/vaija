import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, type Favorite } from "@vaija/shared";
import { Button, Screen, Title } from "../../src/components/ui";
import { getCurrentPlace, searchPlaces } from "../../src/geo";
import { useAuth } from "../../src/store";
import { theme } from "../../src/theme";

export default function FavoritosScreen() {
  const router = useRouter();
  const { token, setBooking } = useAuth();
  const [list, setList] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      setLoading(true);
      setList(await api.getFavorites(token));
    } catch (e: any) {
      setError(e.message || "Falha ao carregar favoritos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const useAsDestination = async (f: Favorite) => {
    const origin = await getCurrentPlace();
    setBooking({
      origin,
      destination: f.place,
    });
    router.push("/(cliente)/categoria");
  };

  const addFavorite = async () => {
    if (!token) return;
    const name = label.trim() || "Novo local";
    const addr = address.trim() || name;
    try {
      const found = (await searchPlaces(addr))[0] || (await searchPlaces(name))[0];
      await api.addFavorite(token, {
        id: found?.id || `custom-${Date.now()}`,
        label: name,
        address: found?.address || addr,
        lat: found?.lat ?? -23.55,
        lng: found?.lng ?? -46.63,
        icon: "pin",
      });
      setLabel("");
      setAddress("");
      setAdding(false);
      await load();
      Alert.alert("Salvo", found ? `${name} geolocalizado e salvo` : `${name} adicionado aos favoritos`);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível salvar");
    }
  };

  return (
    <Screen style={{ paddingTop: 52 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.navy} />
          </Pressable>
          <Title style={{ marginTop: 12 }}>Favoritos</Title>
        </View>
        <Pressable onPress={() => setAdding((v) => !v)}>
          <Text style={styles.add}>{adding ? "Cancelar" : "+ Adicionar"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {adding ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome (ex: Casa)"
              placeholderTextColor={theme.colors.textMuted}
              value={label}
              onChangeText={setLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              placeholderTextColor={theme.colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />
            <Button title="Salvar favorito" onPress={addFavorite} />
          </View>
        ) : null}

        {error ? (
          <Pressable onPress={load}>
            <Text style={styles.error}>{error} · tocar para tentar de novo</Text>
          </Pressable>
        ) : null}

        {loading ? <Text style={styles.empty}>Carregando...</Text> : null}

        {!loading && !error && list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyHint}>Salve locais para pedir corrida com 1 toque</Text>
            <Button title="Adicionar local" onPress={() => setAdding(true)} style={{ marginTop: 16 }} />
          </View>
        ) : null}

        {list.map((f) => (
          <Pressable key={f.id} style={styles.row} onPress={() => useAsDestination(f)}>
            <Ionicons name="heart" size={18} color={theme.colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{f.place.label}</Text>
              <Text style={styles.addr}>{f.place.address}</Text>
              <Text style={styles.cta}>Usar como destino →</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { color: theme.colors.blue, fontWeight: "700", marginTop: 36 },
  form: { gap: 10, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.gray,
    color: theme.colors.navy,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  label: { fontWeight: "700", color: theme.colors.navy },
  addr: { color: theme.colors.textMuted, fontSize: 12 },
  cta: { color: theme.colors.blue, fontWeight: "700", fontSize: 12, marginTop: 6 },
  empty: { color: theme.colors.textMuted, textAlign: "center" },
  emptyHint: { color: theme.colors.textMuted, textAlign: "center", fontSize: 12, marginTop: 6 },
  emptyBox: { marginTop: 40, alignItems: "center" },
  error: { color: theme.colors.danger, textAlign: "center", fontWeight: "600" },
});
