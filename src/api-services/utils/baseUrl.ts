// src/services/utils/baseUrl.ts
import axios, { AxiosError, AxiosResponse } from "axios";

export const bookies_baseurl: string =
  "https://bookies-backend-jdv3.onrender.com";

//const bookies_baseurl_temporary = "https://bookies-backend-jl3n.onrender.com";

export const bookiesAxiosInstance = axios.create({
  baseURL: bookies_baseurl,
});

// --- Interceptors ---
const handleResponse = (response: AxiosResponse) => response.data;

const handleError = (error: AxiosError) => {
  if (error.response) return Promise.reject(error.response.data);
  return Promise.reject({ message: "Network error or server not reachable" });
};

bookiesAxiosInstance.interceptors.response.use(handleResponse, handleError);
