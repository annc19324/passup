import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { Send, Image, MessageSquare, ChevronLeft, Loader2, CheckCircle, ShoppingBag, ExternalLink } from 'lucide-react';
import moment from 'moment';

export default function Chat() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const activeConvId = searchParams.get('id');

    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentConv, setCurrentConv] = useState<any>(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 15;
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // 0. Khóa cuộn toàn bộ trang khi ở trang Chat
    useEffect(() => {
        window.scrollTo(0, 0); // Đưa trang về đầu để Chat không bị che
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // 1. Kết nối Socket
    useEffect(() => {
        if (!user) return;
        const socket = getSocket();

        const handleNewMessage = (message: any) => {
            if (activeConvId && message.conversationId === parseInt(activeConvId)) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }
            fetchConversations();
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [user, activeConvId]);

    // 2. Lấy danh sách cuộc hội thoại
    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy danh sách chat:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // 3. Lấy tin nhắn
    const fetchMessages = async (convId: string, currentOffset: number = 0) => {
        if (currentOffset === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            const res = await api.get(`/chat/messages/${convId}?limit=${LIMIT}&offset=${currentOffset}`);
            if (res.data.success) {
                const newMsgs = res.data.data;
                const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;

                if (currentOffset === 0) {
                    setMessages(newMsgs);
                } else {
                    setMessages(prev => [...newMsgs, ...prev]);
                    setTimeout(() => {
                        if (chatContainerRef.current) {
                            const newScrollHeight = chatContainerRef.current.scrollHeight;
                            chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                        }
                    }, 0);
                }
                
                if (newMsgs.length < LIMIT) setHasMore(false);
                else setHasMore(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (activeConvId) {
            setOffset(0);
            setHasMore(true);
            fetchMessages(activeConvId, 0);

            const found = conversations.find(c => c.id === parseInt(activeConvId));
            if (found) setCurrentConv(found);
        }
    }, [activeConvId]);

    useEffect(() => {
        if (activeConvId && !currentConv) {
            const found = conversations.find(c => c.id === parseInt(activeConvId));
            if (found) setCurrentConv(found);
        }
    }, [conversations, activeConvId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() && !fileInputRef.current?.files?.[0]) return;
        if (!activeConvId || !currentConv) return;

        const receiverId = currentConv.user1Id === user?.id ? currentConv.user2Id : currentConv.user1Id;
        const formData = new FormData();
        formData.append('conversationId', activeConvId);
        formData.append('text', inputText);
        formData.append('receiverId', receiverId.toString());
        
        const file = fileInputRef.current?.files?.[0];
        if (file) formData.append('image', file);

        try {
            await api.post('/chat/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setInputText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Lỗi gửi tin:', err);
        }
    };

    const handleImageClick = () => { fileInputRef.current?.click(); };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (e.currentTarget.scrollTop === 0 && hasMore && !loadingMore && activeConvId) {
            const nextOffset = offset + LIMIT;
            setOffset(nextOffset);
            fetchMessages(activeConvId, nextOffset);
        }
    };

    const getPartner = (conv: any) => {
        return conv.user1Id === user?.id ? conv.user2 : conv.user1;
    };

    if (loading && conversations.length === 0) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

    const partner = currentConv ? getPartner(currentConv) : null;
    const currentProduct = currentConv?.product;

    return (
        <div className="w-full px-4 md:px-8 h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] mt-4 mb-20">
            <div className="w-full h-full bg-white border border-slate-200 flex overflow-hidden relative shadow-sm rounded-3xl">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" /> Tin nhắn
                    </h1>
                </div>
                <div className="flex-grow overflow-y-auto no-scrollbar">
                    {conversations.length > 0 ? conversations.map(conv => {
                        const p = getPartner(conv);
                        const isActive = activeConvId === conv.id.toString();
                        const lastMsg = conv.messages?.[0];

                        return (
                            <Link
                                key={conv.id}
                                to={`/chat?id=${conv.id}`}
                                className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-all border-l-4 ${isActive ? 'bg-blue-50 border-blue-600' : 'border-transparent'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">{p.fullName.charAt(0)}</div>}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-black text-[13px] truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{p.fullName}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{moment(conv.lastMessageAt).format('HH:mm')}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate text-left font-medium">
                                        {lastMsg ? lastMsg.text : 'Bắt đầu chat...'}
                                    </p>
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="p-10 text-center text-slate-400 italic text-sm font-bold">Chưa có tin nhắn mới nào.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-grow flex flex-col bg-slate-50/10 ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                {activeConvId && currentConv && partner ? (
                    <>
                        <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-4 shadow-sm z-30">
                            <Link to="/chat" className="md:hidden p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-slate-600" />
                            </Link>
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative">
                                {partner.avatar ? <img src={partner.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">{partner.fullName.charAt(0)}</div>}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-grow">
                                <div className="font-black text-slate-900 text-[15px]">{partner.fullName}</div>
                                <div className="text-[10px] text-green-500 font-black uppercase tracking-wider flex items-center gap-1.5 mt-0.5 animate-pulse">
                                    Đang trực tuyến
                                </div>
                            </div>
                        </div>

                        {/* PRODUCT INFO HEADER SECTION */}
                        {currentProduct && (
                            <div className="bg-slate-50/80 backdrop-blur-sm p-3 border-b border-slate-200/50 flex items-center justify-between z-20 shrink-0">
                                <Link to={`/product/${currentProduct.id}`} className="flex items-center gap-3 group min-w-0 flex-grow">
                                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                        <img src={currentProduct.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[12px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-none mb-1 truncate">{currentProduct.title}</h4>
                                        <div className="text-[11px] text-rose-600 font-black flex items-center gap-1">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(currentProduct.price))}
                                            <span className={`px-2 py-0.5 rounded ml-1 uppercase text-[9px] tracking-tighter ${currentProduct.status === 'AVAILABLE' ? 'text-blue-600 bg-blue-50' : (currentProduct.status === 'RESERVED' ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-100')}`}>
                                                • {currentProduct.status === 'AVAILABLE' ? 'Đang bán' : (currentProduct.status === 'RESERVED' ? 'Đã đặt cọc' : 'Đã bán')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <Link 
                                    to={`/product/${currentProduct.id}`}
                                    className="p-2.5 border border-slate-200 text-slate-400 rounded-2xl bg-white hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer ml-4"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        <div 
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                            className="flex-grow overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-hide bg-slate-50/30"
                        >
                            {loadingMore && <div className="text-center p-2"><Loader2 className="w-4 h-4 animate-spin mx-auto text-blue-500" /></div>}
                            
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id || Math.random()} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group max-w-full`}>
                                        <div className={`max-w-[75%] md:max-w-[70%] ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                            {msg.image && (
                                                <div className={`mb-1.5 rounded-2xl overflow-hidden border border-white shadow-sm hover:shadow-md transition-shadow ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                                    <img src={msg.image} className="w-full h-auto max-h-[300px] object-cover" alt="Chat" />
                                                </div>
                                            )}
                                            {msg.text && (
                                                <div className={`p-3 px-4 rounded-2xl shadow-sm relative group-hover:shadow-md transition-all ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                                    <p className="text-[14px] leading-relaxed font-semibold">{msg.text}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[9px] mt-1.5 px-1 text-slate-400 font-bold flex items-center gap-1 transition-opacity uppercase tracking-tighter`}>
                                            {moment(msg.createdAt).format('HH:mm')} {isMe && <CheckCircle className="w-2.5 h-2.5 text-blue-500" />}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        <div className="p-4 md:p-6 bg-white border-t border-slate-100 sticky bottom-0 z-40">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleSendMessage(new Event('submit') as any); }} />
                                <button type="button" onClick={handleImageClick} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Image className="w-6 h-6" /></button>
                                <div className="flex-grow relative flex items-center">
                                    <input type="text" placeholder="Gửi câu hỏi của bạn..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-4 px-6 bg-slate-50/50 rounded-3xl outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-400 pr-14" />
                                    <button type="submit" disabled={!inputText.trim() && !fileInputRef.current?.files?.[0]} className="absolute right-2 text-blue-600 p-2 hover:scale-110 active:scale-95 disabled:opacity-0 transition-all"><Send className="w-6 h-6" /></button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-300">
                        <ShoppingBag className="w-20 h-20 opacity-5 mb-4" />
                        <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Kết nối & Trao đổi</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 opacity-60">Vui lòng chọn một cuộc trò chuyện từ danh sách</p>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
