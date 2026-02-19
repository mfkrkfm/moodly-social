import axios from "axios";

<<<<<<< Updated upstream
export const apiClient = axios.create({
  baseURL: "http://localhost:8082",
  headers: {
    "Content-Type": "application/json",
  },
=======
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
>>>>>>> Stashed changes
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
<<<<<<< Updated upstream
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
=======
  if (token) config.headers.Authorization = `Bearer ${token}`;
>>>>>>> Stashed changes
  return config;
});
