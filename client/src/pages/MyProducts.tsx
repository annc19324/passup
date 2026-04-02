import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Package, Plus, ChevronRight, MoreVertical, Trash2, Edit } from 'lucide-react';

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products/me')
            .then(res => {
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const res = await api.delete(`/products/${id}`);
            if (res.data.success) {
                toast.success('Đã xóa tin đăng thành công');
                setProducts(products.filter((p: any) => p.id !== id));
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto p-6 animate-pulse">
            <div className="h-10 bg-slate-200 w-48 mb-8 rounded-lg"></div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 mb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="text-blue-600" /> Quản lý tin đăng
                    </h1>
                    <p className="text-slate-500">Bạn đã đăng {products.length} sản phẩm</p>
                </div>
                <Link to="/sell" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Đăng tin mới
                </Link>
            </div>

            {products.length > 0 ? (
                <div className="space-y-4">
                    {products.map((product: any) => (
                        <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100 aspect-square">
                                <img
                                    src={product.images && product.images.length > 0 ? product.images[0] : ""}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-bold text-slate-800 line-clamp-1">{product.title}</h3>
                                <div className="text-rose-600 font-bold">{formatPrice(Number(product.price))}</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {product.category?.name} 
                                    <span className="mx-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">Kho: {product.stock}</span>
                                    •
                                    <span className={`ml-1 font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${product.status === 'AVAILABLE' ? 'text-green-600 bg-green-50' : (product.status === 'RESERVED' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50')}`}>
                                        {product.status === 'AVAILABLE' ? 'Đang bán' : (product.status === 'RESERVED' ? 'Đã đặt gạch' : 'Đã bán')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 transition-opacity">
                                <Link
                                    to={`/edit-product/${product.id}`}
                                    className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600 transition-colors text-sm"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <Link to={`/product/${product.id}`} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <button className="md:hidden">
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="text-slate-400 mb-4 flex justify-center">
                        <Package className="w-16 h-16 opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">Chưa có tin đăng nào</h3>
                    <p className="text-slate-500 mb-6">Hãy bắt đầu bán những món đồ bạn không dùng tới nhé!</p>
                    <Link to="/sell" className="btn-primary inline-flex">Đăng tin ngay</Link>
                </div>
            )}
        </div>
    );
}
