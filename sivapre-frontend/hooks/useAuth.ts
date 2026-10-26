// hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { login, registro, saveToken } from '../services/api';

export function useAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (username: string, password: string) => {
        setLoading(true);
        try {
            const data = await login(username, password);
            console.log('Token recibido:', data.access_token);
            await saveToken(data.access_token);
            console.log('Token guardado, navegando...');
            router.replace('/(tabs)/inicio');
        } catch (error) {
            console.log('Error en handleLogin:', error);
            throw new Error('Usuario o contraseña incorrectos.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistro = async (datos: {
        nombre_completo: string;
        dni: string;
        telefono?: string;
        municipio?: string;
        username: string;
        password: string;
    }) => {
        setLoading(true);
        try {
            await registro(datos);
            router.push('/(auth)/login');
        } catch (error: any) {
            throw new Error(error.message || 'Error al registrarse.');
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleRegistro, loading };
}