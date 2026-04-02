import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { User, Camera, Save, Edit2, Loader2, Zap } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../data/locations';
import { toast } from 'react-hot-toast';

export default function Profile() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [orderCode, setOrderCode] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        addressDetail: ''
    });

    const [districts, setDistricts] = useState<any[]>([]);

    const fetchUserData = () => {
        api.get('/users/me')
            .then(res => {
                if (res.data.success) {
                    const u = res.data.data;
                    setUserData(u);
                    setForm({
                        fullName: u.fullName || '',
                        phone: u.phone || '',
                        address: u.address || '',
                        province: u.province || '',
                        district: u.district || '',
                        ward: u.ward || '',
                        addressDetail: u.addressDetail || ''
                    });

                    if (u.province) {
                        const prov = VIETNAM_PROVINCES.find(p => p.name === u.province);
                        if (prov) {
                            setDistricts(prov.districts);
                        }
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUserData(); }, []);

    const handleCheckPayment = async (code: number | null) => {
        if (!code) return;
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
            toast.dismiss(verifyingToast);
        }
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        const prov = VIETNAM_PROVINCES.find(p => p.name === provinceName);
        setForm({ ...form, province: provinceName, district: '', ward: '' });
        setDistricts(prov ? prov.districts : []);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtName = e.target.value;
        setForm({ ...form, district: districtName, ward: '' });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setUpdating(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => formData.append(key, val));
            if (fileInputRef.current?.files?.[0]) formData.append('avatar', fileInputRef.current.files[0]);

            const res = await api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                setUserData(res.data.data); setIsEdit(false);
                toast.success('Cập nhật thông tin thành công!');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err: any) { toast.error(err.response?.data?.message || 'Lỗi cập nhật'); } finally { setUpdating(false); }
    };

    if (loading) return <div className="flex justify-center items-center h-64 animate-pulse"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-32">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">
                <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
                    <button onClick={() => isEdit ? handleUpdate(null as any) : setIsEdit(true)} className="absolute right-8 -bottom-6 bg-white shadow-xl p-4 rounded-3xl text-blue-600 hover:scale-110 active:scale-95 transition-all z-10">
                        {isEdit ? <Save className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                    </button>
                    <div className="absolute left-40 bottom-4 flex gap-2 overflow-x-auto pr-8 no-scrollbar">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20 text-white text-xs font-bold whitespace-nowrap">
                             📈 {(userData?.pushCount || 0).toLocaleString()} Lượt đẩy tin
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20 text-white text-xs font-bold whitespace-nowrap">
                             📝 {(userData?.postLimit || 0).toLocaleString()} Lượt đăng tin
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-12">
                    <div className="flex flex-col sm:flex-row items-end gap-6 -mt-16 mb-10">
                        <div className="w-36 h-36 rounded-[2.2rem] border-8 border-white bg-slate-100 overflow-hidden shadow-2xl relative group">
                            {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-20 h-20" /></div>}
                            {isEdit && <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><Camera className="w-10 h-10" /></button>}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                        </div>
                        <div className="flex-grow pb-4">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{userData?.fullName}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${userData?.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : (userData?.subscriptionType !== 'FREE' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400')}`}>
                                {userData?.role === 'ADMIN' ? '🛡️ QUẢN TRỊ VIÊN' : (userData?.subscriptionType !== 'FREE' ? '⭐ Thành viên VIP' : 'Thành viên thường')}
                            </span>
                        </div>
                    </div>

                    {orderCode && (
                        <div className="bg-blue-50 p-4 rounded-2xl mb-8 flex items-center justify-between font-bold text-sm shadow-sm border border-blue-100 text-blue-600">
                             <span>Đơn hàng đang chờ thanh toán</span>
                             <button onClick={() => handleCheckPayment(orderCode)} className="flex items-center gap-1 text-xs underline">Xác nhận đơn #{orderCode}</button>
                        </div>
                    )}

                    {userData?.role !== 'ADMIN' && (
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between mb-8 group hover:bg-amber-50/30 hover:border-amber-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6 fill-current" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight">Nạp thêm lượt đẩy tin & đăng tin</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tiếp cận nhiều khách hàng hơn ngay hôm nay</p>
                                </div>
                            </div>
                            <Link to="/pricing" className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
                                Xem các gói
                            </Link>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                        <div className="space-y-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-2">Tên hiển thị</label>
                            <input type="text" disabled={!isEdit} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={`w-full p-4 rounded-2xl border ${isEdit ? 'border-blue-200 bg-white' : 'bg-slate-50 border-transparent text-slate-600'}`} />
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-2">Số điện thoại</label>
                            <input type="text" disabled={!isEdit} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`w-full p-4 rounded-2xl border ${isEdit ? 'border-blue-200 bg-white' : 'bg-slate-50 border-transparent text-slate-600'}`} />
                        </div>
                        <div className="space-y-6">
                            <label className="block text-xs font-bold text-slate-500 mb-2 ml-2">Địa chỉ giao dịch</label>
                            {isEdit ? (
                                <div className="space-y-4">
                                    <select value={form.province} onChange={handleProvinceChange} className="w-full p-4 rounded-2xl border border-blue-200 text-xs font-bold"><option value="">Tỉnh/Thành</option>{VIETNAM_PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
                                    <select value={form.district} onChange={handleDistrictChange} disabled={!form.province} className="w-full p-4 rounded-2xl border border-blue-200 text-xs font-bold"><option value="">Quận/Huyện</option>{districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</select>
                                    <input type="text" placeholder="Số nhà, đường..." value={form.addressDetail} onChange={(e) => setForm({ ...form, addressDetail: e.target.value })} className="w-full p-4 rounded-2xl border border-blue-200 text-xs font-bold" />
                                </div>
                            ) : (<div className="w-full p-4 rounded-2xl bg-slate-50 text-slate-600 text-xs font-bold">{userData?.address || 'Chưa cập nhật địa chỉ'}</div>)}
                        </div>
                        {isEdit && <button type="submit" disabled={updating} className="md:col-span-2 w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 shadow-xl">{updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />} CẬP NHẬT THÔNG TIN</button>}
                    </form>
                </div>
            </div>
        </div>
    );
}
