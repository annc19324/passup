import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { validateLogin } from "../utils/validation";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const passwordRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (nextRef && nextRef.current) {
                e.preventDefault();
                nextRef.current.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const error = validateLogin(identifier, password);
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/login", { identifier, password });
            if (res.data.success) {
                login(res.data.data.token, res.data.data.user);
                toast.success("Đăng nhập thành công!");
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-[1.5rem] shadow-xl border border-slate-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Đăng nhập</h2>
                    <p className="text-slate-500 font-medium text-xs">Chào mừng bạn quay trở lại PassUp</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Email, Username hoặc SĐT"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <div className="flex justify-end mt-2">
                                <Link to="/forgot-password" core-link="true" className="text-[10px] text-blue-600 font-bold hover:underline">Quên mật khẩu?</Link>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-blue-600 text-white p-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/20 active:scale-95 mt-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Đăng nhập ngay
                    </button>

                    <p className="text-center text-xs font-bold text-slate-500">
                        Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
