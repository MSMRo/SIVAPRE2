// services/offlineSync.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReporteOffline {
    id_local: string;
    latitud: number;
    longitud: number;
    foto_local_uri?: string;
    foto_url?: string;
    tipo_lugar: string;
    tipo_objeto: string;
    observa_larvas: string;
    conocimiento_dengue_cercano: string;
    comentarios?: string;
    fecha_creacion: string;
    reintentos: number;
    ultimo_error?: string;
}

const STORAGE_KEY_COLA_OFFLINE = '@sivapre_cola_reportes_offline';

/**
 * Guarda un reporte en la cola local del dispositivo cuando no hay conexión.
 */
export async function guardarReporteOffline(datos: Omit<ReporteOffline, 'id_local' | 'fecha_creacion' | 'reintentos'>): Promise<ReporteOffline> {
    const cola = await obtenerReportesOffline();
    const nuevoReporte: ReporteOffline = {
        ...datos,
        id_local: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fecha_creacion: new Date().toISOString(),
        reintentos: 0,
    };

    cola.unshift(nuevoReporte);
    await AsyncStorage.setItem(STORAGE_KEY_COLA_OFFLINE, JSON.stringify(cola));
    return nuevoReporte;
}

/**
 * Obtiene todos los reportes almacenados en la cola local pendientes de sincronización.
 */
export async function obtenerReportesOffline(): Promise<ReporteOffline[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY_COLA_OFFLINE);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Elimina un reporte específico de la cola local tras ser sincronizado exitosamente.
 */
export async function eliminarReporteOffline(id_local: string): Promise<void> {
    const cola = await obtenerReportesOffline();
    const nuevaCola = cola.filter((item) => item.id_local !== id_local);
    await AsyncStorage.setItem(STORAGE_KEY_COLA_OFFLINE, JSON.stringify(nuevaCola));
}

/**
 * Procesa y sincroniza todos los reportes pendientes con el servidor/Supabase.
 */
export async function sincronizarReportesConServidor(
    subirFotoFn: (uri: string) => Promise<{ foto_url: string }>,
    crearReporteFn: (reporte: any) => Promise<any>
): Promise<{ exitosos: number; fallidos: number }> {
    const pendientes = await obtenerReportesOffline();
    if (pendientes.length === 0) {
        return { exitosos: 0, fallidos: 0 };
    }

    let exitosos = 0;
    let fallidos = 0;

    for (const reporte of pendientes) {
        try {
            let foto_url = reporte.foto_url;

            // Si hay foto capturada localmente y aún no ha sido subida
            if (reporte.foto_local_uri && !foto_url) {
                try {
                    const uploadRes = await subirFotoFn(reporte.foto_local_uri);
                    foto_url = uploadRes.foto_url;
                } catch (e) {
                    // Si falla subir la foto, permitimos intentar enviar el reporte o reintentar luego
                    console.warn(`No se pudo subir foto de reporte ${reporte.id_local}, continuando...`);
                }
            }

            // Enviar el reporte al backend / Supabase
            await crearReporteFn({
                latitud: reporte.latitud,
                longitud: reporte.longitud,
                foto_url: foto_url,
                tipo_lugar: reporte.tipo_lugar,
                tipo_objeto: reporte.tipo_objeto,
                observa_larvas: reporte.observa_larvas,
                conocimiento_dengue_cercano: reporte.conocimiento_dengue_cercano,
                comentarios: reporte.comentarios,
            });

            // Eliminar de la cola local al completarse
            await eliminarReporteOffline(reporte.id_local);
            exitosos++;
        } catch (error: any) {
            fallidos++;
            reporte.reintentos += 1;
            reporte.ultimo_error = error?.message || 'Error de red desconocido';
        }
    }

    return { exitosos, fallidos };
}
