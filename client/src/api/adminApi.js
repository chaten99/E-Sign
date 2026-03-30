import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const adminApi = {
    getDashboardDetails: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD), 
    getCourts: async () => 
        apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.COURTS),
    getOfficers: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.OFFICERS),
    getReaders: async () => 
        apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.READERS),
    createUser: async (payload) =>
        apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE_USER, payload),
    createCourt: async (payload) => 
        apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE_COURT, payload),
    deleteUser: async (id) =>
        apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.DELETE_USER}/${id}`),
    deleteCourt: async (id) =>
        apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.DELETE_COURT}/${id}`),
    getRequests: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.REQUESTS),
}
