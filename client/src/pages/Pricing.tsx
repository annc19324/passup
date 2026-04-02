import { useState, useEffect } from 'react';
import api from '../services/api';
import { Zap, Package, Loader2, X, RefreshCcw, ChevronLeft } from 'lucide-react';
import { usePayOS, type PayOSConfig } from 'payos-checkout';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [orderCode, setOrderCode] = useState<number | null>(null);
    const [showPayOS, setShowPayOS] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const payOSConfig: PayOSConfig = {
        RETURN_URL: window.location.href,
        ELEMENT_ID: "payos-checkout-container", 
        CHECKOUT_URL: checkoutUrl,
        embedded: true,
        onSuccess: () => {
            toast.success("Thanh toán thành công! Hệ thống đang xử lý...");
            handleCheckPayment(orderCode);
            setShowPayOS(false);
        },
        onCancel: () => {
            setShowPayOS(false);
            toast.error("Đã hủy thanh toán.");
        }
    };

    const { open, exit } = usePayOS(payOSConfig);

    const fetchUserData = () => {
        api.get('/users/me')
            .then(res => {
                if (res.data.success) {
                    setUserData(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUserData(); }, []);

    useEffect(() => {
        if (checkoutUrl && showPayOS) {
            const timer = setTimeout(() => {
                const element = document.getElementById("payos-checkout-container");
                if (element) open();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [checkoutUrl, showPayOS]);

    const handleCreatePayment = async (amount: number, type: string, description: string) => {
        const loadingToast = toast.loading("Đang khởi tạo QR...");
        try {
            const res = await api.post('/payment/create-link', { amount, type, description });
            if (res.data.success) {
                setCheckoutUrl(res.data.checkoutUrl);
                setOrderCode(res.data.orderCode);
                setShowPayOS(true);
                toast.dismiss(loadingToast);
            }
        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || "Lỗi tạo link thanh toán");
        }
    };

    const handleCheckPayment = async (code: number | null) => {
        if (!code) return;
        setVerifying(true);
        const verifyingToast = toast.loading("Đang xác thực giao dịch...");
        try {
            const res = await api.get(`/payment/check/${code}`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUserData();
                setOrderCode(null);
            } else {
                toast(res.data.message, { icon: 'ℹ️' });
            }
        } catch (err: any) {
            toast.error("Lỗi xác thực: Trình duyệt chưa thể kết nối...");
        } finally {
            setVerifying(false);
            toast.dismiss(verifyingToast);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 animate-pulse"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-32">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Gói dịch vụ</h1>
                    <p className="text-sm text-slate-500 font-medium">Nâng cấp trải nghiệm bán hàng của bạn</p>
                </div>
            </div>

            {showPayOS && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { exit(); setShowPayOS(false); }}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-blue-600 fill-current" />
                                <h3 className="font-black text-slate-900">Thanh toán Quét mã QR</h3>
                            </div>
                            <button onClick={() => { exit(); setShowPayOS(false); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div id="payos-checkout-container" className="flex-grow bg-slate-50"></div>
                        <div className="p-4 border-t border-slate-50 flex gap-2">
                            <button 
                                onClick={() => handleCheckPayment(orderCode)} 
                                disabled={verifying}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2"
                            >
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                TÔI ĐÃ CHUYỂN KHOẢN XONG
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-1">Lượt đẩy tin</h3>
                    <div className="text-4xl font-black mb-4">{(userData?.pushCount || 0).toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                    <Package className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-1">Lượt đăng tin</h3>
                    <div className="text-4xl font-black mb-4">{(userData?.postLimit || 0).toLocaleString()}</div>
                </div>
            </div>

            {/* SECTION: LƯỢT ĐẨY TIN */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
                    <Zap className="w-5 h-5 text-blue-600 fill-current" />
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Nạp lượt đẩy tin (Lên đầu trang)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="text-3xl font-black mb-1 text-slate-900">10.000đ</div>
                        <div className="text-xs text-slate-500 font-bold mb-8">Nhận 1 lượt đẩy tin</div>
                        <button onClick={() => handleCreatePayment(10000, "PUSH_PACK_1", "1 luot day tin")} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black hover:bg-blue-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10">MUA NGAY</button>
                    </div>
                    <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-xl transition-all scale-105 z-10 relative">
                        <div className="absolute top-4 right-8 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Phổ biến</div>
                        <div className="text-3xl font-black mb-1 text-blue-900">50.000đ</div>
                        <div className="text-xs text-blue-600/70 font-bold mb-8">Nhận 5 lượt đẩy tin</div>
                        <button onClick={() => handleCreatePayment(50000, "PUSH_PACK_5", "5 luot day tin")} className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-500/20">MUA NGAY</button>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="text-3xl font-black mb-1 text-slate-900">400.000đ</div>
                        <div className="text-xs text-slate-500 font-bold mb-8">Nhận 50 lượt đẩy tin VIP</div>
                        <button onClick={() => handleCreatePayment(400000, "PUSH_PACK_50", "50 luot day VIP")} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black hover:bg-blue-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10">MUA NGAY</button>
                    </div>
                </div>
            </div>

            {/* SECTION: LƯỢT ĐĂNG TIN */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
                    <Package className="w-5 h-5 text-emerald-600 fill-current" />
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Nạp lượt đăng thêm tin (Gói đăng tin)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="text-3xl font-black mb-1 text-emerald-900">50.000đ</div>
                            <div className="text-xs text-emerald-700 font-bold uppercase tracking-widest opacity-70">Thêm 5 lượt đăng tin mới</div>
                        </div>
                        <button onClick={() => handleCreatePayment(50000, "POST_PACK_5", "5 luot dang tin")} className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] text-xs font-black hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-xl shadow-emerald-500/20">MUA NGAY</button>
                    </div>
                    <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-tighter">Siêu hời</div>
                        <div>
                            <div className="text-3xl font-black mb-1 text-amber-900">150.000đ</div>
                            <div className="text-xs text-amber-700 font-bold uppercase tracking-widest opacity-70">Thêm 20 lượt đăng tin</div>
                        </div>
                        <button onClick={() => handleCreatePayment(150000, "POST_PACK_20", "20 luot dang tin")} className="w-full sm:w-auto px-10 py-4 bg-amber-600 text-white rounded-[1.5rem] text-xs font-black hover:bg-amber-700 transition-all uppercase tracking-widest shadow-xl shadow-amber-500/20">MUA NGAY</button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Hỗ trợ khách hàng 24/7</p>
                <h4 className="text-sm font-black text-slate-900">Mọi thắc mắc vui lòng liên hệ Zalo: 0834178640</h4>
            </div>
        </div>
    );
}
