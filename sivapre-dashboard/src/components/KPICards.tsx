import React from 'react';
import { Reporte } from '../App';

interface Props { reportes: Reporte[]; }

// Datos ficticios NOTI y NETLAB para demo
const NOTI_CASOS = 142;
const NETLAB_CONFIRMADOS = 38;

export default function KPICards({ reportes }: Props) {
  const conLarvas = reportes.filter(r => r.observa_larvas === 'Sí, claramente').length;
  const pendientes = reportes.filter(r => r.estado === 'Enviado' || r.estado === 'En Revisión').length;
  const resueltos = reportes.filter(r => r.estado === 'Resuelto').length;

  const kpis = [
    { label: 'Reportes Ciudadanos', value: reportes.length, icon: '📍', color: '#00C49F', sub: 'Total registrados' },
    { label: 'Alertas de Larvas', value: conLarvas, icon: '🦟', color: '#FF6B6B', sub: 'Criaderos confirmados' },
    { label: 'Casos Sospechosos', value: NOTI_CASOS, icon: '🏥', color: '#FFB347', sub: 'Fuente: NOTI (demo)' },
    { label: 'Casos Confirmados', value: NETLAB_CONFIRMADOS, icon: '🧪', color: '#845EF7', sub: 'Fuente: NETLAB (demo)' },
    { label: 'Pendientes', value: pendientes, icon: '⏳', color: '#74C0FC', sub: 'Por atender' },
    { label: 'Resueltos', value: resueltos, icon: '✅', color: '#69DB7C', sub: 'Intervenidos' },
  ];

  return (
    <div className="kpi-grid">
      {kpis.map((k, i) => (
        <div className="kpi-card" key={i} style={{ '--accent': k.color } as any}>
          <div className="kpi-icon">{k.icon}</div>
          <div className="kpi-content">
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
          <div className="kpi-bar" style={{ background: k.color }}></div>
        </div>
      ))}
    </div>
  );
}