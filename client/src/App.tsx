import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Sell from './pages/Sell';
import ProductDetail from './pages/ProductDetail';
import MyProducts from './pages/MyProducts';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import EditProduct from './pages/EditProduct';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import SellerProfile from './pages/SellerProfile';
import Admin from './pages/Admin';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import BottomNav from './components/BottomNav';
import NotificationBell from './components/NotificationBell';
import { useAuth } from './context/AuthContext';
import { Zap, ChevronDown, User, LogOut, Package, Heart, MessageSquare, ShieldCheck, Key } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import logo from './assets/passuplogo.png';
import './App.css';

import { getSocket, disconnectSocket } from './services/socket';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isProductPage = location.pathname.startsWith('/product/');

  useEffect(() => {
    if (user) {
      const socket = getSocket();
      socket.emit('join', user.id.toString());
    } else {
      disconnectSocket();
    }
  }, [user]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'rounded-[1.5rem] font-bold text-sm border border-slate-100 shadow-2xl',
        }}
      />
      <header className="flex justify-between items-center bg-white border-b border-slate-100 px-4 md:px-8 py-2 md:py-3 sticky top-0 z-50 shadow-sm transition-all">
        <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
                <img src={logo} alt="PassUp" className="w-8 h-8 md:w-10 md:h-10 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter hidden sm:block">PassUp</span>
            </Link>
            
            {user && (
                <Link to="/pricing" className="hidden md:flex items-center gap-1.5 bg-amber-50 text-amber-600 text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-200/50 shadow-sm shadow-amber-500/10">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Nạp lượt
                </Link>
            )}
        </div>

        <nav className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="hidden lg:flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-xl transition-all">
                    <ShieldCheck className="w-4 h-4" />
                    Quản trị
                </Link>
              )}
              
              <Link to="/sell" className="btn-primary py-2.5 px-6 text-sm bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 font-black border-none rounded-xl hidden md:flex items-center gap-2">
                ĐĂNG BÁN
              </Link>

              <div className="flex items-center gap-1 md:gap-3 ml-2 border-l border-slate-100 pl-4">
                  <NotificationBell />
                  
                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all duration-300 ${isDropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                      >
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black border-2 border-white shadow-sm overflow-hidden">
                              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0)}
                          </div>
                          <div className="hidden md:block text-left mr-1">
                              <p className="text-xs font-black text-slate-900 leading-none">{user.fullName.split(' ').pop()}</p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                          <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                               <div className="px-4 py-4 mb-2 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl">
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 line-clamp-1">{user.fullName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 italic">Thành viên PassUp</p>
                                        </div>
                                    </div>
                               </div>

                               <div className="space-y-1 px-2">
                                   <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold text-sm">
                                       <User className="w-4 h-4" /> Thông tin cá nhân
                                   </Link>
                                   <Link to="/change-password" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-all font-bold text-sm">
                                       <Key className="w-4 h-4" /> Đổi mật khẩu
                                   </Link>
                                   <div className="md:hidden">
                                       <Link to="/sell" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold text-sm">
                                           <Zap className="w-4 h-4" /> Nạp lượt & Đăng tin
                                       </Link>
                                   </div>
                                   <hr className="my-2 border-slate-50 mx-4" />
                                   <Link to="/chat" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                                       <MessageSquare className="w-4 h-4" /> Tin nhắn
                                   </Link>
                                   <Link to="/my-products" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                                       <Package className="w-4 h-4" /> Quản lý tin đăng
                                   </Link>
                                   <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                                       <ShieldCheck className="w-4 h-4" /> Lịch sử đơn hàng
                                   </Link>
                                   <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                                       <Heart className="w-4 h-4" /> Đã yêu thích
                                   </Link>
                                   <hr className="my-2 border-slate-50 mx-4" />
                                   <button 
                                      onClick={handleLogout}
                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-sm"
                                    >
                                       <LogOut className="w-4 h-4" /> Đăng xuất
                                   </button>
                               </div>
                          </div>
                      )}
                  </div>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-5 py-2.5 rounded-xl font-black text-sm text-slate-600 hover:bg-slate-100 transition-all">Đăng nhập</Link>
              <Link to="/register" className="px-5 py-2.5 rounded-xl font-black text-sm bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all">Bắt đầu ngay</Link>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-grow pb-16 md:pb-0">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      {!isProductPage && <BottomNav />}
    </div>
  )
}

export default App
