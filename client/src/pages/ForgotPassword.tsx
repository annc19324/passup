import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Mail, ShieldCheck, Lock, Loader2 } from "lucide-react";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPass, setNewPass] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/forgot-password", { email });
            if (res.data.success) {
                toast.success(res.data.message);
                setStep(2);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể gửi mã xác thực");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/reset-password", { email, otp, newPass });
            if (res.data.success) {
                toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
                navigate("/login");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mã xác thực không chính xác");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors font-bold text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại đăng nhập
                </Link>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Quên mật khẩu?</h2>
                        <p className="text-slate-500 font-medium">
                            {step === 1 ? "Nhập email của bạn để nhận mã xác thực khôi phục mật khẩu." : "Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn."}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-slate-900 font-bold text-xs uppercase tracking-widest ml-1">Email của bạn</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                                        placeholder="email@vidu.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "GỬI MÃ XÁC THỰC"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-slate-900 font-bold text-xs uppercase tracking-widest ml-1">Mã xác thực (OTP)</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-2xl tracking-[10px] placeholder:tracking-normal placeholder:text-sm"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-slate-900 font-bold text-xs uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                                        placeholder="••••••••"
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ĐỔI MẬT KHẨU"}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                className="w-full text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Gửi lại mã khác
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
