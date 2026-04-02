import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight, Package, X, Phone, MapPin, User, AlertCircle } from 'lucide-react';

export default function Orders() {
    const [myOrders, setMyOrders] = useState([]);
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [ratingOrderId, setRatingOrderId] = useState<number | null>(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingComment, setRatingComment] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [buyingRes, sellingRes] = await Promise.all([
                api.get('/orders/me'),
                api.get('/orders/incoming')
            ]);
            if (buyingRes.data.success) setMyOrders(buyingRes.data.data);
            if (sellingRes.data.success) setIncomingOrders(sellingRes.data.data);
        } catch (err) {
            console.error('Lỗi lấy danh sách đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpdateStatus = async (orderId: number, status: string) => {
        setActionLoading(true);
        try {
            const res = await api.put(`/orders/${orderId}/status`, { status });
                if (res.data.success) {
                    toast.success(`Đã cập nhật trạng thái: ${status}`);
                    fetchData();
                    if (selectedOrder?.id === orderId) {
                        setSelectedOrder({ ...selectedOrder, status });
                    }
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
            } finally {
            setActionLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        try {
            const res = await api.post('/ratings/create', { orderId: ratingOrderId, rating: ratingValue, comment: ratingComment });
            if (res.data.success) {
                toast.success('Cảm ơn bạn đã đánh giá!');
                setRatingOrderId(null); setRatingComment('');
                fetchData();
            }
        } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi gửi đánh giá'); }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const configs: any = {
            PENDING: { color: 'bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase', icon: Clock, text: 'Chờ xác nhận' },
            CONFIRMED: { color: 'bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase', icon: CheckCircle, text: 'Đã xác nhận' },
            SHIPPING: { color: 'bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase', icon: Truck, text: 'Đang giao hàng' },
            COMPLETED: { color: 'bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase', icon: CheckCircle, text: 'Giao thành công' },
            CANCELLED: { color: 'bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-[10px] uppercase', icon: XCircle, text: 'Đã hủy bỏ' },
        };
        const config = configs[status] || configs.PENDING;
        return <span className={`inline-flex items-center gap-1.5 ${config.color}`}>{config.text}</span>;
    };

    const ordersToShow = activeTab === 'buying' ? myOrders : incomingOrders;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 mb-20 relative min-h-[600px]">
            <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" /> Quản lý đơn hàng
            </h1>

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase">Đơn hàng #{selectedOrder.id}</h2>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Thời gian: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 no-scrollbar text-left">
                            {/* Product Info Card */}
                            <div className="flex gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <img src={selectedOrder.product?.images?.[0]} className="w-20 h-20 object-cover rounded-2xl shadow-sm" alt="" />
                                <div className="flex flex-col justify-center">
                                    <h3 className="font-bold text-slate-900 leading-tight mb-1 text-sm">{selectedOrder.product?.title}</h3>
                                    <div className="text-rose-600 font-black text-lg mb-1 leading-none py-1">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(selectedOrder.totalAmount))}
                                    </div>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                            </div>
                            
                            {/* Detailed Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-100 p-5 rounded-3xl">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User className="w-3 h-3" /> {activeTab === 'buying' ? 'Người bán' : 'Người mua'}</div>
                                        <div className="text-sm font-black text-slate-700">{activeTab === 'buying' ? selectedOrder.product?.seller?.fullName : selectedOrder.buyer?.fullName}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Số điện thoại</div>
                                        <div className="text-sm font-black text-slate-700">{selectedOrder.shippingPhone || 'Chưa cập nhật'}</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Địa chỉ giao nhận</div>
                                        <div className="text-sm font-black text-slate-700 leading-relaxed">{selectedOrder.shippingAddress || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.status === 'CANCELLED' && (
                                <div className="bg-rose-50 p-4 rounded-2xl flex gap-3 items-center border border-rose-100">
                                    <AlertCircle className="text-rose-500 w-5 h-5 shrink-0" />
                                    <p className="text-[11px] font-bold text-rose-600 uppercase tracking-tight">Đơn hàng này đã bị hủy. Mọi giao dịch tiền mặt (nếu có) vui lòng liên hệ admin hỗ trợ.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
                             {/* SELLER CONTROL FLOW */}
                            {activeTab === 'selling' && (
                                <>
                                    {selectedOrder.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')} disabled={actionLoading} className="flex-1 py-3.5 bg-white border border-rose-200 text-rose-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all">TỪ CHỐI</button>
                                            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')} disabled={actionLoading} className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">XÁC NHẬN ĐƠN</button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'CONFIRMED' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')} disabled={actionLoading} className="px-5 py-3.5 bg-white border border-slate-200 text-slate-400 font-bold rounded-2xl text-[10px] uppercase">Hủy đơn</button>
                                            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')} disabled={actionLoading} className="flex-grow py-3.5 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20">🚀 TIẾN HÀNH GIAO HÀNG</button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'SHIPPING' && (
                                        <button onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')} disabled={actionLoading} className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20">✅ GIAO HÀNG THÀNH CÔNG</button>
                                    )}
                                </>
                            )}

                             {/* BUYER CONTROL FLOW */}
                            {activeTab === 'buying' && selectedOrder.status === 'PENDING' && (
                                <button onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')} disabled={actionLoading} className="w-full py-3.5 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest">HỦY YÊU CẦU MUA</button>
                            )}

                            <button onClick={() => setSelectedOrder(null)} className="w-full mt-2 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest">Quay lại</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RATING MODAL */}
            {ratingOrderId && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-xl font-black text-slate-900 mb-6 text-center uppercase tracking-tight">Đánh giá sản phẩm</h2>
                        <div className="flex gap-2 mb-8 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRatingValue(star)} className={`text-4xl transition-all ${star <= ratingValue ? 'text-amber-400 scale-110' : 'text-slate-100 grayscale'}`}>★</button>
                            ))}
                        </div>
                        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 text-sm font-bold outline-none mb-8 min-h-[120px] focus:border-amber-200 transition-all" placeholder="Để lại lời nhắn cho người bán..." rows={4} value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setRatingOrderId(null)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase">Bỏ qua</button>
                            <button onClick={handleRatingSubmit} className="py-4 bg-amber-400 text-white font-black rounded-2xl text-xs uppercase shadow-lg shadow-amber-200">Gửi ngay</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-10 w-fit">
                <button onClick={() => setActiveTab('buying')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'buying' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>🛍️ Đơn đã mua</button>
                <button onClick={() => setActiveTab('selling')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'selling' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>📦 Đơn hàng đến</button>
            </div>

            {loading ? (
                <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)}</div>
            ) : ordersToShow.length === 0 ? (
                <div className="text-center py-32 bg-white border border-slate-100 rounded-[3rem] shadow-inner">
                    <Package className="w-24 h-24 text-slate-100 mx-auto mb-6" />
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Danh sách trống</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {ordersToShow.map((order: any) => (
                        <div key={order.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-50 shadow-sm shrink-0"><img src={order.product?.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /></div>
                                    <div className="text-left">
                                        <h3 className="font-black text-slate-900 leading-tight mb-2 uppercase text-sm">{order.product?.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-rose-600 font-black text-sm uppercase tracking-tighter">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.totalAmount))}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {activeTab === 'buying' ? `Shop: ${order.product?.seller?.fullName}` : `Khách: ${order.buyer?.fullName}`}
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        {activeTab === 'buying' && order.status === 'COMPLETED' && !order.rating && (
                                            <button onClick={() => setRatingOrderId(order.id)} className="px-5 py-3 bg-amber-400 text-white text-[10px] font-black rounded-xl uppercase shadow-lg shadow-amber-200 transition-all hover:-translate-y-1">Đánh giá</button>
                                        )}
                                        <button onClick={() => setSelectedOrder(order)} className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Chi tiết <ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
