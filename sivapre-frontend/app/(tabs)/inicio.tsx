import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useUsuario } from '../../hooks/useUsuario';

const alertas = [
    { id: '1', zona: 'San Juan de Lurigancho', nivel: 'Alto', descripcion: 'Alta densidad de criaderos reportados esta semana.' },
    { id: '2', zona: 'Ate Vitarte', nivel: 'Medio', descripcion: 'Incremento de casos sospechosos en el distrito.' },
    { id: '3', zona: 'Villa El Salvador', nivel: 'Bajo', descripcion: 'Situación estable, continúa la vigilancia.' },
];

const nivelColor: Record<string, string> = {
    Alto: '#D32F2F',
    Medio: Colors.warning,
    Bajo: Colors.success,
};

export default function Inicio() {
    const router = useRouter();
    const { usuario } = useUsuario();

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            {/* Saludo */}
            <View style={styles.saludoRow}>
                <View>
                    <Text style={styles.saludo}>¡Hola, {usuario?.nombre_completo?.split(' ')[0] || 'Ciudadano'}! 👋</Text>
                    <Text style={styles.saludoSub}>Gracias por cuidar tu comunidad</Text>
                </View>
                <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={24} color={Colors.primary} />
                </View>
            </View>

            {/* Botón rápido reportar */}
            <TouchableOpacity
                style={styles.reportButton}
                onPress={() => router.push('/(tabs)/reporte')}
            >
                <Ionicons name="add-circle-outline" size={24} color={Colors.white} />
                <Text style={styles.reportButtonText}>Reportar un criadero ahora</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </TouchableOpacity>

            {/* KPIs */}
            <Text style={styles.sectionTitle}>Tu impacto</Text>
            <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiNumber}>12</Text>
                    <Text style={styles.kpiLabel}>Reportes enviados</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiNumber}>8</Text>
                    <Text style={styles.kpiLabel}>Verificados</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiNumber}>3</Text>
                    <Text style={styles.kpiLabel}>Resueltos</Text>
                </View>
            </View>

            {/* Estadísticas generales */}
            <Text style={styles.sectionTitle}>Estadísticas de tu zona</Text>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
                    <Text style={styles.statNumber}>245</Text>
                    <Text style={styles.statLabel}>Reportes totales</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: Colors.secondary }]}>
                    <Text style={styles.statNumber}>38</Text>
                    <Text style={styles.statLabel}>Con larvas 🐛</Text>
                </View>
            </View>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderLeftColor: Colors.warning }]}>
                    <Text style={styles.statNumber}>91</Text>
                    <Text style={styles.statLabel}>Casos sospechosos</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: Colors.info }]}>
                    <Text style={styles.statNumber}>14</Text>
                    <Text style={styles.statLabel}>Confirmados</Text>
                </View>
            </View>

            {/* Alertas */}
            <Text style={styles.sectionTitle}>Alertas en tu zona</Text>
            {alertas.map((alerta) => (
                <View key={alerta.id} style={styles.alertCard}>
                    <View style={[styles.alertBadge, { backgroundColor: nivelColor[alerta.nivel] }]}>
                        <Text style={styles.alertBadgeText}>{alerta.nivel}</Text>
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertZona}>{alerta.zona}</Text>
                        <Text style={styles.alertDesc}>{alerta.descripcion}</Text>
                    </View>
                </View>
            ))}

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
    saludoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    saludo: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 22,
        color: Colors.text,
    },
    saludoSub: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
        marginTop: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    reportButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 14,
        marginBottom: 28,
    },
    reportButtonText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        color: Colors.white,
        flex: 1,
        marginLeft: 10,
    },
    sectionTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 12,
    },
    kpiRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    kpiNumber: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 26,
        color: Colors.primary,
    },
    kpiLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    statNumber: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 22,
        color: Colors.text,
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    alertCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    alertBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 12,
    },
    alertBadgeText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 11,
        color: Colors.white,
    },
    alertContent: {
        flex: 1,
    },
    alertZona: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 13,
        color: Colors.text,
    },
    alertDesc: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
});