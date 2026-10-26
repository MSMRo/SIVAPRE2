// hooks/useReportes.ts
import { useState, useCallback, useEffect } from 'react';
import { crearReporte, getMisReportes, getReporteById, subirFoto } from '../services/api';
import {
    guardarReporteOffline,
    obtenerReportesOffline,
    sincronizarReportesConServidor,
    ReporteOffline,
} from '../services/offlineSync';

export function useReportes() {
    const [loading, setLoading] = useState(false);
    const [reportes, setReportes] = useState<any[]>([]);
    const [reportesOffline, setReportesOffline] = useState<ReporteOffline[]>([]);
    const [sincronizando, setSincronizando] = useState(false);

    const refrescarOffline = useCallback(async () => {
        const offline = await obtenerReportesOffline();
        setReportesOffline(offline);
    }, []);

    useEffect(() => {
        refrescarOffline();
    }, [refrescarOffline]);

    const enviarReporte = async (datos: {
        latitud: number;
        longitud: number;
        foto_url?: string;
        foto_local_uri?: string;
        tipo_lugar: string;
        tipo_objeto: string;
        observa_larvas: string;
        conocimiento_dengue_cercano: string;
        comentarios?: string;
    }): Promise<{ exitoso: boolean; offline: boolean; mensaje: string }> => {
        setLoading(true);
        try {
            // Intentar enviar online directamente
            await crearReporte({
                latitud: datos.latitud,
                longitud: datos.longitud,
                foto_url: datos.foto_url,
                tipo_lugar: datos.tipo_lugar,
                tipo_objeto: datos.tipo_objeto,
                observa_larvas: datos.observa_larvas,
                conocimiento_dengue_cercano: datos.conocimiento_dengue_cercano,
                comentarios: datos.comentarios,
            });
            await refrescarOffline();
            return {
                exitoso: true,
                offline: false,
                mensaje: '¡Reporte enviado exitosamente al sistema!',
            };
        } catch (error) {
            // Si no hay conexión o falla el servidor, guardar en modo Offline
            await guardarReporteOffline({
                latitud: datos.latitud,
                longitud: datos.longitud,
                foto_local_uri: datos.foto_local_uri,
                foto_url: datos.foto_url,
                tipo_lugar: datos.tipo_lugar,
                tipo_objeto: datos.tipo_objeto,
                observa_larvas: datos.observa_larvas,
                conocimiento_dengue_cercano: datos.conocimiento_dengue_cercano,
                comentarios: datos.comentarios,
            });
            await refrescarOffline();
            return {
                exitoso: true,
                offline: true,
                mensaje: 'Guardado en el dispositivo (sin conexión). Se sincronizará automáticamente cuando recuperes internet.',
            };
        } finally {
            setLoading(false);
        }
    };

    const cargarMisReportes = async () => {
        setLoading(true);
        try {
            const data = await getMisReportes();
            setReportes(data);
        } catch (error) {
            console.warn('No se pudieron obtener reportes online, cargando locales...');
        } finally {
            await refrescarOffline();
            setLoading(false);
        }
    };

    const sincronizarPendientes = async (): Promise<{ exitosos: number; fallidos: number }> => {
        setSincronizando(true);
        try {
            const resultado = await sincronizarReportesConServidor(subirFoto, crearReporte);
            await refrescarOffline();
            if (resultado.exitosos > 0) {
                await cargarMisReportes();
            }
            return resultado;
        } finally {
            setSincronizando(false);
        }
    };

    const cargarReporteById = async (id: string) => {
        setLoading(true);
        try {
            return await getReporteById(id);
        } catch (error) {
            throw new Error('Error al cargar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return {
        enviarReporte,
        cargarMisReportes,
        cargarReporteById,
        sincronizarPendientes,
        refrescarOffline,
        reportesOffline,
        sincronizando,
        loading,
        reportes,
    };
}
