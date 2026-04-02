import { createContext, useState, useEffect, type ReactNode, useContext } from "react";
import api from "../services/api";

type User = {
    id: number;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
    phone?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
    addressDetail?: string;
    background?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
};

// Khởi tạo Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook dùng nhanh
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    // Gọi API /auth/me để lấy user info (vì token tự đính kèm qua axios interceptor)
                    const res = await api.get("/auth/me");
                    if (res.data.success) {
                        setUser(res.data.data.user);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error("Lỗi xác thực:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
