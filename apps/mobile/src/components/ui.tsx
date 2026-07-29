import React from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { WebView } from "react-native-webview";
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
  lat = -23.55,
  lng = -46.63,
}: {
  label?: string;
  height?: number;
  route?: boolean;
  lat?: number;
  lng?: number;
}) {
  const delta = route ? 0.035 : 0.02;
  // Round coords so tiny float noise doesn't reload the map
  const rLat = Math.round(lat * 1e4) / 1e4;
  const rLng = Math.round(lng * 1e4) / 1e4;
  const bbox = `${rLng - delta},${rLat - delta},${rLng + delta},${rLat + delta}`;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${rLat}%2C${rLng}`;
  const osmExternal = `https://www.openstreetmap.org/?mlat=${rLat}&mlon=${rLng}#map=14/${rLat}/${rLng}`;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.map, { height }]}>
        {/* @ts-expect-error web-only iframe */}
        <iframe
          title={label}
          src={osmSrc}
          style={{ border: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapLabel}>{label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.map, { height }]}>
      <WebView
        source={{ uri: osmSrc }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFillObject, styles.mapLoading]}>
            <ActivityIndicator color={theme.colors.yellow} />
          </View>
        )}
        onError={() => Linking.openURL(osmExternal)}
      />
      <Pressable style={styles.mapOverlay} onPress={() => Linking.openURL(osmExternal)}>
        <Text style={styles.mapLabel}>{label}</Text>
        <Text style={styles.mapHint}>Toque para ampliar</Text>
      </Pressable>
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
  },
  mapLoading: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D6E4F0",
  },
  mapOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(11, 31, 58, 0.78)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapLabel: { color: theme.colors.white, fontWeight: "800", fontSize: 13 },
  mapHint: { color: theme.colors.yellow, fontSize: 11, marginTop: 2, fontWeight: "600" },
});
