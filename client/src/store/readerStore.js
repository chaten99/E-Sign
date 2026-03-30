import { create } from "zustand";
import { readerApi } from "@/api/readerApi";
import { getApiErrorMessage } from "@/lib/apiError";

const getBlobErrorMessage = async (error, fallback) => {
  const responseData = error?.response?.data;
  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // ignore parse errors and fall back
    }
  }
  return getApiErrorMessage(error, fallback);
};

export const useReaderStore = create((set) => ({
  requests: [],
  courts: [],
  officers: [],
  loading: false,
  error: null,

  getRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.getRequests();
      const requests = response.data.data?.requests || [];
      set({ requests });

      return { success: true, requests };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to fetch requests");
      set({ requests: [], error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  getCourts: async () => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.getCourts();
      const courts = response.data.data?.courts || [];
      set({ courts });

      return { success: true, courts };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to fetch courts");
      set({ courts: [], error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  createRequest: async (payload) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.createRequest(payload);
      const request = response.data.data?.request || null;

      if (request) {
        set((state) => ({ requests: [request, ...state.requests] }));
      }

      return {
        success: true,
        message: response.data.message || "Request created successfully",
        request,
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to create request");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  updateRequestDetails: async (id, payload) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.updateRequestDetails(id, payload);
      const request = response.data.data?.request || null;

      if (request) {
        set((state) => ({
          requests: state.requests.map((item) =>
            item._id === id ? request : item
          ),
        }));
      }

      return {
        success: true,
        message: response.data.message || "Request details saved",
        request,
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to save request details");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  sendForSignature: async (id, officerId) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.sendForSignature(id, { officerId });
      const request = response.data.data?.request || null;

      if (request) {
        set((state) => ({
          requests: state.requests.map((item) =>
            item._id === id ? request : item
          ),
        }));
      }

      return {
        success: true,
        message: response.data.message || "Request sent for signature",
        request,
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to send request");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  deleteRequest: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.deleteRequest(id);
      set((state) => ({
        requests: state.requests.filter((item) => item._id !== id),
      }));

      return {
        success: true,
        message: response.data.message || "Request removed",
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to remove request");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  getOfficersByCourt: async (courtId) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.getOfficersByCourt(courtId);
      const officers = response.data.data?.officers || [];
      set({ officers });

      return { success: true, officers };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to fetch officers");
      set({ officers: [], error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  downloadRequestPdf: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await readerApi.downloadRequestPdf(id);
      return { success: true, blob: response.data };
    } catch (error) {
      const message = await getBlobErrorMessage(error, "Failed to download PDF");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },
}));
