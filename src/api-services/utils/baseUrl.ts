// src/services/utils/baseUrl.ts
import axios, { AxiosError, AxiosResponse } from "axios";

export const bookies_baseurl: string =
  "https://back-office-api.rhace.co";

//const bookies_baseurl_temporary = "https://bookies-backend-jl3n.onrender.com";

export const bookiesAxiosInstance = axios.create({
  baseURL: bookies_baseurl,
});

// --- Interceptors ---
const handleResponse = (response: AxiosResponse) => response.data;

const handleError = (error: AxiosError) => {
  if (error.response) {
    const { data, status } = error.response;
    // Expose the HTTP status to callers without changing the body's shape.
    // Non-enumerable so parseError's key-scanning fallback ignores it.
    if (data && typeof data === "object" && !("status" in data)) {
      Object.defineProperty(data, "status", { value: status, enumerable: false });
    }
    return Promise.reject(data);
  }
  return Promise.reject({ message: "Network error or server not reachable" })
}

bookiesAxiosInstance.interceptors.response.use(handleResponse, handleError)
