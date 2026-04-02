import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface BackgroundContextType {
    background: string;
    setBackground: (bg: string) => void;
    backgroundOptions: any[];
    globalBackground: string;
    refreshSettings: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [background, setBackgroundState] = useState(localStorage.getItem('passup_bg') || '');
    const [backgroundOptions, setBackgroundOptions] = useState([]);
    const [globalBackground, setGlobalBackground] = useState('');

    const fetchSettings = async () => {
        try {
            const [settingsRes, optionsRes] = await Promise.all([
                api.get('/settings'),
                api.get('/settings/background-options')
            ]);

            if (settingsRes.data.success) {
                const global = settingsRes.data.data.GLOBAL_BACKGROUND || '';
                setGlobalBackground(global);
                // Nếu chưa có background nào thì dùng global
                if (!localStorage.getItem('passup_bg')) {
                    setBackgroundState(global);
                }
            }
            if (optionsRes.data.success) {
                setBackgroundOptions(optionsRes.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy cài đặt background:', err);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        const localBg = localStorage.getItem('passup_bg');
        
        // 1. Nếu có user và user có background trong DB -> Dùng DB (Cloud Sync)
        if (user?.background) {
            setBackgroundState(user.background);
            localStorage.setItem('passup_bg', user.background);
        } else if (user && !user.background && localBg) {
            // 2. Nếu user có lựa chọn cục bộ nhưng DB chưa có -> Đồng bộ lên DB
            api.put('/users/me/background', { background: localBg }).catch(console.error);
        } else if (!localBg && globalBackground) {
            // 3. Chỉ khi không có bất kỳ lựa chọn nào mới dùng global
            setBackgroundState(globalBackground);
        }
    }, [user, globalBackground]);

    useEffect(() => {
        if (background) {
            localStorage.setItem('passup_bg', background);
        }
        
        const bgStyle = background.startsWith('http') || background.includes('passup_background') 
            ? `url(${background}) center/cover no-repeat fixed` 
            : background || '#f8fafc';
            
        document.body.style.background = bgStyle;
        document.body.style.backgroundAttachment = 'fixed';
        
        return () => {
            document.body.style.background = '';
        };
    }, [background]);

    const setBackground = async (bg: string) => {
        setBackgroundState(bg);
        localStorage.setItem('passup_bg', bg);
        if (user) {
            try {
                await api.put('/users/me/background', { background: bg });
            } catch (err) {
                console.error('Lỗi lưu background user:', err);
            }
        }
    };

    return (
        <BackgroundContext.Provider value={{ 
            background, 
            setBackground, 
            backgroundOptions, 
            globalBackground,
            refreshSettings: fetchSettings 
        }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) throw new Error('useBackground must be used within BackgroundProvider');
    return context;
};
