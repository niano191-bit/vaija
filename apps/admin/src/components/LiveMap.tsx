"use client";

import { useEffect, useRef } from "react";
import type { Ride } from "@vaija/shared";
import { STATUS_LABELS } from "@vaija/shared";
import "leaflet/dist/leaflet.css";

type DriverRow = {
  userId: string;
  online: boolean;
  lat: number;
  lng: number;
  user?: { name?: string };
};

type Props = {
  rides: Ride[];
  drivers: DriverRow[];
};

const SAO_PAULO: [number, number] = [-23.55, -46.63];

export function LiveMap({ rides, drivers }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      // Fix default marker icons broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(SAO_PAULO, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      layer.clearLayers();
      const bounds: [number, number][] = [];

      for (const r of rides) {
        const o: [number, number] = [r.origin.lat, r.origin.lng];
        const d: [number, number] = [r.destination.lat, r.destination.lng];
        bounds.push(o, d);

        L.polyline([o, d], {
          color: "#1E88E5",
          weight: 4,
          dashArray: "8 8",
          opacity: 0.85,
        }).addTo(layer);

        L.circleMarker(o, {
          radius: 7,
          color: "#fff",
          weight: 2,
          fillColor: "#1E88E5",
          fillOpacity: 1,
        })
          .bindPopup(`Origem: ${r.origin.label}`)
          .addTo(layer);

        L.circleMarker(d, {
          radius: 8,
          color: "#fff",
          weight: 2,
          fillColor: "#0B1F3A",
          fillOpacity: 1,
        })
          .bindPopup(`${r.origin.label} → ${r.destination.label}<br/>${STATUS_LABELS[r.status]}`)
          .addTo(layer);
      }

      for (const d of drivers) {
        const p: [number, number] = [Number(d.lat), Number(d.lng)];
        if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
        bounds.push(p);
        L.circleMarker(p, {
          radius: 9,
          color: "#0B1F3A",
          weight: 2,
          fillColor: "#FFC107",
          fillOpacity: 1,
        })
          .bindPopup(d.user?.name || "Motorista online")
          .addTo(layer);
      }

      if (bounds.length) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else {
        map.setView(SAO_PAULO, 13);
      }
    })();
  }, [rides, drivers]);

  return <div ref={containerRef} className="h-full w-full" />;
}
