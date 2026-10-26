// register.tsx
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
    const router = useRouter();
    const { handleRegistro, loading } = useAuth();
    const scrollRef = useRef<ScrollView>(null);

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [dni, setDni] = useState('');
    const [telefono, setTelefono] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

    const onRegistro = async () => {
        if (!nombreCompleto || !dni || !username || !password || !confirmarPassword) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
            return;
        }
        if (password !== confirmarPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        if (dni.length !== 8) {
            Alert.alert('Error', 'El DNI debe tener 8 dígitos.');
            return;
        }
        try {
            await handleRegistro({
                nombre_completo: nombreCompleto,
                dni,
                telefono,
                municipio,
                username,
                password,
            });
            Alert.alert('¡Éxito!', 'Cuenta creada correctamente. Inicia sesión.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Crear Cuenta</Text>
                <Text style={styles.subtitle}>Únete a la vigilancia comunitaria</Text>

                <View style={styles.form}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre Completo *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu nombre completo"
                            placeholderTextColor={Colors.textLight}
                            autoCapitalize="words"
                            value={nombreCompleto}
                            onChangeText={setNombreCompleto}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>DNI *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu DNI"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="numeric"
                            maxLength={8}
                            value={dni}
                            onChangeText={setDni}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa tu teléfono"
                            placeholderTextColor={Colors.textLight}
                            keyboardType="phone-pad"
                            value={telefono}
                            onChangeText={setTelefono}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Municipio / Distrito</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. San Juan de Lurigancho"
                            placeholderTextColor={Colors.textLight}
                            autoCapitalize="words"
                            value={municipio}
                            onChangeText={setMunicipio}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Usuario *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Crea un nombre de usuario"
                            placeholderTextColor={Colors.textLight}
                            autoCapitalize="none"
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña *</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Crea una contraseña"
                                placeholderTextColor={Colors.textLight}
                                secureTextEntry={!mostrarPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => {
                                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setMostrarPassword(!mostrarPassword)}
                            >
                                <Ionicons
                                    name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Contraseña *</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Repite tu contraseña"
                                placeholderTextColor={Colors.textLight}
                                secureTextEntry={!mostrarConfirmarPassword}
                                value={confirmarPassword}
                                onChangeText={setConfirmarPassword}
                                onFocus={() => {
                                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                            >
                                <Ionicons
                                    name={mostrarConfirmarPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <TouchableOpacity
                    style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
                    onPress={onRegistro}
                    disabled={loading}
                >
                    <Text style={styles.buttonPrimaryText}>
                        {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.loginLink}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    container: {
        paddingHorizontal: 32,
        paddingTop: 60,
        paddingBottom: 60,
    },
    backButton: {
        marginBottom: 32,
    },
    backText: {
        fontFamily: 'Inter-Regular',
        color: Colors.textLight,
        fontSize: 14,
    },
    title: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 28,
        color: Colors.text,
        marginBottom: 6,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 36,
    },
    form: {
        gap: 20,
        marginBottom: 28,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 12,
        color: Colors.text,
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.text,
        backgroundColor: Colors.background,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: Colors.background,
    },
    inputWithIcon: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.text,
    },
    eyeButton: {
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    buttonPrimary: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        letterSpacing: 1,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.textLight,
    },
    loginLink: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        color: Colors.primary,
    },
});