// reporte-detalle/[id].tsx
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useReportes } from '../../hooks/useReportes';

const BASE_URL = 'http://161.132.53.226:8000';

const estadoColor: Record<string, string> = {
    Enviado: Colors.info,
    'En Revisión': Colors.warning,
    Verificado: Colors.accent,
    Resuelto: Colors.success,
};

export default function ReporteDetalle() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { cargarReporteById } = useReportes();
    const [reporte, setReporte] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await cargarReporteById(id as string);
                setReporte(data);
            } catch (error) {
                console.log('Error al cargar reporte:', error);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!reporte) {
        return (
            <View style={styles.centered}>
                <Text style={styles.notFoundText}>Reporte no encontrado</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backText}>Mis Reportes</Text>
            </TouchableOpacity>

            <View style={styles.estadoRow}>
                <Text style={styles.pageTitle}>Reporte</Text>
                <View style={[styles.estadoBadge, { backgroundColor: estadoColor[reporte.estado] || Colors.info }]}>
                    <Text style={styles.estadoText}>{reporte.estado}</Text>
                </View>
            </View>
            <Text style={styles.fecha}>{formatFecha(reporte.fecha_reporte)}</Text>

            {/* Foto */}
            {reporte.foto_url ? (
                <Image
                    source={{ uri: `${BASE_URL}${reporte.foto_url}` }}
                    style={styles.fotoReal}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.fotoBox}>
                    <Ionicons name="image-outline" size={48} color={Colors.textLight} />
                    <Text style={styles.fotoText}>Sin foto adjunta</Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>Detalles del hallazgo</Text>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={18} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Coordenadas</Text>
                        <Text style={styles.rowValue}>{reporte.latitud?.toFixed(6)}, {reporte.longitud?.toFixed(6)}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Ionicons name="home-outline" size={18} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Tipo de lugar</Text>
                        <Text style={styles.rowValue}>{reporte.tipo_lugar}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Ionicons name="cube-outline" size={18} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>Tipo de objeto</Text>
                        <Text style={styles.rowValue}>{reporte.tipo_objeto}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>¿Observaste larvas?</Text>
                        <Text style={styles.rowValue}>{reporte.observa_larvas}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Ionicons name="alert-circle-outline" size={18} color={Colors.primary} />
                    <View style={styles.rowContent}>
                        <Text style={styles.rowLabel}>¿Dengue cercano?</Text>
                        <Text style={styles.rowValue}>{reporte.conocimiento_dengue_cercano}</Text>
                    </View>
                </View>
                {reporte.comentarios ? (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Ionicons name="chatbox-outline" size={18} color={Colors.primary} />
                            <View style={styles.rowContent}>
                                <Text style={styles.rowLabel}>Comentarios</Text>
                                <Text style={styles.rowValue}>{reporte.comentarios}</Text>
                            </View>
                        </View>
                    </>
                ) : null}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: Colors.textLight,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    backText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.primary,
    },
    estadoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    pageTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 24,
        color: Colors.text,
    },
    estadoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    estadoText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: Colors.white,
    },
    fecha: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 20,
    },
    fotoReal: {
        width: '100%',
        height: 200,
        borderRadius: 14,
        marginBottom: 24,
    },
    fotoBox: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    fotoText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
    },
    sectionTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 12,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 10,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 2,
    },
    rowValue: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});