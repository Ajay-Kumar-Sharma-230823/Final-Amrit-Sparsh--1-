'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';

/* ══════════════════════════════════════════════════════════════════════════
   EXPORTED TYPES (consumed by MedicalServicesModule)
══════════════════════════════════════════════════════════════════════════ */
export interface RealPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km: number;
  distance: string;
  phone?: string;
  rating?: number;
  isOpen?: boolean;
  placeType: 'jan_aushadhi' | 'pharmacy' | 'chain';
  source?: 'overpass' | 'static';
}

interface LiveMapProps {
  places: RealPlace[];
  selectedPlace: RealPlace | null;
  onPlaceSelect: (place: RealPlace) => void;
  userLat: number;
  userLng: number;
  searchRadius?: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════════════ */
const valid = (n: number) => typeof n === 'number' && isFinite(n) && !isNaN(n);

const PLACE_COLORS: Record<string, string> = {
  jan_aushadhi: '#10b981',
  pharmacy:     '#6366f1',
  chain:        '#f97316',
};

/* ══════════════════════════════════════════════════════════════════════════
   ICON FACTORIES
══════════════════════════════════════════════════════════════════════════ */
function createShopMarker(
  L: typeof import('leaflet'),
  type: string,
  selected: boolean,
) {
  const color = PLACE_COLORS[type] || '#6366f1';
  const size  = selected ? 48 : 36;
  const pulse = selected
    ? `<circle cx="24" cy="24" r="23" fill="${color}" opacity="0.14"/>`
    : '';
  const shadow = selected
    ? `filter="drop-shadow(0 3px 6px ${color}66)"`
    : `filter="drop-shadow(0 2px 4px ${color}44)"`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size + 10}" height="${size + 22}" viewBox="0 0 58 70">
      ${pulse}
      <g ${shadow}>
        <circle cx="29" cy="26" r="${selected ? 24 : 20}" fill="${color}"/>
        <circle cx="29" cy="26" r="${selected ? 17 : 14}" fill="white" opacity="0.96"/>
        <text x="29" y="${selected ? 32 : 31}" text-anchor="middle" font-size="${selected ? 16 : 13}"
              font-family="Apple Color Emoji,Noto Emoji,Segoe UI Emoji,sans-serif">💊</text>
        <polygon points="29,${selected ? 50 : 46} ${selected ? 20 : 21},${selected ? 37 : 35} ${selected ? 38 : 37},${selected ? 37 : 35}" fill="${color}"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html:        svg,
    className:   '',
    iconSize:    [size + 10, size + 22] as [number, number],
    iconAnchor:  [(size + 10) / 2, size + 22] as [number, number],
    popupAnchor: [0, -(size + 22)] as [number, number],
  });
}

function createUserMarker(L: typeof import('leaflet')) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="13" fill="#3b82f6" opacity="0.16"/>
      <circle cx="15" cy="15" r="9"  fill="#3b82f6" opacity="0.55"/>
      <circle cx="15" cy="15" r="6"  fill="white"/>
      <circle cx="15" cy="15" r="4"  fill="#3b82f6"/>
    </svg>
  `;
  return L.divIcon({
    html:        svg,
    className:   '',
    iconSize:    [30, 30] as [number, number],
    iconAnchor:  [15, 15] as [number, number],
    popupAnchor: [0, -15] as [number, number],
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   MAP FLY-TO CONTROLLER
══════════════════════════════════════════════════════════════════════════ */
function MapController({
  selectedPlace, fallbackLat, fallbackLng,
}: {
  selectedPlace: RealPlace | null;
  fallbackLat: number;
  fallbackLng: number;
}) {
  const map     = useMap();
  const prevId  = useRef<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (selectedPlace && selectedPlace.id !== prevId.current) {
      if (valid(selectedPlace.lat) && valid(selectedPlace.lng)) {
        map.flyTo([selectedPlace.lat, selectedPlace.lng], 17, { duration: 1.1 });
      }
      prevId.current = selectedPlace.id;
    } else if (!selectedPlace && prevId.current !== null) {
      map.flyTo([fallbackLat, fallbackLng], 14, { duration: 0.9 });
      prevId.current = null;
    }
  }, [selectedPlace, map, fallbackLat, fallbackLng]);

  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   RADIUS FIT CONTROLLER — re-centres and re-zooms when radius changes
══════════════════════════════════════════════════════════════════════════ */
function MapFitRadius({ lat, lng, radiusM }: { lat: number; lng: number; radiusM: number }) {
  const map     = useMap();
  const prevRef = useRef<number>(radiusM); // initialise to current → skip first render

  useEffect(() => {
    if (prevRef.current === radiusM) return; // no change — do nothing
    prevRef.current = radiusM;

    // Pick zoom so the full circle is comfortably visible
    let zoom = 13;
    if      (radiusM <= 1000) zoom = 15;
    else if (radiusM <= 2000) zoom = 14;
    else if (radiusM <= 3000) zoom = 13;
    else                      zoom = 12; // 5 km

    map.flyTo([lat, lng], zoom, { duration: 0.75, animate: true });
  // lat/lng used inside but we only want to fire on radius change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusM]);

  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN LIVEMAP
══════════════════════════════════════════════════════════════════════════ */
export default function LiveMap({
  places, selectedPlace, onPlaceSelect, userLat, userLng, searchRadius = 3000,
}: LiveMapProps) {
  const LeafletRef = useRef<typeof import('leaflet') | null>(null);
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      LeafletRef.current = L;
      setReady(true);
    });
  }, []);

  const lat       = valid(userLat) ? userLat : 22.7196;
  const lng       = valid(userLng) ? userLng : 75.8577;
  const radiusKm  = searchRadius / 1000;

  // ── STRICT RADIUS FILTER ─────────────────────────────────────────────
  // Only render markers whose distance_km is within the selected radius.
  // This is the single source of truth — nothing outside the circle appears.
  const validPlaces = places.filter(p =>
    valid(p.lat) && valid(p.lng) && p.distance_km <= radiusKm,
  );

  if (!ready || !LeafletRef.current) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#0f172a,#1e293b)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid rgba(16,185,129,.15)', borderTopColor: '#10b981',
          borderRadius: '50%', animation: 'ms-spin .8s linear infinite',
        }} />
        <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, fontWeight: 600 }}>
          Loading map…
        </span>
      </div>
    );
  }

  const L = LeafletRef.current;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      {/* Dark premium tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <MapController selectedPlace={selectedPlace} fallbackLat={lat} fallbackLng={lng} />
      {/* Re-centres map and adjusts zoom whenever radius changes */}
      <MapFitRadius lat={lat} lng={lng} radiusM={searchRadius} />

      {/* ── User location blue dot ── */}
      <Marker position={[lat, lng]} icon={createUserMarker(L)}>
        <Popup>
          <div style={{ fontFamily: 'system-ui', padding: '2px 0' }}>
            <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: 13 }}>📍 Your Location</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>GPS position</div>
          </div>
        </Popup>
      </Marker>

      {/* ── Search radius ring ── */}
      <Circle
        center={[lat, lng]}
        radius={searchRadius}
        pathOptions={{
          color: '#10b981', fillColor: '#10b981',
          fillOpacity: 0.03, weight: 1.5, dashArray: '5 5',
        }}
      />

      {/* ── Pharmacy markers ── */}
      {validPlaces.map(place => {
        const isSelected = selectedPlace?.id === place.id;
        const tc = PLACE_COLORS[place.placeType] || '#6366f1';

        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createShopMarker(L, place.placeType, isSelected)}
            eventHandlers={{ click: () => onPlaceSelect(place) }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup maxWidth={270} minWidth={220}>
              <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', padding: '4px 0' }}>

                {/* Name */}
                <div style={{
                  fontWeight: 800, fontSize: 14, color: '#0f172a',
                  lineHeight: 1.3, marginBottom: 5,
                }}>
                  {place.name}
                </div>

                {/* Type + Open badges */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10,
                    background: `${tc}15`, color: tc, border: `1px solid ${tc}30`,
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {place.placeType === 'jan_aushadhi' ? '🟢 Jan Aushadhi'
                      : place.placeType === 'chain' ? '🟠 Chain Pharmacy'
                      : '🔵 Medical Store'}
                  </span>
                  {place.isOpen !== undefined && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 10,
                      background: place.isOpen ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.08)',
                      color: place.isOpen ? '#059669' : '#dc2626',
                      border: `1px solid ${place.isOpen ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.2)'}`,
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {place.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  )}
                </div>

                {/* Distance + Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: tc, lineHeight: 1 }}>
                    {place.distance}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>away</span>
                  {place.rating != null && (
                    <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginLeft: 'auto' }}>
                      ⭐ {place.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Address */}
                {place.address && (
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>
                    📍 {place.address}
                  </div>
                )}

                {/* CTA */}
                {place.phone ? (
                  <a
                    href={`tel:${place.phone}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '9px', borderRadius: 10,
                      background: `linear-gradient(135deg,${tc},${tc}cc)`,
                      color: 'white', fontWeight: 700, fontSize: 12, textDecoration: 'none',
                    }}
                  >
                    📞 Call Now
                  </a>
                ) : (
                  <div style={{
                    padding: '8px', borderRadius: 10, textAlign: 'center',
                    background: `${tc}12`, border: `1px solid ${tc}25`,
                    color: tc, fontWeight: 700, fontSize: 12,
                  }}>
                    📍 View on Map
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
