import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            if (res.data.success) {
                login(res.data.data.token, res.data.data.user);
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập PassUp</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="flex justify-end mt-1">
                            <Link to="/forgot-password" title="Quên mật khẩu?" className="text-xs text-blue-500 hover:underline">Quên mật khẩu?</Link>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Đăng nhập
                    </button>

                    <p className="text-center mt-2">
                        Chưa có tài khoản? <Link to="/register" className="text-blue-500 hover:underline">Đăng ký ngay</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
