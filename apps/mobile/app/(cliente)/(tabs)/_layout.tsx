import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../src/theme";

export default function ClienteTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.navy,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="atividade"
        options={{
          title: "Atividade",
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="carteira"
        options={{
          title: "Carteira",
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: "Conta",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
