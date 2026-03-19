import axios from 'axios';

// Cria a instância base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercetor de Requisição (O teu código original)
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@app-token');
      
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

// === ADICIONA ISTO: Intercetor de Resposta ===
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu certo (Status 200, 201), passa a resposta para a frente normalmente
    return response;
  },
  (error) => {
    // Se deu erro, verificamos se o Laravel bloqueou (401 ou 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('@app-token');
        
        // Se for 401 e o utilizador nem token tem, chuta para o Login
        if (error.response.status === 401 && !token) {
          window.location.href = '/login';
        } else {
          // Se for 403 (ex: Aluno a tentar aceder a rota de Profissional), chuta para o Erro
          window.location.href = '/nao-autorizado';
        }
      }
    }
    
    // Repassa o erro para o frontend lidar (ex: para o toast.error funcionar)
    return Promise.reject(error);
  }
);

export default api;