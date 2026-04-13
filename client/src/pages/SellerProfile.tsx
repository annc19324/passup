import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, MapPin, Calendar, MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

export default function SellerProfile() {
    const { id } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('Người dùng lừa đảo');
    const [reportDesc, setReportDesc] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const handleReport = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để báo cáo');
            return;
        }
        setReportLoading(true);
        try {
            const res = await api.post('/reports/create', {
                targetType: 'USER',
                targetId: profile.id,
                reason: reportReason,
                description: reportDesc
            });
            if (res.data.success) {
                toast.success('Báo cáo của bạn đã được gửi.');
                setShowReportModal(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi gửi báo cáo');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                if (res.data.success) {
                    setProfile(res.data.data);
                }
            } catch (err) {
                console.error('Lỗi lấy profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Đang tải hồ sơ người bán...</p>
        </div>
    );

    if (!profile) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-700">Người dùng không tồn tại</h2>
            <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Quay về trang chủ</Link>
        </div>
    );



    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            {/* Profile Header Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                <div className="px-6 md:px-12 pb-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-8 text-center md:text-left">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-8 border-white bg-slate-100 overflow-hidden shadow-xl">
                            {profile.avatar ? (
                                <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                                    <User className="w-16 h-16 md:w-20 md:h-20" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow pb-2">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900">{profile.fullName}</h1>
                                <button 
                                    onClick={() => setShowReportModal(true)}
                                    title="Báo cáo người dùng này"
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {profile.province || profile.address || 'Toàn quốc'}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" /> Tham gia {moment(profile.createdAt).format('MM/YYYY')}</span>
                            </div>
                        </div>

                        {/* Modal Báo cáo USER */}
                        {showReportModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center gap-3 mb-6 text-rose-600">
                                        <AlertTriangle className="w-8 h-8" />
                                        <h2 className="text-2xl font-black">Báo cáo người dùng</h2>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 mb-2">Lý do báo cáo</label>
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                            >
                                                <option>Người dùng lừa đảo/Gian lận</option>
                                                <option>Ngôn từ không phù hợp/Xúc phạm</option>
                                                <option>Spam/Quấy rối</option>
                                                <option>Bán hàng cấm/Trái phép</option>
                                                <option>Lý do khác</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 mb-2">Mô tả chi tiết</label>
                                            <textarea 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                                placeholder="Bằng chứng hoặc mô tả chi tiết vi phạm..."
                                                value={reportDesc}
                                                onChange={(e) => setReportDesc(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setShowReportModal(false)}
                                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button 
                                            onClick={handleReport}
                                            disabled={reportLoading}
                                            className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                                        >
                                            {reportLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Gửi báo cáo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            <MessageCircle className="w-5 h-5" /> Nhắn tin
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-slate-900">{profile.products?.length || 0}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang bán</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-slate-900">0</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đã bán</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-black text-slate-900">100%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tỉ lệ phản hồi</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-8 border-b border-slate-200 mb-8">
                <button 
                    className={`pb-4 px-2 font-black text-lg transition-all relative text-blue-600`}
                >
                    Sản phẩm đang bán
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                </button>
            </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {profile.products?.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-100 italic text-slate-400">
                            Chưa có sản phẩm nào đang rao bán.
                        </div>
                    ) : profile.products.map((p: any) => (
                        <ProductCard 
                            key={p.id}
                            productId={p.id}
                            productSlug={p.slug}
                            title={p.title}
                            price={p.price}
                            province={p.province}
                            district={p.district}
                            location={profile.address || "Liên hệ"}
                            time={p.createdAt}
                            image={p.images?.[0] || ""}
                            initialIsWishlisted={p.isWishlisted}
                            isHighlight={p.isHighlight}
                            allowPickup={p.allowPickup}
                            allowShip={p.allowShip}
                            status={p.status}
                            stock={p.stock}
                        />
                    ))}
                </div>
        </div>
    );
}
