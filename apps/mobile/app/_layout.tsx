import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../src/store";
import { theme } from "../src/theme";

export default function RootLayout() {
  const { hydrated, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.navy }}>
        <ActivityIndicator color={theme.colors.yellow} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.white } }} />
    </>
  );
}
