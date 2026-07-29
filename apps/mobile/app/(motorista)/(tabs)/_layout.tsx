import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../src/theme";

export default function MotoristaTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.navy,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ganhos"
        options={{
          title: "Ganhos",
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} />,
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
