// MapaReportes.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { Reporte } from '../App';
import { CapasVisibles } from './Filtros';
import { API_BASE_URL } from '../services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CasoNoti {
  id: string;
  lat: number;
  lng: number;
  tipo_dx: 'S' | 'P' | 'C';
  distrito: string;
  semana: number;
}

interface CasoNetlab {
  id: string;
  lat: number;
  lng: number;
  serotipo: string;
  elisa: string;
  ubigeo: string;
}

interface Props {
  reportes: Reporte[];
  capasVisibles: CapasVisibles;
  casosNoti?: CasoNoti[];
  casosNetlab?: CasoNetlab[];
}

const BASE_URL = API_BASE_URL;

// ─── Datos demo ───────────────────────────────────────────────────────────────

const NOTI_DEMO: CasoNoti[] = [
  { id: 'N1', lat: -12.0464, lng: -77.0428, tipo_dx: 'S', distrito: 'Lima',       semana: 10 },
  { id: 'N2', lat: -12.0600, lng: -77.0300, tipo_dx: 'P', distrito: 'Miraflores', semana: 11 },
  { id: 'N3', lat: -11.9800, lng: -77.0800, tipo_dx: 'S', distrito: 'SMP',        semana: 11 },
  { id: 'N4', lat: -12.1200, lng: -77.0200, tipo_dx: 'P', distrito: 'Surco',      semana: 12 },
  { id: 'N5', lat: -12.0200, lng: -76.9900, tipo_dx: 'S', distrito: 'ATE',        semana: 12 },
  { id: 'N6', lat: -3.7491,  lng: -73.2538, tipo_dx: 'P', distrito: 'Iquitos',    semana: 10 },
  { id: 'N7', lat: -3.7600,  lng: -73.2400, tipo_dx: 'S', distrito: 'Punchana',   semana: 11 },
  { id: 'N8', lat: -6.7700,  lng: -79.8400, tipo_dx: 'P', distrito: 'Chiclayo',   semana: 12 },
];

const NETLAB_DEMO: CasoNetlab[] = [
  { id: 'L1', lat: -12.0500, lng: -77.0500, serotipo: 'DENV-1', elisa: 'Reactivo', ubigeo: '150101' },
  { id: 'L2', lat: -12.0700, lng: -77.0100, serotipo: 'DENV-2', elisa: 'Reactivo', ubigeo: '150118' },
  { id: 'L3', lat: -3.7450,  lng: -73.2600, serotipo: 'DENV-1', elisa: 'Reactivo', ubigeo: '160101' },
  { id: 'L4', lat: -3.7700,  lng: -73.2300, serotipo: 'DENV-3', elisa: 'Reactivo', ubigeo: '160101' },
  { id: 'L5', lat: -6.7800,  lng: -79.8300, serotipo: 'DENV-2', elisa: 'Reactivo', ubigeo: '140101' },
];

// ─── Ícono de alta prioridad para NETLAB ──────────────────────────────────────

const iconoNetlab = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 28px; height: 28px;
      background: #c92a2a;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(201,42,42,0.6);
    ">
      <span style="display:block;transform:rotate(45deg);text-align:center;line-height:22px;font-size:13px;">🧪</span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// ─── Color NOTI según tipo_dx ─────────────────────────────────────────────────

function colorNoti(tipo_dx: 'S' | 'P' | 'C'): { fill: string; stroke: string; label: string } {
  switch (tipo_dx) {
    case 'S': return { fill: '#74C0FC', stroke: '#1971C2', label: 'Sospechoso' };
    case 'P': return { fill: '#339AF0', stroke: '#1864AB', label: 'Probable'   };
    case 'C': return { fill: '#1C7ED6', stroke: '#1339AB', label: 'Confirmado' };
  }
}

// ─── Capa de calor ────────────────────────────────────────────────────────────

function HeatmapLayer({ reportes, visible }: { reportes: Reporte[]; visible: boolean }) {
  const map = useMap();
  const heatRef = useRef<any>(null);

  useEffect(() => {
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }
    if (!visible || reportes.length === 0) return;

    const points = reportes.map(r => [r.latitud, r.longitud, r.observa_larvas === 'Sí, claramente' ? 1.0 : 0.5]);
    heatRef.current = (L as any).heatLayer(points, {
      radius: 30, blur: 20, maxZoom: 17,
      gradient: { 0.2: '#00C49F', 0.5: '#FFB347', 0.8: '#FF6B6B', 1.0: '#cc0000' },
    }).addTo(map);

    return () => { if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportes, visible]);

  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MapaReportes({ reportes, capasVisibles, casosNoti, casosNetlab }: Props) {
  const noti   = casosNoti   ?? NOTI_DEMO;
  const netlab = casosNetlab ?? NETLAB_DEMO;

  const centro: [number, number] = reportes.length > 0
    ? [reportes[0].latitud, reportes[0].longitud]
    : [-9.1900, -75.0152];

  return (
    <MapContainer center={centro} zoom={6} className="mapa-leaflet">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Capa SIVAPRE — Heatmap */}
      <HeatmapLayer reportes={reportes} visible={capasVisibles.sivapre} />

      {/* Capa SIVAPRE — Puntos individuales */}
      {capasVisibles.sivapre && reportes.map(r => (
        <CircleMarker
          key={r.id}
          center={[r.latitud, r.longitud]}
          radius={6}
          fillColor={r.observa_larvas === 'Sí, claramente' ? '#FF6B6B' : '#00C49F'}
          color="#fff" weight={1.5} fillOpacity={0.85}
        >
          <Popup>
            <div className="popup-content">
              {r.foto_url && <img src={`${BASE_URL}${r.foto_url}`} alt="foto del reporte" className="popup-foto" />}
              <strong>{r.tipo_lugar} · {r.tipo_objeto}</strong>
              <p>🦟 Larvas: {r.observa_larvas}</p>
              <p>📅 {new Date(r.fecha_reporte).toLocaleDateString('es-PE')}</p>
              <span className="popup-estado" style={{
                background: r.estado === 'Resuelto' ? '#00C49F' : r.estado === 'Verificado' ? '#69DB7C' : r.estado === 'En Revisión' ? '#FFB347' : '#74C0FC'
              }}>{r.estado}</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Capa NOTI — Sospechosos/Probables */}
      {capasVisibles.noti && noti.map(n => {
        const { fill, stroke, label } = colorNoti(n.tipo_dx);
        return (
          <CircleMarker key={n.id} center={[n.lat, n.lng]} radius={8} fillColor={fill} color={stroke} weight={2} fillOpacity={0.8}>
            <Popup>
              <div className="popup-content">
                <strong>🏥 Caso NOTI</strong>
                <p>Tipo: <span style={{ color: stroke, fontWeight: 'bold' }}>{label}</span></p>
                <p>Distrito: {n.distrito}</p>
                <p>Semana epi: {n.semana}</p>
                <span className="popup-estado" style={{ background: fill }}>{label}</span>
                {casosNoti == null && <p style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Fuente: NOTI (demo)</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Capa NETLAB — Confirmados con ícono de alta prioridad */}
      {capasVisibles.netlab && netlab.map(n => (
        <Marker key={n.id} position={[n.lat, n.lng]} icon={iconoNetlab}>
          <Popup>
            <div className="popup-content">
              <strong>🧪 Caso NETLAB Confirmado</strong>
              <p>🦠 Serotipo: <strong style={{ color: '#c92a2a' }}>{n.serotipo}</strong></p>
              <p>ELISA NS1: {n.elisa}</p>
              <p>UBIGEO: {n.ubigeo}</p>
              <span className="popup-estado" style={{ background: '#FF6B6B' }}>Confirmado</span>
              {casosNetlab == null && <p style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Fuente: NETLAB (demo)</p>}
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}