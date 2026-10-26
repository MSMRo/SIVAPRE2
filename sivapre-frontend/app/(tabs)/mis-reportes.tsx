// mis-reportes.tsx
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useReportes } from '../../hooks/useReportes';

const filtros = ['Todos', 'Enviado', 'En Revisión', 'Verificado', 'Resuelto'];

const estadoColor: Record<string, string> = {
    Enviado: Colors.info,
    'En Revisión': Colors.warning,
    Verificado: Colors.accent,
    Resuelto: Colors.success,
};

const estadoIcono: Record<string, string> = {
    Enviado: 'time-outline',
    'En Revisión': 'search-outline',
    Verificado: 'checkmark-circle-outline',
    Resuelto: 'checkmark-done-circle-outline',
};

export default function MisReportes() {
    const router = useRouter();
    const {
        cargarMisReportes,
        reportes,
        reportesOffline,
        sincronizarPendientes,
        sincronizando,
        loading,
    } = useReportes();
    const [filtroActivo, setFiltroActivo] = useState('Todos');

    useEffect(() => {
        cargarMisReportes();
    }, []);

    const reportesFiltrados = filtroActivo === 'Todos'
        ? reportes
        : reportes.filter((r: any) => r.estado === filtroActivo);

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>

            {/* Header stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>{reportes.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.success }]}>
                        {reportes.filter((r: any) => r.estado === 'Resuelto').length}
                    </Text>
                    <Text style={styles.statLabel}>Resueltos</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.warning }]}>
                        {reportes.filter((r: any) => r.estado === 'En Revisión').length}
                    </Text>
                    <Text style={styles.statLabel}>En Revisión</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: Colors.secondary }]}>
                        {reportes.filter((r: any) => r.estado === 'Enviado').length}
                    </Text>
                    <Text style={styles.statLabel}>Enviados</Text>
                </View>
            </View>

            {/* Banner de sincronización offline */}
            {reportesOffline.length > 0 && (
                <View style={styles.offlineBanner}>
                    <View style={styles.offlineBannerLeft}>
                        <Ionicons name="cloud-offline-outline" size={20} color="#E8590C" />
                        <Text style={styles.offlineBannerText}>
                            {reportesOffline.length} {reportesOffline.length === 1 ? 'reporte guardado offline' : 'reportes pendientes offline'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.syncButton, sincronizando && { opacity: 0.6 }]}
                        onPress={async () => {
                            const res = await sincronizarPendientes();
                            alert(`Sincronización: ${res.exitosos} reportes subidos.`);
                        }}
                        disabled={sincronizando}
                    >
                        <Ionicons name="refresh-outline" size={14} color={Colors.white} />
                        <Text style={styles.syncButtonText}>
                            {sincronizando ? 'Subiendo...' : 'Sincronizar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Filtros */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtroScroll}
                contentContainerStyle={styles.filtroContainer}
            >
                {filtros.map((filtro) => (
                    <TouchableOpacity
                        key={filtro}
                        style={[styles.filtroChip, filtroActivo === filtro && styles.filtroChipActive]}
                        onPress={() => setFiltroActivo(filtro)}
                    >
                        <Text style={[styles.filtroText, filtroActivo === filtro && styles.filtroTextActive]}>
                            {filtro}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista */}
            <FlatList
                data={reportesFiltrados}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={cargarMisReportes}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="document-outline" size={48} color={Colors.textLight} />
                        <Text style={styles.emptyText}>
                            {loading ? 'Cargando reportes...' : 'No hay reportes en esta categoría'}
                        </Text>
                    </View>
                }
                renderItem={({ item }: any) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push(`/reporte-detalle/${item.id}`)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardLeft}>
                            <View style={[styles.iconBox, { backgroundColor: (estadoColor[item.estado] || Colors.info) + '20' }]}>
                                <Ionicons
                                    name={(estadoIcono[item.estado] || 'time-outline') as any}
                                    size={22}
                                    color={estadoColor[item.estado] || Colors.info}
                                />
                            </View>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.cardTopRow}>
                                <Text style={styles.cardTitulo}>{item.tipo_lugar} · {item.tipo_objeto}</Text>
                                <View style={[styles.estadoBadge, { backgroundColor: estadoColor[item.estado] || Colors.info }]}>
                                    <Text style={styles.estadoText}>{item.estado}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardCoordenadas}>
                                <Ionicons name="location-outline" size={12} color={Colors.textLight} /> {item.latitud?.toFixed(4)}, {item.longitud?.toFixed(4)}
                            </Text>
                            <Text style={styles.cardFecha}>{formatFecha(item.fecha_reporte)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        paddingVertical: 10,
    },
    statNum: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 22,
        color: Colors.white,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    filtroScroll: {
        maxHeight: 56,
        marginVertical: 12,
    },
    filtroContainer: {
        paddingHorizontal: 20,
        gap: 8,
        alignItems: 'center',
    },
    filtroChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: Colors.surface,
    },
    filtroChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filtroText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
    },
    filtroTextActive: {
        fontFamily: 'Montserrat-ExtraBold',
        color: Colors.white,
    },
    lista: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardLeft: {
        marginRight: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardTitulo: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    estadoBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    estadoText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 10,
        color: Colors.white,
    },
    cardCoordenadas: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.textLight,
    },
    cardFecha: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: Colors.textLight,
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.textLight,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF4E6',
        borderColor: '#FFD8A8',
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    offlineBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    offlineBannerText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: '#D9480F',
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E8590C',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    syncButtonText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 11,
        color: Colors.white,
    },
});