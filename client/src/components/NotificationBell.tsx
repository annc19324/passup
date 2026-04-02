import { useState, useEffect, useRef } from 'react';
import { Bell, Package, Star, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import moment from 'moment';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            
            const socket = getSocket();
            socket.on("notification", (newNotif: any) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                // Có thể thêm âm thanh ở đây
            });

            return () => {
                socket.off("notification");
            };
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter((n: any) => !n.isRead).length);
            }
        } catch (err) {
            console.error('Lỗi lấy thông báo:', err);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Lỗi đánh dấu đã đọc:', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_NEW': return <Package className="w-4 h-4 text-blue-500" />;
            case 'ORDER_STATUS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'RATING_NEW': return <Star className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-900">Thông báo</h3>
                        <span className="text-xs font-bold text-blue-600">{unreadCount} tin mới</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-6 text-center italic text-slate-400 text-sm">
                                Bạn chưa có thông báo nào.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <Link 
                                        key={n.id}
                                        to={n.link || '#'}
                                        onClick={() => {
                                            if (!n.isRead) handleMarkAsRead(n.id);
                                            setShowDropdown(false);
                                        }}
                                        className={`flex items-start gap-4 p-4 hover:bg-blue-50/50 transition-colors ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                                    >
                                        <div className={`mt-1 p-2 rounded-xl shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</h4>
                                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-sm shadow-blue-500/50" />}
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1">{n.content}</p>
                                            <span className="text-[10px] font-medium text-slate-400 lowercase">{moment(n.createdAt).fromNow()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                        <Link to="/orders" className="block text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            Xem tất cả hoạt động
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
