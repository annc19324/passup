import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    LayoutDashboard, Package, Users, AlertTriangle, 
    TrendingUp, ShoppingCart, DollarSign,
    Trash2, ShieldCheck, Loader2, ArrowRight,
    Palette, Plus, Image as ImageIcon, Briefcase, Search, Edit2, XCircle, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import moment from 'moment';

export default function Admin() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'users' | 'reports' | 'backgrounds' | 'categories' | 'orders' | 'settings'>('stats');
    const [stats, setStats] = useState<any>(null);
    const [dataList, setDataList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // System States
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowReg, setAllowReg] = useState(true);

    // Form cho backgrounds
    const [newOption, setNewOption] = useState({ name: '', value: '', type: 'COLOR' });
    const [bgFile, setBgFile] = useState<File | null>(null);
    const [globalBg, setGlobalBg] = useState('');

    // Form cho Categories
    const [newCatName, setNewCatName] = useState('');

    // User Edit Modal
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({ pushCount: 0, postLimit: 0, fullName: '', role: 'USER' });

    // Bảo vệ Route phía Client
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'stats') {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } else if (activeTab === 'products') {
                const res = await api.get('/admin/products');
                setDataList(res.data.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setDataList(res.data.data);
            } else if (activeTab === 'orders') {
                const res = await api.get('/admin/orders');
                setDataList(res.data.data);
            } else if (activeTab === 'reports') {
                const res = await api.get('/reports/all');
                setDataList(res.data.data);
            } else if (activeTab === 'backgrounds') {
                const [optionsRes, settingsRes] = await Promise.all([
                    api.get('/settings/background-options'),
                    api.get('/settings')
                ]);
                setDataList(optionsRes.data.data);
                setGlobalBg(settingsRes.data.data.GLOBAL_BACKGROUND || '');
            } else if (activeTab === 'categories') {
                const res = await api.get('/categories?admin=true');
                setDataList(res.data.data);
            } else if (activeTab === 'settings') {
                const res = await api.get('/settings');
                const s = res.data.data;
                setMaintenanceMode(s.MAINTENANCE_MODE === 'true');
                setAllowReg(s.ALLOW_REGISTRATION !== 'false');
            }
        } catch (err) {
            console.error('Lỗi lấy dữ liệu admin:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReport = async (id: number, status: string, action?: string, targetId?: number, targetType?: string) => {
        try {
            await api.put(`/admin/reports/${id}`, { status, action, targetId, targetType });
            fetchData();
        } catch (err) {
            toast.error('Lỗi cập nhật báo cáo');
        }
    };

    const handleAddBgOption = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (newOption.type === 'IMAGE' && !bgFile && !newOption.value) {
                return toast.error('Vui lòng chọn ảnh hoặc dán link');
            }

            const formData = new FormData();
            formData.append('name', newOption.name);
            formData.append('type', newOption.type);
            
            if (bgFile) {
                formData.append('image', bgFile);
            } else {
                formData.append('value', newOption.value);
            }

            await api.post('/settings/background-options', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewOption({ name: '', value: '', type: 'COLOR' });
            setBgFile(null);
            fetchData();
        } catch (err) {
            toast.error('Lỗi thêm tùy chọn hình nền');
        }
    };

    const handleDeleteBgOption = async (id: number) => {
        try {
            await api.delete(`/settings/background-options/${id}`);
            toast.success('Đã xóa tùy chọn hình nền');
            fetchData();
        } catch (err) {
            toast.error('Lỗi xóa');
        }
    };

    const handleUpdateGlobalBg = async (e: any) => {
        try {
            const formData = new FormData();
            formData.append('key', 'GLOBAL_BACKGROUND');
            
            const file = e.target.files?.[0];
            if (file) {
                formData.append('image', file);
            } else {
                formData.append('value', globalBg);
            }

            const res = await api.post('/settings/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (file) {
                setGlobalBg(res.data.data.value);
            }
            toast.success('Đã cập nhật hình nền hệ thống');
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: newCatName });
            setNewCatName('');
            fetchData();
        } catch (err) {
            toast.error('Lỗi thêm danh mục');
        }
    };

    const toggleCatStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.put(`/categories/${id}`, { isActive: !currentStatus });
            fetchData();
        } catch (err) {
            toast.error('Lỗi cập nhật');
        }
    };

    const deleteCat = async (id: number) => {
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Đã xóa danh mục');
            fetchData();
        } catch (err) {
            toast.error('Lỗi xóa danh mục');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleUpdateSetting = async (key: string, value: string) => {
        try {
            await api.post('/admin/settings/generic', { key, value });
            toast.success('Đã cập nhật: ' + key);
        } catch (err) {
            toast.error('Lỗi cập nhật cài đặt');
        }
    };


    const handleUpdateOrderAdmin = async (id: number, status: string) => {
        try {
            await api.put(`/admin/orders/${id}`, { status });
            fetchData();
        } catch (err) {
            toast.error('Lỗi cập nhật trạng thái đơn hàng');
        }
    };

    const handleUpdateUserAdmin = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            await api.put(`/admin/users/${editingUser.id}`, userForm);
            toast.success('Đã cập nhật thông tin người dùng');
            setEditingUser(null);
            fetchData();
        } catch (err) {
            toast.error('Lỗi cập nhật người dùng');
        }
    };

    const toggleLockUser = async (u: any) => {
        if (u.id === user.id) return toast.error('Không thể tự khóa mình');
        const newStatus = u.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
        try {
            await api.put(`/admin/users/${u.id}`, { status: newStatus });
            toast.success(newStatus === 'BANNED' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
            fetchData();
        } catch (err) {
            toast.error('Lỗi thao tác');
        }
    };

    const sidebarItems = [
        { id: 'stats', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'categories', label: 'Danh mục', icon: Briefcase },
        { id: 'backgrounds', label: 'Cấu hình nền', icon: Palette },
        { id: 'products', label: 'Tin đăng', icon: Package },
        { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'reports', label: 'Báo cáo', icon: AlertTriangle },
        { id: 'settings', label: 'Cài đặt', icon: TrendingUp },
    ];

    const filteredData = Array.isArray(dataList) ? dataList.filter(item => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        if (activeTab === 'users') return item.fullName?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s);
        if (activeTab === 'products') return item.title?.toLowerCase().includes(s) || item.seller?.fullName?.toLowerCase().includes(s);
        if (activeTab === 'orders') return item.id.toString().includes(s) || item.buyer?.fullName?.toLowerCase().includes(s) || item.product?.title?.toLowerCase().includes(s);
        if (activeTab === 'reports') return item.reason?.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s);
        return true;
    }) : [];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar Admin */}
            <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 space-y-2 flex-shrink-0 sticky top-0 h-fit md:h-screen">
                <div className="mb-10 px-2 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-blue-600 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6" /> PassUp
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Admin Portal</p>
                    </div>
                </div>
                
                <div className="space-y-1">
                    {sidebarItems.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                    <div className="border-t border-slate-100 my-4 pt-4">
                        <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 text-sm transition-all">
                            <ArrowRight className="w-5 h-5 text-slate-400 rotate-180" /> Quay lại Web
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 overflow-y-auto">
                {activeTab === 'stats' && stats && (
                    <div className="space-y-8">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Bảng điều khiển</h1>
                            <p className="text-slate-500 font-medium">Theo dõi hoạt động của hệ thống thời gian thực.</p>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Người dùng', value: stats.totalUsers, color: 'blue', icon: Users },
                                { label: 'Sản phẩm', value: stats.totalProducts, color: 'emerald', icon: Package },
                                { label: 'Đơn hàng', value: stats.totalOrders, color: 'orange', icon: ShoppingCart },
                                { label: 'Báo cáo mới', value: stats.totalReports, color: 'rose', icon: AlertTriangle },
                            ].map(card => (
                                <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600 w-fit mb-4`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 mb-1">{card.value}</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">{card.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Tổng doanh thu toàn sàn</div>
                                <div className="text-5xl font-black mb-4">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                                </div>
                                <p className="text-indigo-200 max-w-md text-sm leading-relaxed italic opacity-80">
                                    Doanh thu được tính dựa trên các đơn hàng đã nhận hàng thành công (COMPLETED).
                                </p>
                            </div>
                            <DollarSign className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12" />
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-8">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Quản lý Danh mục</h1>
                            <p className="text-slate-500 font-medium">Thêm, sửa hoặc ẩn các danh mục sản phẩm trên sàn.</p>
                        </header>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm max-w-md text-left">
                            <h3 className="text-lg font-black text-slate-800 mb-4">Thêm danh mục mới</h3>
                            <form onSubmit={handleAddCategory} className="flex gap-2">
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Tên danh mục (ví dụ: Đồ gia dụng)"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="flex-grow p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-500 transition-all"
                                />
                                <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tên danh mục</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Slug (SEO)</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dataList.map((cat: any) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-400">#{cat.id}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">{cat.slug}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleCatStatus(cat.id, cat.isActive)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cat.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                                                >
                                                    {cat.isActive ? 'Đang hiện' : 'Đang ẩn'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => deleteCat(cat.id)}
                                                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'backgrounds' && (
                    <div className="space-y-8">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Quản lý Hình nền</h1>
                            <p className="text-slate-500 font-medium">Cài đặt hình nền mặc định và các tùy chọn cho người dùng.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Cài đặt toàn cục */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 text-left">
                                <h3 className="text-lg font-black text-slate-800">Hình nền mặc định (Toàn bộ web)</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <input 
                                            type="text" 
                                            value={globalBg}
                                            onChange={(e) => setGlobalBg(e.target.value)}
                                            placeholder="Màu (hex) hoặc Link ảnh..."
                                            className="flex-grow p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-blue-500 transition-all font-mono text-sm"
                                        />
                                        <button 
                                            onClick={() => handleUpdateGlobalBg({ target: { value: globalBg }})}
                                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="flex-grow p-3 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                                            <ImageIcon className="w-4 h-4" /> Tải ảnh lên cho nền chung
                                            <input type="file" className="hidden" accept="image/*" onChange={handleUpdateGlobalBg} />
                                        </label>
                                    </div>
                                </div>
                                <div className="w-full h-32 rounded-xl border border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                                    <div className="w-full h-full" style={{ background: globalBg.includes('http') || globalBg.includes('cloudinary') ? `url(${globalBg}) center/cover` : globalBg }}>
                                        {!globalBg && <p className="text-slate-400 text-sm">Xem trước</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Thêm tùy chọn mới */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-left">
                                <h3 className="text-lg font-black text-slate-800 mb-4">Thêm lựa chọn mới</h3>
                                <form onSubmit={handleAddBgOption} className="space-y-4">
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Tên (ví dụ: Màu xanh, Background Galaxy)"
                                        value={newOption.name}
                                        onChange={(e) => setNewOption({...newOption, name: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100"
                                    />
                                    {newOption.type === 'COLOR' ? (
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Giá trị (Hex code)"
                                            value={newOption.value}
                                            onChange={(e) => setNewOption({...newOption, value: e.target.value})}
                                            className="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 font-mono"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                                                <ImageIcon className="w-4 h-4" /> 
                                                {bgFile ? bgFile.name : 'Chọn ảnh tải lên'}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={(e) => setBgFile(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            <p className="text-[10px] text-slate-400 font-bold italic">Lưu ý: Bạn vẫn có thể dán Link ảnh vào ô dưới nếu thích</p>
                                            <input 
                                                type="text" 
                                                placeholder="Hoặc dán link ảnh trực tiếp"
                                                value={newOption.value}
                                                onChange={(e) => setNewOption({...newOption, value: e.target.value})}
                                                className="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 font-mono text-xs"
                                            />
                                        </div>
                                    )}
                                    <select 
                                        value={newOption.type}
                                        onChange={(e) => setNewOption({...newOption, type: e.target.value, value: ''})}
                                        className="w-full p-3 bg-slate-50 rounded-xl outline-none border border-slate-100 font-bold text-slate-600"
                                    >
                                        <option value="COLOR">Màu sắc</option>
                                        <option value="IMAGE">Hình ảnh</option>
                                    </select>
                                    <button className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                                        <Plus className="w-5 h-5" /> THÊM TÙY CHỌN
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Danh sách các tùy chọn */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h3 className="font-black text-slate-800">Danh sách các lựa chọn hiện có</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                                {dataList.map((bg: any) => (
                                    <div key={bg.id} className="group relative bg-slate-50 rounded-2xl p-2 border border-slate-100 hover:border-blue-500 transition-all">
                                        <div 
                                            className="w-full aspect-video rounded-xl border border-slate-200 mb-2" 
                                            style={{ background: bg.type === 'IMAGE' ? `url(${bg.value}) center/cover` : bg.value }}
                                        />
                                        <div className="text-[10px] font-black uppercase text-slate-600 line-clamp-1 px-1">{bg.name}</div>
                                        <button 
                                            onClick={() => handleDeleteBgOption(bg.id)}
                                            className="absolute top-1 right-1 p-1 bg-white/80 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'stats' && activeTab !== 'backgrounds' && activeTab !== 'categories' && (
                    <div className="space-y-6">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h1 className="text-3xl font-black text-slate-900 capitalize text-left">
                                {activeTab === 'reports' ? 'Báo cáo vi phạm' : activeTab === 'products' ? 'Sản phẩm' : activeTab === 'users' ? 'Người dùng' : activeTab === 'orders' ? 'Tất cả Đơn hàng' : ''}
                            </h1>
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-grow md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm shadow-sm"
                                    />
                                </div>
                                <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                                    Làm mới
                                </button>
                            </div>
                        </header>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Thông tin</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    {activeTab === 'products' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                                                <img src={item.images?.[0]} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                                                                <div className="text-xs text-slate-500">Bởi: {item.seller?.fullName}</div>
                                                                <div className="text-[10px] uppercase font-black text-indigo-500">{item.status}</div>
                                                            </div>
                                                        </div>
                                                    ) : activeTab === 'users' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                                {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 m-auto mt-2 text-slate-300" />}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-bold text-slate-900">{item.fullName}</div>
                                                                <div className="text-xs text-slate-500">{item.email}</div>
                                                                <div className="flex gap-2 items-center mt-1">
                                                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-blue-100">
                                                                        🚀 {item.pushCount} lần đẩy
                                                                    </div>
                                                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-emerald-100">
                                                                        📝 {item.postLimit} bài đăng
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] font-black uppercase text-indigo-500 mt-1">{item.role}</div>
                                                            </div>
                                                        </div>
                                                    ) : activeTab === 'orders' ? (
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900 mb-1">Đơn #{item.id} - {item.product?.title}</div>
                                                            <div className="text-xs text-slate-500 flex flex-col gap-0.5">
                                                                <span>Người mua: {item.buyer?.fullName} ({item.buyer?.email})</span>
                                                                <span>Người bán: {item.product?.seller?.fullName}</span>
                                                                <span className="font-bold text-slate-800">Tổng: {new Intl.NumberFormat('vi-VN').format(item.totalAmount)}đ</span>
                                                            </div>
                                                            <div className="mt-2 flex gap-1">
                                                                <select 
                                                                    value={item.status} 
                                                                    onChange={(e) => handleUpdateOrderAdmin(item.id, e.target.value)}
                                                                    className="text-[10px] font-bold p-1 border rounded bg-slate-50"
                                                                >
                                                                    <option value="PENDING">PENDING</option>
                                                                    <option value="CONFIRMED">CONFIRMED</option>
                                                                    <option value="SHIPPING">SHIPPING</option>
                                                                    <option value="COMPLETED">COMPLETED</option>
                                                                    <option value="CANCELLED">CANCELLED</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ) : false ? (
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900">{item.user?.fullName}</div>
                                                            <div className="text-xs text-slate-500">{item.user?.email}</div>
                                                            <div className="text-lg font-black text-indigo-600 mt-1">
                                                                {new Intl.NumberFormat('vi-VN').format(item.amount)}đ
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900">{item.reason}</div>
                                                            <div className="text-xs text-slate-500">Mô tả: {item.description || 'Không có'}</div>
                                                            <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">Loại: {item.targetType} (ID: {item.targetId})</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        item.status === 'AVAILABLE' || item.status === 'ACTIVE' || item.status === 'RESOLVED' || item.status === 'COMPLETED'
                                                            ? 'bg-emerald-50 text-emerald-600' 
                                                            : item.status === 'PENDING' || item.status === 'RESERVED' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-500">
                                                    {moment(item.createdAt).format('DD/MM/YYYY')}
                                                </td>
                                                <td className="px-6 py-5 text-right space-x-2">
                                                    {activeTab === 'reports' && item.status === 'PENDING' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleUpdateReport(item.id, 'RESOLVED', item.targetType === 'PRODUCT' ? 'DEACTIVATE' : 'BAN', item.targetId, item.targetType)}
                                                                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700"
                                                                title="Xử lý (Gỡ bài/Ban user)"
                                                            >
                                                                <ShieldCheck className="w-3 h-3" /> XỬ LÝ
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateReport(item.id, 'DISMISSED')}
                                                                className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-slate-300"
                                                                title="Bỏ qua"
                                                            >
                                                                <XCircle className="w-3 h-3 m-auto" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {activeTab === 'products' && (
                                                        <>
                                                            <button 
                                                                onClick={async () => {
                                                                    await api.put(`/admin/products/${item.id}`, { isHighlight: !item.isHighlight });
                                                                    fetchData();
                                                                }}
                                                                className={`p-2 rounded-xl transition-all ${item.isHighlight ? 'text-orange-500 bg-orange-50' : 'text-slate-400 hover:text-orange-400'}`}
                                                                title={item.isHighlight ? "Gỡ nổi bật" : "Đặt nổi bật"}
                                                            >
                                                                <TrendingUp className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={async () => {
                                                                    await api.delete(`/admin/products/${item.id}`);
                                                                    toast.success('Đã xóa sản phẩm vĩnh viễn');
                                                                    fetchData();
                                                                }}
                                                                className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                                                                title="Xóa vĩnh viễn"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                            <Link to={`/product/${item.id}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl inline-block transition-all">
                                                                <ArrowRight className="w-5 h-5" />
                                                            </Link>
                                                        </>
                                                    )}
                                                    {activeTab === 'users' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={async () => {
                                                                    if (item.id === user.id) {
                                                                        toast.error('Không thể tự đổi quyền của chính mình');
                                                                        return;
                                                                    }
                                                                    await api.put(`/admin/users/${item.id}`, { role: item.role === 'ADMIN' ? 'USER' : 'ADMIN' });
                                                                    toast.success('Đã cập nhật quyền người dùng');
                                                                    fetchData();
                                                                }}
                                                                className={`p-2 rounded-xl transition-all ${item.role === 'ADMIN' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-500'}`}
                                                                title={item.role === 'ADMIN' ? "Gỡ Admin" : "Cấp quyền Admin"}
                                                            >
                                                                <ShieldCheck className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleLockUser(item)}
                                                                className={`p-2 rounded-xl transition-all ${item.status === 'BANNED' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-500'}`}
                                                                title={item.status === 'BANNED' ? "Bỏ khóa" : "Khóa người dùng"}
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingUser(item);
                                                                    setUserForm({
                                                                        pushCount: item.pushCount,
                                                                        postLimit: item.postLimit,
                                                                        fullName: item.fullName,
                                                                        role: item.role
                                                                    });
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Chỉnh sửa người dùng"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {activeTab === 'orders' && (
                                                        <div className="flex justify-end gap-2 text-xs font-bold text-slate-400">
                                                            Quản trị viên có quyền ghi đè trạng thái
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {dataList.length === 0 && !loading && (
                                    <div className="py-20 text-center italic text-slate-400">Không có dữ liệu hiển thị.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="space-y-8 max-w-4xl text-left">
                        <header>
                            <h1 className="text-3xl font-black text-slate-900">Cài đặt chung</h1>
                            <p className="text-slate-500 font-medium">Cấu hình thông tin cơ bản và trạng thái của toàn bộ hệ thống.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Trạng thái hệ thống
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <div className="font-bold text-slate-900">Chế độ bảo trì</div>
                                            <div className="text-xs text-slate-400">Tạm khóa toàn bộ website</div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newVal = !maintenanceMode;
                                                setMaintenanceMode(newVal);
                                                handleUpdateSetting('MAINTENANCE_MODE', String(newVal));
                                            }}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${maintenanceMode ? 'bg-orange-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <div className="font-bold text-slate-900">Đăng ký người dùng</div>
                                            <div className="text-xs text-slate-400">Cho phép người dùng mới đăng ký</div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newVal = !allowReg;
                                                setAllowReg(newVal);
                                                handleUpdateSetting('ALLOW_REGISTRATION', String(newVal));
                                            }}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${allowReg ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${allowReg ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {/* Modal chỉnh sửa người dùng */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200 border border-white/20">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-none">Chỉnh sửa người dùng</h3>
                                    <p className="text-[10px] opacity-70 mt-1 font-bold">ID: {editingUser.id} • {editingUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUserAdmin} className="p-6 space-y-5 bg-slate-50/50">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Họ và tên</label>
                                    <input 
                                        type="text" 
                                        value={userForm.fullName} 
                                        onChange={e => setUserForm({...userForm, fullName: e.target.value})}
                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white outline-none font-bold shadow-sm transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">🚀 Lượt đẩy</label>
                                        <input 
                                            type="number" 
                                            value={userForm.pushCount} 
                                            onChange={e => setUserForm({...userForm, pushCount: Number(e.target.value)})}
                                            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white outline-none font-bold shadow-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">📝 Hạn mức tin</label>
                                        <input 
                                            type="number" 
                                            value={userForm.postLimit} 
                                            onChange={e => setUserForm({...userForm, postLimit: Number(e.target.value)})}
                                            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white outline-none font-bold shadow-sm transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Vai trò</label>
                                    <select 
                                        value={userForm.role}
                                        onChange={e => setUserForm({...userForm, role: e.target.value})}
                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white outline-none font-bold shadow-sm transition-all cursor-pointer"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm">
                                    CẬP NHẬT NGAY
                                </button>
                                <button type="button" onClick={() => setEditingUser(null)} className="w-full mt-3 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs">
                                    HỦY BỎ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
