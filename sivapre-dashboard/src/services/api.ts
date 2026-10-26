import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE_URL });

export const loginAdmin = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getTodosLosReportes = async (token: string, params?: Record<string, any>) => {
  const response = await api.get('/reportes/todos', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const actualizarEstado = async (token: string, id: string, estado: string) => {
  const response = await api.patch(`/reportes/${id}/estado`, { estado }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCasosNoti = async (token: string) => {
  const response = await api.get('/reportes/epidemiologia/noti', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCasosNetlab = async (token: string) => {
  const response = await api.get('/reportes/epidemiologia/netlab', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
