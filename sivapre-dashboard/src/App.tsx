// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { loginAdmin, getTodosLosReportes, actualizarEstado, API_BASE_URL } from './services/api';
import KPICards from './components/KPICards';
import MapaReportes from './components/MapaReportes';
import FeedReportes from './components/FeedReportes';
import Filtros, { CapasVisibles } from './components/Filtros';
import GraficoTendencia from './components/GraficoTendencia';
import LoginPanel from './components/LoginPanel';
import './App.css';

export interface Reporte {
  id: string;
  usuario_id: string;
  latitud: number;
  longitud: number;
  foto_url?: string;
  tipo_lugar: string;
  tipo_objeto: string;
  observa_larvas: string;
  conocimiento_dengue_cercano: string;
  comentarios?: string;
  estado: string;
  fecha_reporte: string;
}

function App() {
  const [token, setToken]       = useState<string>(localStorage.getItem('dashboard_token') || '');
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtrados, setFiltrados] = useState<Reporte[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // Nuevo: estado de capas visibles, con todas activas por defecto
  const [capasVisibles, setCapasVisibles] = useState<CapasVisibles>({
    sivapre: true,
    noti:    true,
    netlab:  true,
  });

  const cargarReportes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTodosLosReportes(token);
      setReportes(data);
      setFiltrados(data);
      setUltimaActualizacion(new Date());
      setError('');
    } catch (e) {
      setError('Error al cargar reportes. Verifica tu sesión.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargarReportes();
    const interval = setInterval(cargarReportes, 30000);
    return () => clearInterval(interval);
  }, [cargarReportes]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const data = await loginAdmin(username, password);
      setToken(data.access_token);
      localStorage.setItem('dashboard_token', data.access_token);
    } catch (e) {
      throw new Error('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('dashboard_token');
    setReportes([]);
    setFiltrados([]);
  };

  const handleEstado = async (id: string, estado: string) => {
    try {
      await actualizarEstado(token, id, estado);
      await cargarReportes();
    } catch (e) {
      alert('Error al actualizar estado');
    }
  };

  if (!token) {
    return <LoginPanel onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-mark">
            <span className="logo-s">S</span>
          </div>
          <div className="header-titles">
            <h1>SIVAPRE</h1>
            <span>Dashboard de Vigilancia Epidemiológica</span>
          </div>
        </div>
        <div className="header-right">
          {ultimaActualizacion && (
            <span className="ultima-actualizacion">
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-PE')}
            </span>
          )}
          <div className={`status-indicator ${loading ? 'loading' : 'live'}`}>
            <span className="status-dot"></span>
            {loading ? 'Actualizando...' : 'EN VIVO'}
          </div>
          <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="dashboard-main">
        <KPICards reportes={filtrados} />

        {/* Filtros ahora también controla las capas del mapa */}
        <Filtros
          reportes={reportes}
          onChange={setFiltrados}
          onCapasChange={setCapasVisibles}
        />

        <div className="dashboard-grid">
          <div className="mapa-container">
            <h2 className="section-title">Mapa de Criaderos</h2>
            {/* MapaReportes recibe qué capas mostrar */}
            <MapaReportes
              reportes={filtrados}
              capasVisibles={capasVisibles}
            />
          </div>
          <div className="feed-container">
            <h2 className="section-title">Feed en Tiempo Real</h2>
            <FeedReportes
              reportes={filtrados}
              onEstado={handleEstado}
              baseUrl={API_BASE_URL}
            />
            <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Tendencia Semanal de Casos</h2>
            <GraficoTendencia reportes={filtrados} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;