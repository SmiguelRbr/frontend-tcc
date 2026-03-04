import axios from 'axios';

// Cria a instância base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercetor de Requisição
api.interceptors.request.use(
  async (config) => {
    // Verificamos se estamos a correr no browser (o Next.js às vezes corre código no servidor, onde não há localStorage)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@app-token');
      
      // Se o token existir, adicionamos o cabeçalho de Autorização
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;