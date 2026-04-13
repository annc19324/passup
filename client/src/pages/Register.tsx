import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, User, Mail, Lock, Phone, UserCircle, Eye, EyeOff } from "lucide-react";
import { validateRegister } from "../utils/validation";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Refs for enter-to-next-field
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (nextRef && nextRef.current) {
                e.preventDefault();
                nextRef.current.focus();
            }
            // If no nextRef, let the form submit naturally
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const error = validateRegister({ fullName, email, username, phone, password });
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/register", { fullName, email, username, phone, password });
            if (res.data.success) {
                login(res.data.data.token, res.data.data.user);
                toast.success("Đăng ký thành công!");
                navigate("/");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-8">
            <div className="w-full max-w-sm bg-white p-6 rounded-[1.5rem] shadow-xl border border-slate-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Đăng ký</h2>
                    <p className="text-slate-500 font-medium text-xs">Tham gia cùng cộng đồng PassUp</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Họ và tên"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, usernameRef)}
                            />
                        </div>

                        <div className="relative">
                            <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={usernameRef}
                                type="text"
                                placeholder="Username (6+ ký tự)"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={emailRef}
                                type="email"
                                placeholder="Email"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={phoneRef}
                                type="text"
                                placeholder="Số điện thoại"
                                className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
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
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-blue-600 text-white p-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/20 active:scale-95 mt-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Tạo tài khoản ngay
                    </button>

                    <p className="text-center text-xs font-bold text-slate-500">
                        Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
