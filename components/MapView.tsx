'use client';

import { useEffect, useRef } from 'react';
import { Lock } from '@/lib/types';
import { buildLockSvg, pickerSvg } from '@/lib/lockSvg';

declare global {
  interface Window {
    naver: any;
  }
}

interface MapViewProps {
  locks: Lock[];
  onPinClick?: (lock: Lock) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  initialCenter?: { lat: number; lng: number };
  initialLevel?: number; // Naver zoom: 6~21, ~14 ≈ Kakao level 5
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
  initialCenter = { lat: 37.5512, lng: 126.9882 }, // Namsan
  initialLevel = 14,
  className = '',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const pickerRef = useRef<any>(null);

  // Init — poll until Naver SDK is loaded
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const tryInit = () => {
      if (cancelled) return;
      if (typeof window === 'undefined' || !window.naver?.maps) return;
      if (!containerRef.current || mapRef.current) return;

      const map = new window.naver.maps.Map(containerRef.current, {
        center: new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
        zoom: initialLevel,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.RIGHT_BOTTOM,
        },
        scaleControl: false,
        mapDataControl: false,
        logoControlOptions: { position: window.naver.maps.Position.BOTTOM_LEFT },
      });
      mapRef.current = map;

      if (onMapClick) {
        window.naver.maps.Event.addListener(map, 'click', (e: any) => {
          onMapClick(e.coord.lat(), e.coord.lng());
        });
      }
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    tryInit();
    interval = setInterval(tryInit, 300);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to center when it changes
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;
    const latlng = new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng);
    mapRef.current.panTo(latlng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCenter.lat, initialCenter.lng]);

  // Render lock markers
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    locks.forEach((lock) => {
      const svg = buildLockSvg(lock.color, lock.shape, MARKER_W);
      // Wrap in a positioned div so we can bottom-center anchor cleanly
      const html = `<div style="width:${MARKER_W}px;height:${MARKER_H}px;line-height:0;cursor:pointer;">${svg}</div>`;
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lock.lat, lock.lng),
        map: mapRef.current,
        icon: {
          content: html,
          size: new window.naver.maps.Size(MARKER_W, MARKER_H),
          anchor: new window.naver.maps.Point(MARKER_W / 2, MARKER_H - 6),
        },
      });
      if (onPinClick) {
        window.naver.maps.Event.addListener(marker, 'click', () => onPinClick(lock));
      }
      markersRef.current.push(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locks]);

  // Picker marker
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;

    if (pickerRef.current) {
      pickerRef.current.setMap(null);
      pickerRef.current = null;
    }

    if (selectedPosition) {
      const svg = pickerSvg(PICKER_W);
      const html = `<div style="width:${PICKER_W}px;height:${PICKER_H}px;line-height:0;pointer-events:none;">${svg}</div>`;
      const m = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(selectedPosition.lat, selectedPosition.lng),
        map: mapRef.current,
        icon: {
          content: html,
          size: new window.naver.maps.Size(PICKER_W, PICKER_H),
          anchor: new window.naver.maps.Point(PICKER_W / 2, PICKER_H - 6),
        },
        zIndex: 100,
      });
      pickerRef.current = m;
    }
  }, [selectedPosition]);

  return <div ref={containerRef} className={`map-shell ${className}`} />;
}
