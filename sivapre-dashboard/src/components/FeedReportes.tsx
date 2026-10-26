// FeedReportes.tsx
import React, { useState } from 'react';
import { Reporte } from '../App';

interface Props {
  reportes: Reporte[];
  onEstado: (id: string, estado: string) => void;
  baseUrl: string;
}

const estadoColor: Record<string, string> = {
  'Enviado':     '#74C0FC',
  'En Revisión': '#FFB347',
  'Verificado':  '#69DB7C',
  'Resuelto':    '#00C49F',
};

const estados = ['Enviado', 'En Revisión', 'Verificado', 'Resuelto'];

export default function FeedReportes({ reportes, onEstado, baseUrl }: Props) {
  const [expandido, setExpandido] = useState<string | null>(null);

  const formatFecha = (f: string) =>
    new Date(f).toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="feed-lista">
      {reportes.length === 0 && (
        <div className="feed-empty">No hay reportes para mostrar</div>
      )}

      {reportes.map(r => (
        <div key={r.id} className={`feed-card ${expandido === r.id ? 'expandido' : ''}`}>

          {/* ── Cabecera del reporte ── */}
          <div
            className="feed-card-header"
            onClick={() => setExpandido(expandido === r.id ? null : r.id)}
          >
            <div className="feed-foto">
              {r.foto_url
                ? <img src={`${baseUrl}${r.foto_url}`} alt="reporte" />
                : <div className="feed-foto-placeholder">📷</div>
              }
            </div>
            <div className="feed-info">
              <div className="feed-tipo">{r.tipo_lugar} · {r.tipo_objeto}</div>
              <div className="feed-fecha">{formatFecha(r.fecha_reporte)}</div>
              <div className="feed-coords">
                📍 {r.latitud.toFixed(4)}, {r.longitud.toFixed(4)}
              </div>
            </div>
            <div
              className="feed-estado-badge"
              style={{ background: estadoColor[r.estado] || '#74C0FC' }}
            >
              {r.estado}
            </div>
          </div>

          {/* ── Detalle expandido ── */}
          {expandido === r.id && (
            <div className="feed-detalle">
              <div className="feed-detalle-row">
                <span>🦟 Larvas:</span>
                <strong>{r.observa_larvas}</strong>
              </div>
              <div className="feed-detalle-row">
                <span>⚠️ Dengue cercano:</span>
                <strong>{r.conocimiento_dengue_cercano}</strong>
              </div>
              {r.comentarios && (
                <div className="feed-detalle-row">
                  <span>💬 Comentarios:</span>
                  <strong>{r.comentarios}</strong>
                </div>
              )}

              {/* ── Cambiar estado ── */}
              <div className="feed-acciones">
                <span>Cambiar estado:</span>
                <div className="feed-estados">
                  {estados.map(e => (
                    <button
                      key={e}
                      className={`estado-btn ${r.estado === e ? 'activo' : ''}`}
                      style={{ '--color': estadoColor[e] } as any}
                      onClick={() => onEstado(r.id, e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Asignar a brigada (placeholder) ── */}
              <div className="feed-acciones">
                <span>Asignar a brigada:</span>
                <button
                  className="brigada-btn"
                  /*
                  onClick={() => alert('.')}
                  title="Próximamente disponible" */
                >
                  Asignar Brigada
                </button>
              </div>

            </div>
          )}
        </div>
      ))}
    </div>
  );
}