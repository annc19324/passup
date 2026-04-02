import { useState, useEffect } from 'react';
import CategoryScroll from '../components/CategoryScroll';
import ProductCard from '../components/ProductCard';
import BackgroundSelector from '../components/BackgroundSelector';
import api from '../services/api';
import { Search, MapPin } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../data/locations';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    // Filter địa điểm
    const [filterProvince, setFilterProvince] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [districts, setDistricts] = useState<{name: string, wards: string[]}[]>([]);
    const [filterWard, setFilterWard] = useState('');
    const [wards, setWards] = useState<string[]>([]);


    // Hàm gọi API lấy danh sách
    const fetchProducts = (query = '', categoryId: number | null = null, province = '', district = '', ward = '') => {
        setLoading(true);
        let url = `/products?`;
        if (query) url += `q=${query}&`;
        if (categoryId) url += `categoryId=${categoryId}&`;
        if (province) url += `province=${province}&`;
        if (district) url += `district=${district}&`;
        if (ward) url += `ward=${ward}&`;


        api.get(url)
            .then(res => {
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // Load lần đầu tiên
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts(searchTerm, activeCategoryId, filterProvince, filterDistrict, filterWard);
    };

    const handleCategorySelect = (id: number | null) => {
        setActiveCategoryId(id);
        fetchProducts(searchTerm, id, filterProvince, filterDistrict, filterWard);
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilterProvince(val);
        setFilterDistrict('');
        setFilterWard('');
        
        const found = VIETNAM_PROVINCES.find(p => p.name === val);
        setDistricts(found ? found.districts : []);
        setWards([]);
        
        fetchProducts(searchTerm, activeCategoryId, val, '', '');
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilterDistrict(val);
        setFilterWard('');

        const found = districts.find(d => d.name === val);
        setWards(found ? found.wards : []);

        fetchProducts(searchTerm, activeCategoryId, filterProvince, val, '');
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFilterWard(val);
        fetchProducts(searchTerm, activeCategoryId, filterProvince, filterDistrict, val);
    };


    return (
        <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Bạn muốn tìm mua sản phẩm nào hôm nay?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm rounded-full py-3.5 pl-6 pr-14 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base md:text-lg"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 text-white rounded-full w-10 md:w-11 flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Search className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                {/* City & District Selectors */}
                <div className="flex gap-1.5 mt-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide md:justify-center">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <select
                            value={filterProvince}
                            onChange={handleProvinceChange}
                            className="bg-white/90 border border-slate-200 rounded-full py-1.5 pl-8 pr-7 text-xs outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="">Toàn quốc</option>
                            {VIETNAM_PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={filterDistrict}
                            onChange={handleDistrictChange}
                            disabled={!filterProvince}
                            className="bg-white/90 border border-slate-200 rounded-full py-1.5 px-4 text-xs outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
                        >
                            <option value="">Quận/Huyện</option>
                            {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            value={filterWard}
                            onChange={handleWardChange}
                            disabled={!filterDistrict}
                            className="bg-white/90 border border-slate-200 rounded-full py-1.5 px-4 text-xs outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
                        >
                            <option value="">Phường/Xã</option>
                            {wards.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                </div>
            </form>

            {/* Categories Box */}
            <div className="mb-6">
                <CategoryScroll onSelectCategory={handleCategorySelect} activeCategoryId={activeCategoryId} />
            </div>

            {/* List Products */}
            <div>
                <div className="flex items-center justify-between mb-4 md:mb-6 px-2">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : 'Sản phẩm mới đăng'}
                        {searchTerm && (
                            <button
                                onClick={() => { 
                                    setSearchTerm(''); 
                                    setActiveCategoryId(null); 
                                    setFilterProvince('');
                                    setFilterDistrict('');
                                    setFilterWard('');
                                    setDistricts([]);
                                    setWards([]);
                                    fetchProducts('', null, '', '', ''); 
                                }}
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </h2>
                    <BackgroundSelector />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-4 min-h-[300px] flex flex-col gap-4">
                                <div className="bg-slate-200 h-40 rounded-xl w-full"></div>
                                <div className="bg-slate-200 h-4 w-3/4 rounded"></div>
                                <div className="bg-slate-200 h-6 w-1/2 rounded mt-2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                        {products.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                productId={product.id}
                                productSlug={product.slug}
                                title={product.title}
                                price={product.price}
                                province={product.province}
                                district={product.district}
                                location={product.seller?.address || "Liên hệ"}
                                time={product.createdAt}
                                image={product.images && product.images.length > 0 ? product.images[0] : ""}
                                initialIsWishlisted={product.isWishlisted}
                                isHighlight={product.isHighlight}
                                allowPickup={product.allowPickup}
                                allowShip={product.allowShip}
                                status={product.status}
                                stock={product.stock}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl border border-slate-200 text-slate-500">
                        {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.' : 'Chưa có sản phẩm nào được tải lên. Hãy là người đầu tiên!'}
                    </div>
                )}
            </div>
        </div>
    );
}
