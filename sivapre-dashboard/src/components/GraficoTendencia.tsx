import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Reporte } from '../App';

interface Props { reportes: Reporte[]; }

function getSemana(fecha: Date): string {
  const inicio = new Date(fecha);
  const dia = inicio.getDay();
  const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1);
  inicio.setDate(diff);
  return `${inicio.getDate()}/${inicio.getMonth() + 1}`;
}

export default function GraficoTendencia({ reportes }: Props) {
  const datos = useMemo(() => {
    const semanas: Record<string, { semana: string, criaderos: number, larvas: number, noti: number, netlab: number }> = {};

    // Últimas 12 semanas
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = getSemana(d);
      if (!semanas[key]) {
        semanas[key] = { semana: `S${key}`, criaderos: 0, larvas: 0, noti: 0, netlab: 0 };
      }
    }

    reportes.forEach(r => {
      const key = getSemana(new Date(r.fecha_reporte));
      if (semanas[key]) {
        semanas[key].criaderos++;
        if (r.observa_larvas === 'Sí, claramente') semanas[key].larvas++;
      }
    });

    // Datos demo NOTI/NETLAB con tendencia realista
    const keys = Object.keys(semanas);
    keys.forEach((k, i) => {
      semanas[k].noti = Math.round(6 + i * 0.8 + Math.random() * 4);
      semanas[k].netlab = Math.round(1 + i * 0.3 + Math.random() * 2);
    });

    return Object.values(semanas);
  }, [reportes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-custom">
          <p className="tooltip-label">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grafico-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={datos} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gCriaderos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0affb2" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0affb2" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gLarvas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gNoti" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffd43b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffd43b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gNetlab" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#cc5de8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#cc5de8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey="semana" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Area type="monotone" dataKey="criaderos" name="Criaderos APP" stroke="#0affb2" fill="url(#gCriaderos)" strokeWidth={2} />
          <Area type="monotone" dataKey="larvas" name="Con Larvas" stroke="#ff6b6b" fill="url(#gLarvas)" strokeWidth={2} />
          <Area type="monotone" dataKey="noti" name="NOTI (demo)" stroke="#ffd43b" fill="url(#gNoti)" strokeWidth={2} />
          <Area type="monotone" dataKey="netlab" name="NETLAB (demo)" stroke="#cc5de8" fill="url(#gNetlab)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}