import { useState } from 'react';
import { Heart, MapPin, Clock, XCircle, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import 'moment/locale/vi';

moment.locale('vi');

export default function ProductCard({ 
    title, price, location, province, district, time, image, 
    productSlug, productId, initialIsWishlisted = false, isHighlight = false, 
    allowPickup = true, allowShip = false, status = 'AVAILABLE', stock = 1
}: { 
    title: string, price: string, location?: string, province?: string, district?: string, 
    time: string, image: string, productSlug: string, productId: number, 
    initialIsWishlisted?: boolean, isHighlight?: boolean, allowPickup?: boolean, allowShip?: boolean,
    status?: string, stock?: number
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(initialIsWishlisted);
    const [loading, setLoading] = useState(false);

    const timeAgo = moment(time).fromNow();
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/wishlist/toggle', { productId });
            if (res.data.success) {
                setIsLiked(res.data.data.isWishlisted);
            }
        } catch (err) {
            console.error('Lỗi toggle wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const isSoldOut = status === 'SOLD' || stock <= 0;

    return (
        <div className={`group relative bg-white flex flex-col h-full overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(255,191,0,0.15)] transition-all border-2 ${isHighlight ? 'border-amber-400 animate-pulse-subtle' : 'border-slate-100'} rounded-[1.5rem] w-full transform hover:-translate-y-1 duration-300`}>
            
            {isHighlight && (
                <div className="absolute -top-4 -right-12 bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-900 text-[9px] font-black px-12 py-6 rotate-45 uppercase text-center tracking-widest flex items-center justify-center gap-1 shadow-xl z-50 border-b-2 border-amber-300 pointer-events-none">
                    ⭐
                </div>
            )}

            <div className="relative aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden">
                <img
                    src={image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop"}
                    alt={title}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out ${isSoldOut ? 'grayscale-[0.5] opacity-80' : ''}`}
                />
                
                {isHighlight && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                )}

                {/* SOLD BADGE */}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-3 z-20 animate-in fade-in duration-300">
                        <div className="bg-white text-slate-900 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl border-2 border-white rotate-12 flex items-center gap-2 scale-110">
                            <XCircle className="w-4 h-4 text-rose-500" /> ĐÃ BÁN
                        </div>
                    </div>
                )}

                {/* Shipping Overlay */}
                {!isSoldOut && (
                    <div className="absolute bottom-1.5 left-1.5 flex gap-1 z-10">
                        {allowPickup && <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-lg text-[9px] shadow-sm font-bold border border-slate-100 uppercase tracking-tighter text-slate-700">🏠 Lấy</span>}
                        {allowShip && <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-lg text-[9px] shadow-sm font-bold border border-slate-100 uppercase tracking-tighter text-slate-700">🚚 Giao</span>}
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <button
                        onClick={handleLike}
                        disabled={loading}
                        className={`p-1.5 rounded-full shadow-sm transition-all active:scale-95 ${isLiked ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur text-slate-400 hover:text-rose-500 hover:bg-white'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            <div className={`p-2 md:p-2.5 flex flex-col flex-grow ${isSoldOut ? 'bg-slate-50/50' : ''}`}>
                <h3 className={`text-sm font-bold line-clamp-2 leading-tight mb-1 h-9 ${isHighlight ? 'text-amber-900' : 'text-slate-800'}`}>
                    <Link to={`/product/${productSlug}`} className={`hover:text-blue-600 transition-colors after:absolute after:inset-0 ${isSoldOut ? 'pointer-events-none' : ''}`}>
                        {isHighlight && <Star className="inline-block w-3 h-3 text-amber-500 fill-current mr-1 mb-0.5" />}
                        {title}
                    </Link>
                </h3>

                <div className={`text-base font-black ${isSoldOut ? 'text-slate-400' : 'text-rose-600'} mb-1`}>
                    {formattedPrice}
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-auto border-t border-slate-100 pt-1.5">
                    <div className="flex items-center gap-1 truncate max-w-[75%] font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> 
                        <span className="truncate">
                            {district ? `${district}, ` : ''}{province || location || 'Toàn quốc'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {timeAgo}
                    </div>
                </div>
            </div>
        </div>
    );
}
