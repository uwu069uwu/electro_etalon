import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://electroetalon-production.up.railway.app/api",
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
    return `https://electroetalon-production.up.railway.app${url}`;
  }

  // обычный файл
  return `https://electroetalon-production.up.railway.app/api/files/${url}`;
};

export default API;
