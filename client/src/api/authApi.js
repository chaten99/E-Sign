import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const authApi = {
    login: async (email, password) => 
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {email, password}),
    logout: async () => 
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
    getCurrentUser: async () => 
        apiClient.get(API_CONFIG.ENDPOINTS.AUTH.SESSION),
}
