import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Package, Tag, Loader2, Save, X, MapPin, ChevronDown } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../data/locations';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        status: 'AVAILABLE',
        province: '',
        district: '',
        ward: '',
        addressDetail: '',
        stock: 1
    });

    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                if (res.data.success) {
                    const p = res.data.data;
                    setForm({
                        title: p.title,
                        description: p.description,
                        price: p.price.toString(),
                        status: p.status,
                        province: p.province || '',
                        district: p.district || '',
                        ward: p.ward || '',
                        addressDetail: p.addressDetail || '',
                        stock: p.stock || 1
                    });

                    // Cấu hình lại list quận huyện phường
                    if (p.province) {
                        const prov = VIETNAM_PROVINCES.find(item => item.name === p.province);
                        if (prov) {
                            setDistricts(prov.districts);
                            const dist = prov.districts.find((d: any) => d.name === p.district);
                            if (dist) setWards(dist.wards);
                        }
                    }
                }
            } catch (err) {
                toast.error('Không tìm thấy sản phẩm');
                navigate('/my-products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        const prov = VIETNAM_PROVINCES.find(p => p.name === provinceName);
        setForm({ ...form, province: provinceName, district: '', ward: '' });
        setDistricts(prov ? prov.districts : []);
        setWards([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtName = e.target.value;
        const dist = districts.find(d => d.name === districtName);
        setForm({ ...form, district: districtName, ward: '' });
        setWards(dist ? dist.wards : []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const res = await api.put(`/products/${id}`, {
                ...form,
                price: parseFloat(form.price)
            });

            if (res.data.success) {
                toast.success('Cập nhật tin đăng thành công!');
                navigate(`/product/${id}`);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi cập nhật');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 mb-20">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white relative">
                    <h1 className="text-xl font-black mb-1 flex items-center gap-3">
                        <Save className="w-5 h-5 text-blue-400" /> Chỉnh sửa tin đăng
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Mã sản phẩm: #{id}</p>
                    <button onClick={() => navigate('/my-products')} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <h2 className="font-black text-slate-800 uppercase text-[11px] tracking-wide">Thông tin chi tiết</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tiêu đề tin đăng *</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-700 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mô tả sản phẩm *</label>
                                <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-700 text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-rose-500">Giá bán (VNĐ) *</label>
                                <div className="relative">
                                    <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all pl-11 font-black text-rose-600 text-sm" />
                                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Trạng thái bán</label>
                                <select className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all font-black text-slate-700 text-xs" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="AVAILABLE">✅ Đang bán</option>
                                    <option value="RESERVED">⏸️ Đã đặt gạch</option>
                                    <option value="SOLD">❌ Đã bán</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số lượng</label>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, stock: Math.max(0, Number(form.stock) - 1) })} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-lg border border-slate-100 hover:bg-slate-100 transition-colors">-</button>
                                    <span className="text-base font-black min-w-[30px] text-center">{form.stock}</span>
                                    <button type="button" onClick={() => setForm({ ...form, stock: Number(form.stock) + 1 })} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-lg border border-slate-100 hover:bg-slate-100 transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <h2 className="font-black text-slate-800 uppercase text-[11px] tracking-wide">Địa điểm giao dịch</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Tỉnh/Thành</label>
                                <select value={form.province} onChange={handleProvinceChange} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none appearance-none font-bold text-[11px]">
                                    <option value="">Chọn tỉnh</option>
                                    {VIETNAM_PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3.5 bottom-4 w-4 h-4 text-slate-400" />
                            </div>
                            <div className="relative">
                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Quận/Huyện</label>
                                <select value={form.district} onChange={handleDistrictChange} disabled={!form.province} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none appearance-none font-bold text-[11px] disabled:opacity-50">
                                    <option value="">Chọn huyện</option>
                                    {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3.5 bottom-4 w-4 h-4 text-slate-400" />
                            </div>
                            <div className="relative">
                                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Phường/Xã</label>
                                <select value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} disabled={!form.district} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none appearance-none font-bold text-[11px] disabled:opacity-50">
                                    <option value="">Chọn phường</option>
                                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3.5 bottom-4 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <input type="text" placeholder="Số nhà, tên đường chi tiết..." value={form.addressDetail} onChange={e => setForm({ ...form, addressDetail: e.target.value })} className="w-full p-3.5 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-700 text-xs" />
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-4">
                        <button type="button" onClick={() => navigate('/my-products')} className="flex-grow py-3.5 bg-slate-100 text-slate-600 font-black rounded-[1.5rem] text-xs hover:bg-slate-200 transition-all uppercase tracking-widest">Hủy bỏ</button>
                        <button type="submit" disabled={updating} className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-[1.5rem] text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                            {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
