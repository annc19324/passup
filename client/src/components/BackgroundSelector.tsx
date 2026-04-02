import React from 'react';
import { useBackground } from '../context/BackgroundContext';
import { Palette, Image as ImageIcon, Check } from 'lucide-react';
import bg1 from '../assets/backgrounds/passup_background_1.jpeg';

const PRESET_COLORS = [
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', // Default Slate
    'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', // Blue
    'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', // Emerald
    'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', // Rose
    'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', // Yellow
    '#ffffff', // Pure White
    '#0f172a', // Dark Slate
];

const PRESET_IMAGES = [
    { name: 'Mặc định PassUp', value: bg1 },
];

const BackgroundSelector: React.FC = () => {
    const { background, setBackground, backgroundOptions } = useBackground();
    const [isOpen, setIsOpen] = React.useState(false);

    const allImages = [...PRESET_IMAGES, ...backgroundOptions.filter(o => o.type === 'IMAGE')];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm hover:bg-white transition-all text-xs font-bold text-slate-600"
            >
                <Palette className="w-3.5 h-3.5 text-blue-500" />
                ĐỔI NỀN
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-[70] animate-in fade-in zoom-in duration-200 origin-top-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Palette className="w-3 h-3" /> Màu sắc & Gradient
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {PRESET_COLORS.map((color, i) => (
                                <button
                                    key={i}
                                    onClick={() => setBackground(color)}
                                    style={{ background: color }}
                                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 relative ${background === color ? 'border-blue-500' : 'border-slate-100'}`}
                                >
                                    {background === color && <Check className="w-3 h-3 text-blue-500 absolute inset-0 m-auto" />}
                                </button>
                            ))}
                        </div>

                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ImageIcon className="w-3 h-3" /> Hình nền nghệ thuật
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setBackground(img.value)}
                                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${background === img.value ? 'border-blue-500' : 'border-slate-100'}`}
                                >
                                    <img src={img.value} className="w-full h-full object-cover" alt="" />
                                    {background === img.value && (
                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setBackground('')}
                            className="w-full mt-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-slate-100 transition-colors uppercase"
                        >
                            Khôi phục mặc định
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default BackgroundSelector;
