import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "../theme";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const fontSize = size === "lg" ? 42 : size === "sm" ? 22 : 32;
  return (
    <View style={styles.logoRow}>
      <View style={styles.speedLines}>
        <View style={[styles.line, { width: 18 }]} />
        <View style={[styles.line, { width: 14 }]} />
        <View style={[styles.line, { width: 10 }]} />
      </View>
      <Text style={[styles.logoText, { fontSize }]}>
        vai<Text style={styles.logoAccent}>já</Text>
      </Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const bg =
    variant === "primary"
      ? theme.colors.yellow
      : variant === "secondary"
        ? theme.colors.navy
        : variant === "danger"
          ? theme.colors.danger
          : "transparent";
  const color =
    variant === "primary"
      ? theme.colors.navy
      : variant === "outline" || variant === "ghost"
        ? theme.colors.navy
        : theme.colors.white;
  const border =
    variant === "outline"
      ? { borderWidth: 1.5, borderColor: theme.colors.navy }
      : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        border,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.btnText, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Screen({
  children,
  style,
  navy,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  navy?: boolean;
}) {
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: navy ? theme.colors.navy : theme.colors.white },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function MapPlaceholder({
  label = "Mapa",
  height = 220,
  route,
}: {
  label?: string;
  height?: number;
  route?: boolean;
}) {
  return (
    <View style={[styles.map, { height }]}>
      <View style={styles.mapGrid} />
      {route ? <View style={styles.routeLine} /> : null}
      <View style={styles.pin} />
      <Text style={styles.mapLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  speedLines: { gap: 3 },
  line: { height: 3, backgroundColor: theme.colors.yellow, borderRadius: 2 },
  logoText: { fontWeight: "800", color: theme.colors.white, fontStyle: "italic" },
  logoAccent: { color: theme.colors.yellow },
  screen: { flex: 1 },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  btnText: { fontWeight: "700", fontSize: 16 },
  label: { color: theme.colors.textMuted, marginBottom: 6, fontSize: 13, fontWeight: "600" },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.gray,
    color: theme.colors.text,
    fontSize: 15,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { fontSize: 24, fontWeight: "800", color: theme.colors.navy },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  map: {
    backgroundColor: "#D6E4F0",
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#9BB8D0",
  },
  routeLine: {
    position: "absolute",
    width: "60%",
    height: 4,
    backgroundColor: theme.colors.blue,
    borderRadius: 4,
    transform: [{ rotate: "-20deg" }],
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.navy,
    borderWidth: 3,
    borderColor: theme.colors.yellow,
  },
  mapLabel: {
    position: "absolute",
    bottom: 10,
    color: theme.colors.navy,
    fontWeight: "600",
    fontSize: 12,
  },
});
