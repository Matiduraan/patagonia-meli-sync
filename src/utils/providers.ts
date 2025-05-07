import axios from "axios";
import {
  auth,
  mercadoLibreAccessToken,
  refresh,
} from "../services/mercadolibre_service";

export const mercadolibreProvider = axios.create({
  baseURL: "https://api.mercadolibre.com",
});

mercadolibreProvider.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("oauth/token")) {
      return config;
    }
    if (mercadoLibreAccessToken) {
      console.log("Token de acceso existente:", mercadoLibreAccessToken);
      config.headers.Authorization = `Bearer ${mercadoLibreAccessToken}`;
    } else {
      console.log("No hay token de acceso, obteniendo uno nuevo...");
      const tokens = await auth();
      if (!tokens) {
        throw new Error("No se pudo obtener el token de acceso");
      }
      const { access_token } = tokens;
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

mercadolibreProvider.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un 401 y todavía no reintentamos
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await refresh();
      originalRequest.headers.Authorization = `Bearer ${mercadoLibreAccessToken}`;
      return mercadolibreProvider(originalRequest);
    }

    // Si no es un error manejable, lo propagamos
    return Promise.reject(error);
  }
);

export const worksheetsProvider = axios.create({
  baseURL: "https://sheets.googleapis.com/v4/spreadsheets",
});
