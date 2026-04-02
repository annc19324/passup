import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Heart } from 'lucide-react';

export default function Wishlist() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/wishlist')
            .then(res => {
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                    <Heart className="w-8 h-8 fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Sản phẩm yêu thích</h1>
                    <p className="text-slate-500">Danh sách những món đồ bạn đã "thả tim"</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl p-4 h-[300px]">
                            <div className="bg-slate-200 h-40 rounded-xl mb-4"></div>
                            <div className="bg-slate-200 h-4 w-3/4 rounded mb-2"></div>
                            <div className="bg-slate-200 h-6 w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {products.map((product: any) => (
                        <ProductCard
                            key={product.id}
                            productId={product.id}
                            productSlug={product.slug}
                            title={product.title}
                            price={product.price}
                            location={product.seller?.address || "Liên hệ"}
                            time={product.createdAt}
                            image={product.images && product.images.length > 0 ? product.images[0] : ""}
                            initialIsWishlisted={true} // Vì đang ở trang Wishlist nên chắc chắn là true
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-20 rounded-3xl border border-dashed border-slate-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                        <Heart className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có sản phẩm yêu thích</h2>
                    <p className="text-slate-500 mb-6">Hãy dạo quanh trang chủ và thả tim cho những món đồ bạn ưng ý nhé!</p>
                    <a href="/" className="btn-primary px-8 py-3">Khám phá ngay</a>
                </div>
            )}
        </div>
    );
}
