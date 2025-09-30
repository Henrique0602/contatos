// utils/api.js
import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'https://68d96d1b90a75154f0da61ae.mockapi.io', // MockAPI
  timeout: 10000, // 10 segundos (API online pode ser mais lenta)
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('Enviando requisição:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.status);
    return response;
  },
  (error) => {
    console.error('Erro na requisição:', error.message);
    return Promise.reject(error);
  }
);

export default api;