import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const publicApi = {
  getRequest: async (id) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.PUBLIC.REQUEST}/${id}`),
  downloadRequestPdf: async (id) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.PUBLIC.REQUEST_PDF}/${id}/pdf`, {
      responseType: "blob",
    }),
};
