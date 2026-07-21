"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { BUSINESS } from "@/data/business";

/** Approx. coordinates for Ahuza 96, Ra'anana */
const RAANANA_COORDS: [number, number] = [32.1849, 34.8709];

type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type LocationsMapProps = {
  points?: MapPoint[];
};

function createBurgerPinIcon() {
  return L.divIcon({
    className: "locations-leaflet-pin",
    html: `
      <span class="locations-leaflet-pin-shape">
        <span class="locations-leaflet-pin-core" aria-hidden="true">
          <svg class="locations-leaflet-burger" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#fff" d="M4 9.2c0-3.4 3.6-5.4 8-5.4s8 2 8 5.4H4z"/>
            <rect x="4" y="11.2" width="16" height="2.4" rx="1.2" fill="#fff"/>
            <rect x="4" y="15.4" width="16" height="2.8" rx="1.4" fill="#fff"/>
          </svg>
        </span>
      </span>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40]
  });
}

export function LocationsMap({ points }: LocationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pointsKey = useMemo(
    () =>
      JSON.stringify(
        points?.map((point) => [point.id, point.lat, point.lng, point.name]) ?? []
      ),
    [points]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const markers =
      points && points.length > 0
        ? points
        : [
            {
              id: "primary",
              name: `${BUSINESS.name} ${BUSINESS.address.addressLocality}`,
              lat: RAANANA_COORDS[0],
              lng: RAANANA_COORDS[1]
            }
          ];

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true
    }).setView([markers[0].lat, markers[0].lng], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const icon = createBurgerPinIcon();
    const group: L.Layer[] = [];

    markers.forEach((point) => {
      const marker = L.marker([point.lat, point.lng], { icon }).bindPopup(
        `<strong>${point.name}</strong>`
      );
      marker.addTo(map);
      group.push(marker);
    });

    if (group.length > 1) {
      const bounds = L.featureGroup(group as L.Marker[]).getBounds();
      map.fitBounds(bounds.pad(0.25));
    }

    mapRef.current = map;

    const onResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", onResize);

    // Fix initial tile sizing after layout
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
    };
  }, [pointsKey]);

  return <div ref={containerRef} className="locations-map" role="presentation" />;
}
