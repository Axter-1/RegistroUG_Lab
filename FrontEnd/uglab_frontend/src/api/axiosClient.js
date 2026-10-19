// src/api/axiosClient.js
import { authClient } from "../lib/auth-client.ts"; // tu cliente Better Auth
import axios from "axios";

export function setupAxiosInterceptors(setToken) {
  const api = axios.create({
    baseURL: "http://localhost:3000/",
  });

  // Interceptor para cada request
  api.interceptors.request.use(async (config) => {
    // Pedir un token válido (Better Auth se encarga de refrescar si expiró)
    const { data } = await authClient.token();

    if (data?.token) {// actualizar contexto
      config.headers.Authorization = `Bearer ${data.token}`;
    }

    return config;
  });

  return api;
}