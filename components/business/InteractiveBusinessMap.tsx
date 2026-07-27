"use client";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl
} from "react-leaflet";

type Props = {
  businessName: string;
  latitude: number;
  longitude: number;
};

const markerIcon = divIcon({
  className: "business-map-marker",
  html: `
    <span style="display:flex;width:36px;height:36px;align-items:center;justify-content:center;border:3px solid white;border-radius:999px 999px 999px 0;background:#16a34a;box-shadow:0 4px 12px rgba(0,0,0,.28);transform:rotate(-45deg);">
      <span style="display:block;width:10px;height:10px;border-radius:999px;background:white;"></span>
    </span>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38]
});

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let animationFrame = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
      });
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

export function InteractiveBusinessMap({
  businessName,
  latitude,
  longitude
}: Props) {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={16}
      minZoom={5}
      maxZoom={19}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-80 w-full bg-muted md:h-96"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      <MapResizeHandler />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <strong>{businessName}</strong>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
