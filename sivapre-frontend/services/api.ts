// services/api.ts
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://161.132.53.226:8000';

export const getToken = async () => {
    return await SecureStore.getItemAsync('token');
};

export const saveToken = async (token: string) => {
    await SecureStore.setItemAsync('token', token);
};

export const removeToken = async () => {
    await SecureStore.deleteItemAsync('token');
};

// ─── Auth ──────────────────────────────────────────

export const login = async (username: string, password: string) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Usuario o contraseña incorrectos');
    return response.json();
};

export const registro = async (datos: {
    nombre_completo: string;
    dni: string;
    telefono?: string;
    municipio?: string;
    username: string;
    password: string;
}) => {
    const response = await fetch(`${BASE_URL}/auth/registro`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al registrarse');
    }
    return response.json();
};

export const getPerfil = async () => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Error al obtener perfil');
    return response.json();
};

// ─── Reportes ──────────────────────────────────────

export const crearReporte = async (datos: {
    latitud: number;
    longitud: number;
    foto_url?: string;
    tipo_lugar: string;
    tipo_objeto: string;
    observa_larvas: string;
    conocimiento_dengue_cercano: string;
    comentarios?: string;
}) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/reportes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al enviar el reporte');
    return response.json();
};

export const getMisReportes = async () => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/reportes/mis-reportes`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Error al obtener reportes');
    return response.json();
};

export const getReporteById = async (id: string) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/reportes/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Error al obtener el reporte');
    return response.json();
};

export const subirFoto = async (uri: string) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'foto.jpg',
    } as any);

    const response = await fetch(`${BASE_URL}/reportes/upload-foto`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    if (!response.ok) throw new Error('Error al subir la foto');
    return response.json();
};