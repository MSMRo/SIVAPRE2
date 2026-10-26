// splash
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function Splash() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/(auth)/welcome');
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SIVAPRE</Text>
            <Text style={styles.subtitle}>Vigilancia Participativa contra el Dengue</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        color: Colors.white,
        letterSpacing: 6,
        fontFamily: 'Montserrat-ExtraBold',  // ← con guión, no guión bajo
    },
    subtitle: {
        fontSize: 13,
        color: Colors.white,
        letterSpacing: 2,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        fontFamily: 'Inter-Regular',  // ← el nombre que definiste en _layout
    },
});