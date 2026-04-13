import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/vi';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, ShieldCheck, Tag, MessageCircle, Loader2, Heart, AlertTriangle, Edit2, Zap, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

moment.locale('vi');

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [error, setError] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    // Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('Sản phẩm giả mạo');
    const [reportDesc, setReportDesc] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const handleReport = async () => {
        if (!user) { navigate('/login'); return; }
        setReportLoading(true);
        try {
            const res = await api.post('/reports/create', { targetType: 'PRODUCT', targetId: product.id, reason: reportReason, description: reportDesc });
            if (res.data.success) { toast.success('Cảm ơn bạn đã báo cáo.'); setShowReportModal(false); }
        } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi gửi báo cáo'); } finally { setReportLoading(false); }
    };

    const handleChat = async () => {
        if (!user) { navigate('/login'); return; }
        setChatLoading(true);
        try {
            const res = await api.post('/chat/start', { sellerId: product.seller.id, productId: product.id });
            if (res.data.success) navigate(`/chat?id=${res.data.data.id}`);
        } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi khởi tạo cuộc chat'); } finally { setChatLoading(false); }
    };

    const handleLike = async () => {
        if (!user) { navigate('/login'); return; }
        setLikeLoading(true);
        try {
            const res = await api.post('/wishlist/toggle', { productId: product.id });
            if (res.data.success) setIsLiked(res.data.data.isWishlisted);
        } catch (err) { console.error('Lỗi toggle wishlist:', err); } finally { setLikeLoading(false); }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                if (res.data.success) {
                    setProduct(res.data.data);
                    setIsLiked(res.data.data.isWishlisted || false);
                    if (res.data.data.images?.length > 0) setMainImage(res.data.data.images[0]);
                } else { setError('Không tìm thấy sản phẩm'); }
            } catch (err: any) { setError(err.response?.data?.message || 'Có lỗi xảy ra'); } finally { setLoading(false); }
        };
        fetchProduct();
    }, [id]);



    if (loading) return <div className="p-20 text-center animate-pulse text-slate-300"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" /> Đang tải dữ liệu...</div>;
    if (error || !product) return <div className="text-center py-20"><h2 className="text-2xl font-bold text-slate-700 mb-4">{error || 'Không tìm thấy sản phẩm'}</h2><Link to="/" className="text-blue-600 underline">Quay về trang chủ</Link></div>;

    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(product.price));
    const timeAgo = moment(product.createdAt).fromNow();

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 mb-20 flex flex-col gap-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-[400px] p-2 bg-slate-50/50 shrink-0 border-r border-slate-100 flex flex-col items-center">
                        <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-white border border-slate-100 mb-3 relative shadow-inner">
                            <img src={mainImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format"} className="w-full h-full object-cover" alt="" />
                            {(product.status === 'SOLD' || product.stock <= 0) && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                    <span className="bg-white text-slate-900 px-6 py-2 rounded-2xl font-black text-xl shadow-2xl border-4 border-white">❌ ĐÃ BÁN HẾT</span>
                                </div>
                            )}
                            {product.status === 'RESERVED' && product.stock > 0 && (
                                <div className="absolute inset-0 bg-amber-900/20 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-amber-400 text-slate-900 px-6 py-2 rounded-2xl font-black text-xl shadow-2xl border-4 border-white">⏸️ ĐANG ĐỢI GIAO</span>
                                </div>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-4 px-2 no-scrollbar justify-center">
                                {product.images.map((img: string, idx: number) => (
                                    <button key={idx} onClick={() => setMainImage(img)} className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent opacity-60'}`}><img src={img} className="w-full h-full object-cover" alt="" /></button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-grow p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{product.category?.name}</span>
                                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{product.title}</h1>
                            <div className="text-3xl font-black text-rose-600 mb-6 flex items-baseline gap-1">{formattedPrice}</div>
                            
                            <div className="bg-slate-50 rounded-3xl p-5 mb-6 space-y-3 border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-slate-400 w-4 h-4 mt-0.5" />
                                    <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Khu vực giao dịch</div><div className="text-slate-600 text-sm font-bold">{product.district ? `${product.district}, ` : ''}{product.province || 'Toàn quốc'}</div></div>
                                </div>
                                <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                    <Package className="text-blue-500 w-4 h-4 mt-0.5" />
                                    <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Số lượng sẵn có</div><div className="text-slate-600 text-sm font-bold">{product.stock > 0 ? `${product.stock} sản phẩm` : 'Đã hết hàng'}</div></div>
                                </div>
                                <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
                                    <ShieldCheck className="text-emerald-500 w-4 h-4 mt-0.5" />
                                    <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hình thức nhận hàng</div>
                                    <div className="text-slate-600 text-sm font-bold flex flex-col gap-1">{product.allowPickup && <span>🏠 Đến lấy trực tiếp</span>}{product.allowShip && <span className="flex items-center gap-2">🚚 Giao hàng tận nơi {product.shipPrice && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-black">+{product.shipPrice}</span>}</span>}</div></div>
                                </div>
                            </div>

                            <Link to={`/seller/${product.sellerId}`} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all mb-8 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl overflow-hidden flex items-center justify-center font-black text-blue-600 shadow-sm">{product.seller?.avatar ? <img src={product.seller.avatar} className="w-full h-full object-cover" alt="" /> : product.seller?.fullName?.charAt(0)}</div>
                                    <div><div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm">{product.seller?.fullName}</div><div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Người bán uy tín</div></div>
                                </div>
                                <div className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl uppercase">Xem Shop</div>
                            </Link>
                        </div>

                        <div className="flex-grow flex flex-col justify-end gap-3 pb-4">
                            {(user?.id === product.sellerId || user?.role === 'ADMIN') ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await api.post('/payment/push', { productId: product.id });
                                                if (res.data.success) { toast.success('🚀 Đã đưa tin lên TOP và Nổi bật!'); setTimeout(() => window.location.reload(), 1500); }
                                            } catch (err: any) { toast.error(err.response?.data?.message || 'Bạn không đủ lượt đẩy tin.'); navigate('/profile'); }
                                        }}
                                        className="py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-xs tracking-widest uppercase"
                                    >
                                        <Zap className="w-4 h-4 fill-current" /> ĐẨY TIN LÊN TOP & NỔI BẬT
                                    </button>
                                    <Link to={`/edit-product/${product.id}`} className="py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all text-xs tracking-widest uppercase"><Edit2 className="w-4 h-4" /> Chỉnh sửa tin</Link>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleChat} disabled={chatLoading} className="flex-grow py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm tracking-widest uppercase">
                                        {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />} NHẮN TIN VỚI NGƯỜI BÁN
                                    </button>
                                    <button onClick={handleLike} disabled={likeLoading} className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all ${isLiked ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'}`}><Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative group">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><Tag className="w-5 h-5 text-blue-500" /> Mô tả chi tiết</h2>
                    <button onClick={() => setShowReportModal(true)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-rose-500"><AlertTriangle className="w-3.5 h-3.5" /> Báo cáo vi phạm</button>
                </div>
                <div className="text-slate-600 font-medium whitespace-pre-line leading-relaxed text-sm">{product.description}</div>
            </div>

            {showReportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 text-rose-600"><AlertTriangle className="w-6 h-6" /><h2 className="text-xl font-black uppercase">Báo cáo tin đăng</h2></div>
                        <div className="space-y-4 mb-8">
                            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" value={reportReason} onChange={(e) => setReportReason(e.target.value)}><option>Sản phẩm giả mạo</option><option>Hình ảnh phản cảm</option><option>Lừa đảo/Gian lận</option><option>Lý do khác</option></select>
                            <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none h-24" placeholder="Mô tả kỹ thêm tại đây..." value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} />
                        </div>
                        <div className="flex gap-3"><button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-xs uppercase">Hủy</button><button onClick={handleReport} disabled={reportLoading} className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-rose-500/20">{reportLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Gửi báo cáo'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
