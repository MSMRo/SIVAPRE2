// BIENVENIDA
import { Text, View, StyleSheet, TouchableOpacity, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function Welcome() {
    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* Logo / Título */}
            <View style={styles.header}>
                <Text style={styles.logo}>SIVAPRE</Text>
                <Text style={styles.logoAccent}>.</Text>
            </View>


            {/* Logo imagen 
            <View style={styles.middle}>
                <View style={styles.logoCard}>
                    <RNImage
                        source={require('../../assets/images/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>¡BIENVENIDO!</Text>
                <Text style={styles.subtitle}>
                    Tu reporte puede salvar vidas.{'\n'}
                    Únete a la vigilancia{'\n'}
                    comunitaria contra el dengue.
                </Text>
            </View> */}
            {/*
            <View style={styles.middle}>
                <RNImage
                    source={require('../../assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <Text style={styles.title}>¡BIENVENIDO!</Text>
                <Text style={styles.subtitle}>
                    Tu reporte puede salvar vidas.{'\n'}
                    Únete a la vigilancia{'\n'}
                    comunitaria contra el dengue.
                </Text>
            </View> */}

            {/* Frase motivadora  */}
            <View style={styles.middle}>
                <Text style={styles.title}>¡BIENVENIDO!</Text>
                <Text style={styles.subtitle}>
                    Tu reporte puede salvar vidas.{'\n'}
                    Únete a la vigilancia{'\n'}
                    comunitaria contra el dengue.
                </Text>
            </View>

            {/* Botones */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.buttonPrimaryText}>INICIAR SESIÓN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text style={styles.buttonSecondaryText}>CREAR CUENTA</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 32,
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    logo: {
        fontSize: 32,
        fontFamily: 'Montserrat-ExtraBold',
        color: Colors.primary,
    },
    logoAccent: {
        fontSize: 40,
        fontFamily: 'Montserrat-ExtraBold',
        color: Colors.accent,
    },
    middle: {
        alignItems: 'center',
    },

    logoCard: {
        width: 220,
        height: 220,
        borderRadius: 40,
        backgroundColor: '#EAF4F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
    },

    logoImage: {
        width: 170,
        height: 170,
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Montserrat-ExtraBold',
        color: Colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttons: {
        gap: 12,
        marginBottom: 30,
    },
    buttonPrimary: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        letterSpacing: 1,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    buttonSecondaryText: {
        color: Colors.primary,
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 14,
        letterSpacing: 1,
    },
});