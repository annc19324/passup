import { useState, useEffect } from 'react';
import api from '../services/api';
import { LayoutGrid, Monitor, Smartphone, BookOpen, Shirt, Armchair, Bike } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
}

interface CategoryScrollProps {
    onSelectCategory: (id: number | null) => void;
    activeCategoryId: number | null;
}

const mapIconToCategory = (slug: string) => {
    switch (slug) {
        case 'do-0-dong': return <span className="text-xl font-black">0đ</span>;
        case 'do-dien-tu': return <Monitor className="w-8 h-8 opacity-80" />;
        case 'dien-thoai': return <Smartphone className="w-8 h-8 opacity-80" />;
        case 'sach-giao-trinh': return <BookOpen className="w-8 h-8 opacity-80" />;
        case 'thoi-trang': return <Shirt className="w-8 h-8 opacity-80" />;
        case 'noi-that': return <Armchair className="w-8 h-8 opacity-80" />;
        case 'phuong-tien': return <Bike className="w-8 h-8 opacity-80" />;
        default: return <LayoutGrid className="w-8 h-8 opacity-80" />;
    }
}

export default function CategoryScroll({ onSelectCategory, activeCategoryId }: CategoryScrollProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                if (response.data.success) {
                    setCategories(response.data.data);
                } else {
                    setError('Lỗi lấy danh mục');
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi kết nối máy chủ');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return (
        <div className="flex gap-4 animate-pulse overflow-hidden px-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
                    <div className="h-4 w-12 bg-slate-200 rounded"></div>
                </div>
            ))}
        </div>
    );

    if (error) return <div className="text-red-500 text-sm">⚠️ {error}</div>;

    return (
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-4 px-2 min-w-max">
                {/* Option All */}
                <button
                    onClick={() => onSelectCategory(null)}
                    className="group flex flex-col items-center gap-3 min-w-[80px] cursor-pointer"
                >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${activeCategoryId === null ? 'bg-blue-600 text-white shadow-blue-200 scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        <LayoutGrid className="w-8 h-8 opacity-80" />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${activeCategoryId === null ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-blue-600'}`}>
                        Tất cả
                    </span>
                </button>

                {categories.map((cat, index) => {
                    const bgColors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-pink-100 text-pink-700', 'bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700'];
                    let colorClass = bgColors[index % bgColors.length];
                    
                    const isFree = cat.slug === 'do-0-dong';
                    if (isFree) colorClass = 'bg-red-500 text-white';

                    const isActive = activeCategoryId === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className="group flex flex-col items-center gap-3 min-w-[80px] cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isActive ? 'bg-blue-600 text-white shadow-blue-200 scale-105' : `${colorClass} hover:opacity-80`}`}>
                                {mapIconToCategory(cat.slug)}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isActive ? 'text-blue-600 font-bold' : (isFree ? 'text-red-600 group-hover:text-red-700 font-black' : 'text-slate-600 group-hover:text-blue-600')}`}>
                                {isFree ? 'Free' : cat.name}
                            </span>
                        </button>
                    );
                })}
            </div>
            {/* CSS hide scrollbar */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
