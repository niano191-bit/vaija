import { Platform } from "react-native";
import type { Place } from "@vaija/shared";

const FALLBACK: Place = {
  id: "meu-local",
  label: "Meu local",
  address: "Localização aproximada — São Paulo",
  lat: -23.55,
  lng: -46.63,
  icon: "pin",
};

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = encodeURIComponent(`${query}, São Paulo, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=br&q=${q}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR",
    },
  });
  if (!res.ok) throw new Error("Falha na busca de endereço");
  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
  }>;
  return data.map((item) => {
    const parts = item.display_name.split(",");
    const label = (item.name || parts[0] || query).trim();
    return {
      id: `geo-${item.place_id}`,
      label,
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      icon: "pin" as const,
    };
  });
}

async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "Accept-Language": "pt-BR" },
  });
  if (!res.ok) {
    return {
      ...FALLBACK,
      lat,
      lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
  const data = (await res.json()) as { display_name?: string; name?: string };
  return {
    id: "meu-local",
    label: "Meu local",
    address: data.display_name || data.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    lat,
    lng,
    icon: "pin",
  };
}

function webPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocalização indisponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

/** Best-effort current place; falls back to São Paulo demo coords. */
export async function getCurrentPlace(): Promise<Place> {
  try {
    if (Platform.OS === "web") {
      const { lat, lng } = await webPosition();
      return reverseGeocode(lat, lng);
    }
  } catch {
    // try native module below
  }

  try {
    const Location = await import("expo-location");
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status === "granted") {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    }
  } catch {
    // expo-location not installed or denied
  }

  return FALLBACK;
}

/** Distance in km (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))).toFixed(2);
}
