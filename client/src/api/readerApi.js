import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const readerApi = {
  getCourts: async () =>
    apiClient.get(API_CONFIG.ENDPOINTS.READER.COURTS),
  getRequests: async () =>
    apiClient.get(API_CONFIG.ENDPOINTS.READER.REQUESTS),
  createRequest: async (payload) =>
    apiClient.post(API_CONFIG.ENDPOINTS.READER.REQUESTS, payload),
  updateRequestDetails: async (id, payload) =>
    apiClient.put(`${API_CONFIG.ENDPOINTS.READER.REQUEST_DETAILS}/${id}/details`, payload),
  sendForSignature: async (id, payload) =>
    apiClient.post(`${API_CONFIG.ENDPOINTS.READER.SEND_FOR_SIGNATURE}/${id}/send`, payload),
  deleteRequest: async (id) =>
    apiClient.delete(`${API_CONFIG.ENDPOINTS.READER.DELETE_REQUEST}/${id}`),
  getOfficersByCourt: async (courtId) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.READER.OFFICERS}?courtId=${courtId}`),
  downloadRequestPdf: async (id) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.READER.REQUEST_PDF}/${id}/pdf`, {
      responseType: "blob",
    }),
};
