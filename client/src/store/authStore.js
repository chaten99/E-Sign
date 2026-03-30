import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { getApiErrorMessage } from "@/lib/apiError";

const getSessionUser = async () => {
  const response = await authApi.getCurrentUser();
  return response.data.data?.user ?? null;
};

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  authReady: false,
  setUser: (user) => set({ user }),

  checkAuth: async () => {
    try {
      const user = await getSessionUser();

      if (!user) {
        set({ user: null });
        return {
          success: false,
          message: "No active session found",
        };
      }

      set({ user });

      return {
        success: true,
        message: "Current user fetched successfully",
        user,
      };
    } catch (error) {
      set({ user: null });
      return {
        success: false,
        message: getApiErrorMessage(error, "Failed to fetch user"),
      };
    } finally {
      set({ authReady: true });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await authApi.login(email, password);
      const user = await getSessionUser();

      if (!user) {
        set({ user: null, authReady: true });
        return {
          success: false,
          message: "Login succeeded but the user session could not be loaded",
        };
      }

      set({ user, authReady: true });

      return {
        success: true,
        message: response.data.message || "Login successful",
        user,
      };
    } catch (error) {
      set({ user: null, authReady: true });
      return {
        success: false,
        message: getApiErrorMessage(error, "Login failed"),
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      const response = await authApi.logout();
      set({ user: null, authReady: true });

      return {
        success: true,
        message: response.data.message || "Logout successful",
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, "Logout failed"),
      };
    } finally {
      set({ loading: false });
    }
  },
}));
