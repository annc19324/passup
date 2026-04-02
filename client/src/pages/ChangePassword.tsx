import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Lock, Loader2, ShieldAlert } from "lucide-react";

export default function ChangePassword() {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPass !== confirmPass) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (newPass.length < 6) {
            toast.error("Mật khẩu mới phải từ 6 ký tự");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/change-password", { oldPass, newPass });
            if (res.data.success) {
                toast.success("Đổi mật khẩu thành công!");
                navigate("/profile");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mật khẩu cũ không chính xác");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <Link to="/profile" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại hồ sơ
            </Link>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Đổi mật khẩu</h2>
                    <p className="text-slate-500 font-medium text-sm">Cập nhật mật khẩu mới của bạn để bảo mật tài khoản.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="block text-slate-900 font-bold text-xs uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                                value={oldPass}
                                onChange={(e) => setOldPass(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 pt-2">
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

                    <div className="space-y-1">
                        <label className="block text-slate-900 font-bold text-xs uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "CẬP NHẬT MẬT KHẨU"}
                    </button>
                </form>
            </div>
        </div>
    );
}
