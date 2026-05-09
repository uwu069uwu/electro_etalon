import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ee_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const fileUrl = (url) => {
  if (!url) return "";

  // если уже полный URL
  if (url.startsWith("http")) return url;

  // если приходит /api/...
  if (url.startsWith("/api/")) {
    return `http://localhost:8000${url}`;
  }

  // обычный файл
  return `http://localhost:8000/api/files/${url}`;
};

export default API;