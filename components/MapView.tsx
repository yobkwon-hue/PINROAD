'use client';

import { useEffect, useRef } from 'react';
import { Lock } from '@/lib/types';
import { buildLockSvg, pickerSvg } from '@/lib/lockSvg';

// Leaflet is dynamically required inside effects to avoid SSR issues
type LeafletNS = typeof import('leaflet');
type Map = import('leaflet').Map;
type Marker = import('leaflet').Marker;

interface MapViewProps {
  locks: Lock[];
  onPinClick?: (lock: Lock) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  selectedLockId?: string | null;
  initialCenter?: { lat: number; lng: number };
  initialLevel?: number; // Leaflet zoom: ~13 ≈ city level
  className?: string;
}

const MARKER_W = 44;
const MARKER_H = 62;
const PICKER_W = 60;
const PICKER_H = 84;

export default function MapView({
  locks,
  onPinClick,
  onMapClick,
  selectedPosition,
  selectedLockId,
  initialCenter = { lat: 37.5512, lng: 126.9882 }, // Namsan default
  initialLevel = 13,
  className = '',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const pickerRef = useRef<Marker | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const highlightedElRef = useRef<HTMLElement | null>(null);

  // Init map
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window === 'undefined') return;
      const L = (await import('leaflet')).default ?? (await import('leaflet'));
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialLevel,
        zoomControl: false,
        attributionControl: true,
      });

      // Carto Dark Matter tiles — fits Y2K dark aesthetic perfectly
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        },
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      mapRef.current = map;

      // Force a size recalculation after initial layout
      setTimeout(() => map.invalidateSize(), 50);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      pickerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to center when it changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo([initialCenter.lat, initialCenter.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCenter.lat, initialCenter.lng]);

  // Render lock markers
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locks.forEach((lock) => {
      const svg = buildLockSvg(lock.color, lock.shape, MARKER_W);
      const icon = L.divIcon({
        html: `<div style="width:${MARKER_W}px;height:${MARKER_H}px;line-height:0;cursor:pointer;">${svg}</div>`,
        className: 'lockmap-marker',
        iconSize: [MARKER_W, MARKER_H],
        iconAnchor: [MARKER_W / 2, MARKER_H - 6],
      });
      const marker = L.marker([lock.lat, lock.lng], { icon }).addTo(map);
      if (onPinClick) {
        marker.on('click', () => onPinClick(lock));
      }
      markersRef.current.push(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locks]);

  // Toggle the 'selected' class on the marker DOM when the parent's selection changes.
  // Doing this via DOM mutation avoids recreating all markers on each click.
  useEffect(() => {
    if (highlightedElRef.current) {
      highlightedElRef.current.classList.remove('is-selected');
      highlightedElRef.current = null;
    }
    if (!selectedLockId) return;
    const idx = locks.findIndex((l) => l.id === selectedLockId);
    if (idx < 0) return;
    const marker = markersRef.current[idx];
    const el = marker?.getElement() as HTMLElement | null;
    if (el) {
      el.classList.add('is-selected');
      highlightedElRef.current = el;
    }
  }, [selectedLockId, locks]);

  // Picker marker
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    if (pickerRef.current) {
      pickerRef.current.remove();
      pickerRef.current = null;
    }

    if (selectedPosition) {
      const svg = pickerSvg(PICKER_W);
      const icon = L.divIcon({
        html: `<div style="width:${PICKER_W}px;height:${PICKER_H}px;line-height:0;pointer-events:none;">${svg}</div>`,
        className: 'lockmap-picker',
        iconSize: [PICKER_W, PICKER_H],
        iconAnchor: [PICKER_W / 2, PICKER_H - 6],
      });
      const m = L.marker([selectedPosition.lat, selectedPosition.lng], {
        icon,
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);
      pickerRef.current = m;
    }
  }, [selectedPosition]);

  return <div ref={containerRef} className={`map-shell ${className}`} />;
}
