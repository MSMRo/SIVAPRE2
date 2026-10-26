import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const categorias = [
    { id: 'prevencion', label: 'Prevención', icon: 'shield-checkmark-outline' },
    { id: 'zancudo', label: 'El Zancudo', icon: 'bug-outline' },
    { id: 'sintomas', label: 'Síntomas', icon: 'medkit-outline' },
    { id: 'mitos', label: 'Mitos y Verdades', icon: 'help-circle-outline' },
    { id: 'contactos', label: 'Emergencias', icon: 'call-outline' },
];

const contenido: Record<string, any> = {
    prevencion: [
        { titulo: 'Elimina el agua estancada', desc: 'Vacía, tapa o voltea recipientes que acumulen agua al menos una vez por semana.' },
        { titulo: 'Usa mosquiteros', desc: 'Coloca mosquiteros en puertas y ventanas para evitar la entrada del zancudo.' },
        { titulo: 'Ropa protectora', desc: 'Usa ropa de manga larga y pantalones largos en zonas de riesgo.' },
        { titulo: 'Repelente', desc: 'Aplica repelente con DEET, IR3535 o Icaridina en zonas expuestas de la piel.' },
    ],
    zancudo: [
        { titulo: '¿Cómo identificarlo?', desc: 'El Aedes aegypti es negro con rayas blancas en el cuerpo y las patas. Es pequeño y silencioso.' },
        { titulo: '¿Cuándo pica?', desc: 'Pica principalmente durante el día, con mayor actividad al amanecer y al atardecer.' },
        { titulo: '¿Dónde se reproduce?', desc: 'Se reproduce en agua limpia y estancada: floreros, baldes, llantas, canaletas y recipientes descubiertos.' },
        { titulo: 'Ciclo de vida', desc: 'El ciclo completo (huevo → larva → pupa → adulto) dura entre 7 y 10 días en condiciones cálidas.' },
    ],
    sintomas: [
        { titulo: 'Fiebre alta', desc: 'Aparición súbita de fiebre mayor a 38°C, generalmente los primeros 2-7 días.' },
        { titulo: 'Dolor de cabeza y ojos', desc: 'Dolor intenso detrás de los ojos y cefalea severa.' },
        { titulo: 'Dolor muscular', desc: 'Dolores musculares y articulares intensos, conocido como "fiebre quebrantahuesos".' },
        { titulo: 'Señales de alarma', desc: 'Dolor abdominal intenso, vómitos, sangrado de encías o nariz. Acude de inmediato al médico.' },
    ],
    contactos: [
        { titulo: 'MINSA - Línea 113', desc: 'Atención gratuita las 24 horas para consultas de salud y emergencias.' },
        { titulo: 'SAMU - 106', desc: 'Servicio de Atención Médica de Urgencias para emergencias médicas.' },
        { titulo: 'Bomberos - 116', desc: 'Cuerpo General de Bomberos del Perú.' },
        { titulo: 'CDC Perú', desc: 'Centro Nacional de Epidemiología, Prevención y Control de Enfermedades.' },
    ],
};

const mitos = [
    { mito: 'El dengue solo se contagia de noche', verdad: 'FALSO. El Aedes aegypti pica principalmente durante el día, al amanecer y al atardecer.' },
    { mito: 'Si no hay fiebre, no es dengue', verdad: 'FALSO. Algunos casos de dengue pueden presentarse sin fiebre alta, especialmente en niños.' },
    { mito: 'El dengue se contagia de persona a persona', verdad: 'FALSO. El dengue solo se transmite por la picadura del zancudo infectado, no por contacto directo.' },
    { mito: 'El dengue solo afecta zonas tropicales', verdad: 'FALSO. Puede afectar cualquier zona donde haya presencia del zancudo Aedes aegypti.' },
];

export default function Informacion() {
    const [categoriaActiva, setCategoriaActiva] = useState('prevencion');
    const [mitosAbiertos, setMitosAbiertos] = useState<number[]>([]);

    const toggleMito = (index: number) => {
        setMitosAbiertos((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            <Text style={styles.pageTitle}>Centro de Información</Text>
            <Text style={styles.pageSubtitle}>Aprende a proteger tu comunidad</Text>

            {/* Menú de categorías */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.menuScroll}
                contentContainerStyle={styles.menuContainer}
            >
                {categorias.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.menuItem, categoriaActiva === cat.id && styles.menuItemActive]}
                        onPress={() => setCategoriaActiva(cat.id)}
                    >
                        <Ionicons
                            name={cat.icon as any}
                            size={20}
                            color={categoriaActiva === cat.id ? Colors.white : Colors.primary}
                        />
                        <Text style={[styles.menuLabel, categoriaActiva === cat.id && styles.menuLabelActive]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Contenido por categoría */}
            {categoriaActiva !== 'mitos' && contenido[categoriaActiva]?.map((item: any, index: number) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons
                            name={categorias.find(c => c.id === categoriaActiva)?.icon as any}
                            size={18}
                            color={Colors.primary}
                        />
                        <Text style={styles.cardTitle}>{item.titulo}</Text>
                    </View>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
            ))}

            {/* Mitos y Verdades */}
            {categoriaActiva === 'mitos' && mitos.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.mitoCard}
                    onPress={() => toggleMito(index)}
                    activeOpacity={0.8}
                >
                    <View style={styles.mitoHeader}>
                        <View style={styles.mitoBadge}>
                            <Text style={styles.mitoBadgeText}>MITO</Text>
                        </View>
                        <Text style={styles.mitoText}>{item.mito}</Text>
                        <Ionicons
                            name={mitosAbiertos.includes(index) ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={Colors.textLight}
                        />
                    </View>
                    {mitosAbiertos.includes(index) && (
                        <View style={styles.verdadBox}>
                            <Text style={styles.verdadLabel}>✓ VERDAD</Text>
                            <Text style={styles.verdadText}>{item.verdad}</Text>
                        </View>
                    )}
                </TouchableOpacity>
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
    pageTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 24,
        color: Colors.text,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 20,
    },
    menuScroll: {
        marginBottom: 24,
    },
    menuContainer: {
        gap: 10,
        paddingRight: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
    },
    menuItemActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    menuLabel: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: Colors.primary,
    },
    menuLabelActive: {
        color: Colors.white,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    cardTitle: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
    cardDesc: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
        lineHeight: 20,
    },
    mitoCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    mitoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mitoBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    mitoBadgeText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 10,
        color: Colors.white,
    },
    mitoText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    verdadBox: {
        marginTop: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
        padding: 12,
    },
    verdadLabel: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: Colors.success,
        marginBottom: 4,
    },
    verdadText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.text,
        lineHeight: 20,
    },
});