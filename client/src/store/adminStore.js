import { create } from "zustand";
import { adminApi } from "@/api/adminApi";
import { getApiErrorMessage } from "@/lib/apiError";

const DEFAULT_DASHBOARD_DETAILS = {
  courtCount: 0,
  officerCount: 0,
  readerCount: 0,
  documentCount: 0,
};

export const useAdminStore = create((set) => ({
  dashboardDetails: DEFAULT_DASHBOARD_DETAILS,
  courts: [],
  officers: [],
  readers: [],
  requests: [],
  loading: false,
  error: null,

  fetchDashboardDetails: async () => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.getDashboardDetails();
      const dashboardDetails = {
        ...DEFAULT_DASHBOARD_DETAILS,
        ...response.data.data,
      };

      set({ dashboardDetails });

      return {
        success: true,
        data: dashboardDetails,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to fetch dashboard details");
      set({
        dashboardDetails: DEFAULT_DASHBOARD_DETAILS,
        error: message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  getCourts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.getCourts();
      const courts = response.data.data?.courts || [];
      set({ courts });

      return {
        success: true,
        courts,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to fetch courts");
      set({ courts: [], error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  getOfficers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.getOfficers();
      const officers = response.data.data?.officers || [];
      set({ officers });

      return {
        success: true,
        officers,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to fetch officers");
      set({ officers: [], error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  getReaders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.getReaders();
      const readers = response.data.data?.readers || [];
      set({ readers });

      return {
        success: true,
        readers,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to fetch readers");
      set({ readers: [], error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  getRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.getRequests();
      const requests = response.data.data?.requests || [];
      set({ requests });

      return {
        success: true,
        requests,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to fetch requests");
      set({ requests: [], error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (payload) => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.createUser(payload);

      return {
        success: true,
        message: response.data.message || "User created successfully",
        user: response.data.data?.user || null,
      };
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create user");
      set({ error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },
  createCourt: async (payload) => {
    try {
        set({ loading: true, error: null });
        const response = await adminApi.createCourt(payload);

        return {
            success: true,
            message: response.data.message || "Court created successfully",
            court: response.data.data?.court || null,
        }
    } catch (error) {
        const message = getApiErrorMessage(error, "Failed to create court");
        set({ error: message });

        return {
            success: false,
            message,
        };
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id, role) => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.deleteUser(id);

      set((state) => ({
        officers: role === "officer" ? state.officers.filter((item) => item._id !== id) : state.officers,
        readers: role === "reader" ? state.readers.filter((item) => item._id !== id) : state.readers,
      }));

      return {
        success: true,
        message: response.data.message || "User deleted successfully",
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to delete user");
      set({ error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },

  deleteCourt: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await adminApi.deleteCourt(id);

      set((state) => ({
        courts: state.courts.filter((item) => item._id !== id),
      }));

      return {
        success: true,
        message: response.data.message || "Court deleted successfully",
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to delete court");
      set({ error: message });

      return {
        success: false,
        message,
      };
    } finally {
      set({ loading: false });
    }
  },
}));
