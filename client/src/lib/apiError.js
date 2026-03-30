import { AxiosError } from "axios";

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData?.errors === "string" && responseData.errors.trim()) {
      return responseData.errors;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      const firstError = responseData.errors[0];

      if (typeof firstError === "string" && firstError.trim()) {
        return firstError;
      }

      if (typeof firstError?.msg === "string" && firstError.msg.trim()) {
        return firstError.msg;
      }
    }

    if (!error.response) {
      return "Unable to reach the server. Please try again.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
