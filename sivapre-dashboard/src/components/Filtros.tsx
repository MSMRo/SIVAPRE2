// Filtros.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Reporte } from '../App';

export interface CapasVisibles {
  sivapre: boolean;
  noti: boolean;
  netlab: boolean;
}

type RangoFecha = '24h' | '7d' | '1m' | 'custom';

interface Props {
  reportes: Reporte[];
  onChange: (filtrados: Reporte[]) => void;
  onCapasChange: (capas: CapasVisibles) => void;
}

export default function Filtros({ reportes, onChange, onCapasChange }: Props) {
  const [rango, setRango]                 = useState<RangoFecha>('1m');
  const [fechaInicio, setFechaInicio]     = useState('');
  const [fechaFin, setFechaFin]           = useState('');
  const [mostrarCustom, setMostrarCustom] = useState(false);
  const [departamento, setDepartamento]   = useState('');
  const [provincia, setProvincia]         = useState('');
  const [distrito, setDistrito]           = useState('');
  const [capas, setCapas] = useState<CapasVisibles>({
    sivapre: true,
    noti:    true,
    netlab:  true,
  });

  useEffect(() => { onCapasChange(capas); }, [capas, onCapasChange]);

  const toggleCapa = (capa: keyof CapasVisibles) =>
    setCapas(prev => ({ ...prev, [capa]: !prev[capa] }));

  const departamentos = useMemo(() =>
    [...new Set(reportes.map(r => (r as any).departamento).filter(Boolean))].sort()
  , [reportes]);

  const provincias = useMemo(() =>
    [...new Set(reportes
      .filter(r => !departamento || (r as any).departamento === departamento)
      .map(r => (r as any).provincia).filter(Boolean))].sort()
  , [reportes, departamento]);

  const distritos = useMemo(() =>
    [...new Set(reportes
      .filter(r =>
        (!departamento || (r as any).departamento === departamento) &&
        (!provincia    || (r as any).provincia    === provincia))
      .map(r => (r as any).distrito).filter(Boolean))].sort()
  , [reportes, departamento, provincia]);

  const getFechaDesde = (): Date | null => {
    const ahora = new Date();
    switch (rango) {
      case '24h':   { const d = new Date(ahora); d.setHours(ahora.getHours() - 24);  return d; }
      case '7d':    { const d = new Date(ahora); d.setDate(ahora.getDate() - 7);      return d; }
      case '1m':    { const d = new Date(ahora); d.setMonth(ahora.getMonth() - 1);    return d; }
      case 'custom': return fechaInicio ? new Date(fechaInicio) : null;
      default: return null;
    }
  };

  const getFechaHasta = (): Date | null => {
    if (rango === 'custom' && fechaFin) return new Date(fechaFin + 'T23:59:59');
    return null;
  };

  useEffect(() => {
    let resultado = [...reportes];
    const desde = getFechaDesde();
    const hasta = getFechaHasta();
    if (desde)        resultado = resultado.filter(r => new Date(r.fecha_reporte) >= desde);
    if (hasta)        resultado = resultado.filter(r => new Date(r.fecha_reporte) <= hasta);
    if (departamento) resultado = resultado.filter(r => (r as any).departamento === departamento);
    if (provincia)    resultado = resultado.filter(r => (r as any).provincia    === provincia);
    if (distrito)     resultado = resultado.filter(r => (r as any).distrito     === distrito);
    onChange(resultado);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango, fechaInicio, fechaFin, departamento, provincia, distrito, reportes]);

  const handleRango = (r: RangoFecha) => {
    setRango(r);
    setMostrarCustom(r === 'custom');
    if (r !== 'custom') { setFechaInicio(''); setFechaFin(''); }
  };

  return (
    <div className="filtros-bar">

      {/* ── Rango de fechas ── */}
      <div className="filtros-seccion">
        <div className="filtros-seccion-label"><span>📅</span> Rango de Fechas</div>
        <div className="filtros-fecha-btns">
          {(['24h', '7d', '1m', 'custom'] as RangoFecha[]).map(r => (
            <button
              key={r}
              className={`fecha-btn ${rango === r ? 'activo' : ''}`}
              onClick={() => handleRango(r)}
            >
              {r === '24h' ? 'Últimas 24h' : r === '7d' ? 'Últimos 7 días' : r === '1m' ? 'Último mes' : 'Personalizar'}
            </button>
          ))}
        </div>
        {mostrarCustom && (
          <div className="filtros-custom-fechas">
            <div className="filtros-grupo">
              <label htmlFor="fecha-inicio">Desde</label>
              <input id="fecha-inicio" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <span className="filtros-custom-sep">→</span>
            <div className="filtros-grupo">
              <label htmlFor="fecha-fin">Hasta</label>
              <input id="fecha-fin" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="filtros-separador">|</div>

      {/* ── Ubicación ── */}
      <div className="filtros-seccion">
        <div className="filtros-seccion-label"><span>📍</span> Ubicación (UBIGEO)</div>
        <div className="filtros-ubicacion">
          <select value={departamento} onChange={e => { setDepartamento(e.target.value); setProvincia(''); setDistrito(''); }}>
            <option value="">Departamento</option>
            {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={provincia} onChange={e => { setProvincia(e.target.value); setDistrito(''); }} disabled={!departamento}>
            <option value="">Provincia</option>
            {provincias.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={distrito} onChange={e => setDistrito(e.target.value)} disabled={!provincia}>
            <option value="">Distrito</option>
            {distritos.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="filtros-separador">|</div>

      {/* ── Capas del mapa ── */}
      <div className="filtros-seccion">
        <div className="filtros-seccion-label">Capas del Mapa</div>
        <div className="filtros-capas-toggles">
          <button className={`capa-toggle sivapre ${capas.sivapre ? 'activo' : ''}`} onClick={() => toggleCapa('sivapre')}>
            <span className="capa-dot capa-sivapre" /> SIVAPRE Criaderos
          </button>
          <button className={`capa-toggle noti ${capas.noti ? 'activo' : ''}`} onClick={() => toggleCapa('noti')}>
            <span className="capa-dot capa-noti" /> NOTI Sospechosos/Probables
          </button>
          <button className={`capa-toggle netlab ${capas.netlab ? 'activo' : ''}`} onClick={() => toggleCapa('netlab')}>
            <span className="capa-dot capa-netlab" /> NETLAB Confirmados
          </button>
        </div>
      </div>

    </div>
  );
}
