import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const officerApi = {
  getRequests: async () =>
    apiClient.get(API_CONFIG.ENDPOINTS.OFFICER.REQUESTS),
  downloadRequestPdf: async (id) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.OFFICER.REQUEST_PDF}/${id}/pdf`, {
      responseType: "blob",
    }),
  rejectRequest: async (id) =>
    apiClient.post(`${API_CONFIG.ENDPOINTS.OFFICER.REJECT}/${id}/reject`),
  signRequest: async (id, payload) =>
    apiClient.post(`${API_CONFIG.ENDPOINTS.OFFICER.SIGN}/${id}/sign`, payload),
};
