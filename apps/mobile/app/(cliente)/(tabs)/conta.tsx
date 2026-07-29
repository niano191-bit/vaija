import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen } from "../../../src/components/ui";
import { useAuth } from "../../../src/store";
import { theme } from "../../../src/theme";

const MENU = [
  { label: "Dados pessoais", icon: "person-outline", route: null },
  { label: "Formas de pagamento", icon: "card-outline", route: "/(cliente)/(tabs)/carteira" },
  { label: "Favoritos", icon: "heart-outline", route: "/(cliente)/favoritos" },
  { label: "Cupons", icon: "pricetag-outline", route: "/(cliente)/cupons" },
  { label: "Indicar amigos", icon: "people-outline", route: "/(cliente)/indicar" },
  { label: "Segurança / SOS", icon: "shield-checkmark-outline", route: "/(cliente)/seguranca" },
  { label: "Notificações", icon: "notifications-outline", route: null },
  { label: "Privacidade", icon: "lock-closed-outline", route: null },
  { label: "Ajuda / Suporte", icon: "headset-outline", route: "/(cliente)/suporte" },
];

export default function ContaScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  return (
    <Screen style={{ paddingTop: 56 }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || "U"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>

        {MENU.map((item) => (
          <Pressable
            key={item.label}
            style={styles.row}
            onPress={() => {
              if (item.route) router.push(item.route as any);
              else Alert.alert(item.label, "Em breve nesta demo");
            }}
          >
            <Ionicons name={item.icon as any} size={20} color={theme.colors.navy} />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}

        <Pressable onPress={onLogout} style={{ marginTop: 24 }}>
          <Text style={styles.logout}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: theme.colors.yellow, fontSize: 28, fontWeight: "800" },
  name: { marginTop: 12, fontWeight: "800", fontSize: 20, color: theme.colors.navy },
  phone: { color: theme.colors.textMuted, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: { flex: 1, fontWeight: "600", color: theme.colors.navy },
  logout: { color: theme.colors.danger, fontWeight: "700", textAlign: "center", fontSize: 16 },
});
