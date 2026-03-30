import { create } from "zustand";
import { officerApi } from "@/api/officerApi";
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

export const useOfficerStore = create((set) => ({
  requests: [],
  loading: false,
  error: null,

  getRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await officerApi.getRequests();
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

  rejectRequest: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await officerApi.rejectRequest(id);
      const request = response.data.data?.request || null;
      if (request) {
        set((state) => ({
          requests: state.requests.map((item) =>
            item._id === id ? request : item
          ),
        }));
      }
      return { success: true, message: response.data.message || "Request rejected" };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to reject request");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  signRequest: async (id, signatureDataUrl) => {
    try {
      set({ loading: true, error: null });
      const response = await officerApi.signRequest(id, { signatureDataUrl });
      const request = response.data.data?.request || null;
      if (request) {
        set((state) => ({
          requests: state.requests.map((item) =>
            item._id === id ? request : item
          ),
        }));
      }
      return { success: true, message: response.data.message || "Request signed" };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to sign request");
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ loading: false });
    }
  },

  downloadRequestPdf: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await officerApi.downloadRequestPdf(id);
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
