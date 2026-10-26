// hooks/useUsuario.ts
import { useState, useEffect } from 'react';
import { getPerfil } from '../services/api';

export function useUsuario() {
    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getPerfil();
                setUsuario(data);
            } catch (error) {
                console.log('Error al cargar perfil:', error);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    return { usuario, loading };
}