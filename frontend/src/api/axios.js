import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthRoute =
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register");

    // Only auto-logout on 401 for protected routes, not login/register
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("pp_token");
      localStorage.removeItem("pp_user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
