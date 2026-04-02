import { Home, PlusCircle, MessageCircle, User, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const { user } = useAuth();
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <NavLink 
                to="/" 
                className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
            >
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-bold">Trang chủ</span>
            </NavLink>

            <NavLink 
                to="/pricing" 
                className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'} ${user?.role === 'ADMIN' ? 'hidden' : ''}`}
            >
                <Zap className="w-6 h-6" />
                <span className="text-[10px] font-bold">Nạp lượt</span>
            </NavLink>

            <NavLink 
                to="/sell" 
                className="flex flex-col items-center gap-1 p-2 bg-blue-600 text-white rounded-full -mt-10 shadow-lg shadow-blue-500/40 border-4 border-white active:scale-95 transition-transform"
            >
                <PlusCircle className="w-8 h-8" />
            </NavLink>

            <NavLink 
                to="/chat" 
                className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="text-[10px] font-bold">Tin nhắn</span>
            </NavLink>

            <NavLink 
                to="/profile" 
                className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
            >
                <User className="w-6 h-6" />
                <span className="text-[10px] font-bold">Tôi</span>
            </NavLink>
        </nav>
    );
}
