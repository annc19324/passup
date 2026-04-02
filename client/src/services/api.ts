import axios from "axios";

// Tạo instance axios để gọi API với config cơ bản
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor: Trước khi gửi request, tự động đính kèm token (nếu có) vào header Authorization
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
