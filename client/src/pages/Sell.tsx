import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, PlusCircle, Loader2 } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../data/locations';

export default function SellPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);

    // Địa điểm
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [districts, setDistricts] = useState<{name: string, wards: string[]}[]>([]);
    const [ward, setWard] = useState('');
    const [wards, setWards] = useState<string[]>([]);
    const [addressDetail, setAddressDetail] = useState('');

    // Hình ảnh
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Giao nhận
    const [allowPickup, setAllowPickup] = useState(true);
    const [allowShip, setAllowShip] = useState(false);
    const [shipPrice, setShipPrice] = useState('');
    const [stock, setStock] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load danh mục
        api.get('/categories').then(res => {
            if (res.data.success) {
                setCategories(res.data.data);
                if (res.data.data.length > 0) setCategoryId(res.data.data[0].id.toString());
            }
        });
    }, []);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        setProvince(provinceName);
        setDistrict('');
        setWard('');
        const found = VIETNAM_PROVINCES.find(p => p.name === provinceName);
        if (found) setDistricts(found.districts as any);
        else setDistricts([]);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtName = e.target.value;
        setDistrict(districtName);
        setWard('');
        const found = districts.find(d => d.name === districtName);
        if (found) setWards(found.wards);
        else setWards([]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (images.length + filesArray.length > 5) {
                setError('Chỉ được tải lên tối đa 5 hình ảnh');
                return;
            }
            setImages(prev => [...prev, ...filesArray]);
            const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (images.length === 0) {
            setError('Bạn phải chọn ít nhất 1 hình ảnh');
            setLoading(false);
            return;
        }

        if (!allowPickup && !allowShip) {
            setError('Vui lòng chọn ít nhất 1 hình thức giao dịch');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('categoryId', categoryId);
            formData.append('province', province);
            formData.append('district', district);
            formData.append('ward', ward);
            formData.append('addressDetail', addressDetail);
            formData.append('allowPickup', String(allowPickup));
            formData.append('allowShip', String(allowShip));
            formData.append('shipPrice', shipPrice);
            formData.append('stock', String(stock));

            images.forEach(img => {
                formData.append('images', img);
            });

            const response = await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-4 md:py-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Đăng sản phẩm mới</h1>
                <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy & Quay lại</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold border border-red-100 animate-shake">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                
                {/* Image Uploader */}
                <div>
                    <label className="block text-slate-400 font-bold mb-2 text-[9px] uppercase tracking-widest ml-1">Hình ảnh (Tối đa 5 ảnh) *</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                        {images.length < 5 && (
                            <label className="shrink-0 w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 group">
                                <UploadCloud className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Tải ảnh</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                        {previewUrls.map((url, i) => (
                            <div key={i} className="shrink-0 w-24 h-24 relative border-2 border-slate-100 rounded-2xl overflow-hidden group shadow-sm">
                                <img src={url} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Tiêu đề sản phẩm *</label>
                        <input
                            required
                            type="text"
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="vd: iPhone 13 bản 128GB"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Chuyên mục *</label>
                        <select
                            required
                            value={categoryId} onChange={e => setCategoryId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Giá bán (VNĐ) *</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
                                placeholder="vd: 12.000.000"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-rose-600 text-base"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">VNĐ</span>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Số lượng *</label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1 h-[46px]">
                            <button type="button" onClick={() => setStock(Math.max(1, stock - 1))} className="w-10 h-full rounded-lg flex items-center justify-center font-black text-slate-400 hover:bg-white hover:text-slate-900 transition-all">-</button>
                            <span className="flex-grow text-center font-black text-sm">{stock}</span>
                            <button type="button" onClick={() => setStock(stock + 1)} className="w-10 h-full rounded-lg flex items-center justify-center font-black text-slate-400 hover:bg-white hover:text-slate-900 transition-all">+</button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-dotted border-slate-200">
                    <label className="block text-slate-900 font-bold mb-2 text-[9px] uppercase tracking-widest">Khu vực giao dịch *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <select required value={province} onChange={handleProvinceChange} className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-blue-500 transition-all font-bold">
                            <option value="">Tỉnh/TP</option>
                            {VIETNAM_PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                        <select required value={district} onChange={handleDistrictChange} disabled={!province} className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-blue-500 transition-all font-bold disabled:opacity-50">
                            <option value="">Quận/Huyện</option>
                            {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                        <select required value={ward} onChange={e => setWard(e.target.value)} disabled={!district} className="md:col-span-1 bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-blue-500 transition-all font-bold disabled:opacity-50 col-span-2">
                            <option value="">Phường/Xã</option>
                            {wards.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                        <input required type="text" value={addressDetail} onChange={e => setAddressDetail(e.target.value)} placeholder="Số nhà, đường..." className="col-span-2 md:col-span-3 bg-white border border-slate-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-blue-500 transition-all font-bold" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Hình thức giao hàng *</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAllowPickup(!allowPickup)}
                                className={`p-2 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${allowPickup ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 bg-slate-50/50 text-slate-400'}`}
                            >
                                <span className={allowPickup ? 'grayscale-0' : 'grayscale'}>🏠</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Lấy hàng</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllowShip(!allowShip)}
                                className={`p-2 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${allowShip ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-50 bg-slate-50/50 text-slate-400'}`}
                            >
                                <span className={allowShip ? 'grayscale-0' : 'grayscale'}>🚚</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Gửi ship</span>
                            </button>
                        </div>
                        {allowShip && (
                            <input
                                type="text"
                                value={shipPrice}
                                onChange={e => setShipPrice(e.target.value)}
                                placeholder="Ghi chú phí ship... (vd: 30k nội tỉnh)"
                                className="w-full mt-2 bg-blue-50/30 border border-blue-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:border-blue-500 font-bold animate-in zoom-in-95"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-widest ml-1">Mô tả sản phẩm *</label>
                        <textarea
                            required
                            placeholder="Mô tả tình trạng, lý do bán..."
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[90px] font-medium text-xs leading-relaxed"
                        ></textarea>
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={loading} className={`w-full bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-black shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> ĐĂNG TIN NGAY</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
