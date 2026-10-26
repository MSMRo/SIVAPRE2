//reporte.tsx
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { useReportes } from '../../hooks/useReportes';
import { subirFoto } from '../../services/api';

const tiposLugar = ['Vivienda', 'Vía Pública', 'Terreno Abandonado', 'Mercado', 'Colegio', 'Otro'];
const tiposObjeto = ['Llantas', 'Baldes', 'Plantas', 'Botellas', 'Canales', 'Otro'];
const opcionesLarvas = ['Sí, claramente', 'No estoy seguro', 'No'];
const opcionesDengue = ['Sí', 'No lo sé', 'No'];

export default function Reporte() {
    const { enviarReporte: enviar, loading } = useReportes();
    const [tipoLugar, setTipoLugar] = useState('');
    const [tipoObjeto, setTipoObjeto] = useState('');
    const [larvas, setLarvas] = useState('');
    const [dengueCercano, setDengueCercano] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [fotoUri, setFotoUri] = useState<string | null>(null);
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false);
    const [latitud, setLatitud] = useState<number | null>(null);
    const [longitud, setLongitud] = useState<number | null>(null);
    const [subiendoFoto, setSubiendoFoto] = useState(false);

    const tomarFoto = async () => {
        // Pedir permiso de cámara
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar la foto.');
            return;
        }

        // Abrir cámara
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setFotoUri(uri);

            // Subir foto al servidor o mantener localmente si está offline
            try {
                setSubiendoFoto(true);
                const response = await subirFoto(uri);
                setFotoUrl(response.foto_url);
            } catch (error) {
                Alert.alert(
                    'Modo Offline',
                    'Foto guardada localmente en tu teléfono. Se sincronizará en cuanto tengas conexión a internet.'
                );
            } finally {
                setSubiendoFoto(false);
            }
        }
    };

    const obtenerUbicacion = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu ubicación para registrar el criadero.');
            return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setLatitud(location.coords.latitude);
        setLongitud(location.coords.longitude);
        setUbicacionObtenida(true);
    };

    const onEnviar = async () => {
        if (!latitud || !longitud) {
            Alert.alert('Error', 'Debes capturar tu ubicación primero.');
            return;
        }
        if (!tipoLugar || !tipoObjeto || !larvas || !dengueCercano) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
            return;
        }
        try {
            const resultado = await enviar({
                latitud,
                longitud,
                foto_url: fotoUrl ?? undefined,
                foto_local_uri: fotoUri ?? undefined,
                tipo_lugar: tipoLugar,
                tipo_objeto: tipoObjeto,
                observa_larvas: larvas,
                conocimiento_dengue_cercano: dengueCercano,
                comentarios,
            });
            Alert.alert(
                resultado.offline ? '💾 Guardado en el Dispositivo' : '¡Éxito!',
                resultado.mensaje
            );
            // Limpiar formulario
            setTipoLugar('');
            setTipoObjeto('');
            setLarvas('');
            setDengueCercano('');
            setComentarios('');
            setFotoUri(null);
            setFotoUrl(null);
            setUbicacionObtenida(false);
            setLatitud(null);
            setLongitud(null);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            <Text style={styles.pageTitle}>Nuevo Reporte</Text>
            <Text style={styles.pageSubtitle}>Completa el formulario en menos de 60 segundos</Text>

            {/* Foto */}
            <Text style={styles.sectionLabel}>1. Evidencia fotográfica</Text>
            <TouchableOpacity style={styles.photoBox} onPress={tomarFoto}>
                {fotoUri ? (
                    <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera-outline" size={36} color={Colors.textLight} />
                        <Text style={styles.photoText}>
                            {subiendoFoto ? 'Subiendo foto...' : 'Toca para tomar una foto'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {fotoUri && (
                <TouchableOpacity onPress={tomarFoto} style={styles.retakeButton}>
                    <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                    <Text style={styles.retakeText}>Tomar otra foto</Text>
                </TouchableOpacity>
            )}

            {/* Ubicación */}
            <Text style={styles.sectionLabel}>2. Ubicación del criadero</Text>
            <TouchableOpacity
                style={[styles.locationButton, ubicacionObtenida && styles.locationButtonActive]}
                onPress={obtenerUbicacion}
            >
                <Ionicons
                    name={ubicacionObtenida ? 'location' : 'location-outline'}
                    size={20}
                    color={ubicacionObtenida ? Colors.white : Colors.primary}
                />
                <Text style={[styles.locationText, ubicacionObtenida && styles.locationTextActive]}>
                    {ubicacionObtenida ? '✓ Ubicación capturada automáticamente' : 'Capturar mi ubicación GPS'}
                </Text>
            </TouchableOpacity>

            {ubicacionObtenida && latitud && (
                <Text style={styles.coordsText}>
                    📍 {latitud.toFixed(6)}, {longitud?.toFixed(6)}
                </Text>
            )}

            {/* Tipo de lugar */}
            <Text style={styles.sectionLabel}>3. Tipo de lugar</Text>
            <View style={styles.chipGroup}>
                {tiposLugar.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[styles.chip, tipoLugar === item && styles.chipActive]}
                        onPress={() => setTipoLugar(item)}
                    >
                        <Text style={[styles.chipText, tipoLugar === item && styles.chipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tipo de objeto */}
            <Text style={styles.sectionLabel}>4. Tipo de objeto</Text>
            <View style={styles.chipGroup}>
                {tiposObjeto.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[styles.chip, tipoObjeto === item && styles.chipActive]}
                        onPress={() => setTipoObjeto(item)}
                    >
                        <Text style={[styles.chipText, tipoObjeto === item && styles.chipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Presencia de larvas */}
            <Text style={styles.sectionLabel}>5. ¿Observas larvas?</Text>
            <View style={styles.chipGroup}>
                {opcionesLarvas.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[styles.chip, larvas === item && styles.chipActive]}
                        onPress={() => setLarvas(item)}
                    >
                        <Text style={[styles.chipText, larvas === item && styles.chipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Dengue cercano */}
            <Text style={styles.sectionLabel}>6. ¿Conoces casos de dengue cerca?</Text>
            <View style={styles.chipGroup}>
                {opcionesDengue.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[styles.chip, dengueCercano === item && styles.chipActive]}
                        onPress={() => setDengueCercano(item)}
                    >
                        <Text style={[styles.chipText, dengueCercano === item && styles.chipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Comentarios */}
            <Text style={styles.sectionLabel}>7. Comentarios adicionales (opcional)</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Describe lo que observas..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
                value={comentarios}
                onChangeText={setComentarios}
            />

            {/* Botón enviar */}
            <TouchableOpacity
                style={[styles.submitButton, loading && { opacity: 0.7 }]}
                onPress={onEnviar}
                disabled={loading}
            >
                <Ionicons name="send-outline" size={18} color={Colors.white} />
                <Text style={styles.submitButtonText}>
                    {loading ? 'ENVIANDO...' : 'ENVIAR REPORTE'}
                </Text>
            </TouchableOpacity>

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
        marginBottom: 28,
    },
    sectionLabel: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 13,
        color: Colors.text,
        marginBottom: 10,
        marginTop: 8,
    },
    photoBox: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        height: 180,
        marginBottom: 8,
        overflow: 'hidden',
    },
    photoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    photoText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    retakeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.primary,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        backgroundColor: Colors.surface,
    },
    locationButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    locationText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.primary,
    },
    locationTextActive: {
        color: Colors.white,
    },
    coordsText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.textLight,
        marginTop: -14,
        marginBottom: 20,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: Colors.surface,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.textLight,
    },
    chipTextActive: {
        color: Colors.white,
        fontFamily: 'Montserrat-ExtraBold',
    },
    textArea: {
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.text,
        textAlignVertical: 'top',
        marginBottom: 28,
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
    },
    submitButtonText: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 15,
        color: Colors.white,
        letterSpacing: 1,
    },
});