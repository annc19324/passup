import { useEffect } from "react"; 
import { Zap, X } from "lucide-react"; 
import { usePayOS, type PayOSConfig } from "@payos/payos-checkout"; 

export default function PayOSModal({ checkoutUrl, orderCode, onClose, onCheckPayment }: any) { 
    const payOSConfig: PayOSConfig = { 
        RETURN_URL: window.location.origin + window.location.pathname, 
        ELEMENT_ID: "payos-checkout-container", 
        CHECKOUT_URL: checkoutUrl, 
        embedded: true, 
        onSuccess: () => { 
            onCheckPayment(orderCode); 
            onClose(); 
        }, 
        onCancel: () => { 
            onClose(); 
        }, 
        onExit: () => { 
            onClose(); 
        } 
    }; 
    
    const { open, exit } = usePayOS(payOSConfig); 
    
    useEffect(() => { 
        const timer = setTimeout(() => { 
            if (document.getElementById("payos-checkout-container")) { 
                open(); 
            } 
        }, 100); 
        return () => clearTimeout(timer); 
    }, [open]); 
    
    return ( 
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"> 
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { exit(); onClose(); }}></div> 
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]"> 
                <div className="flex items-center justify-between p-6 border-b border-slate-100"> 
                    <div className="flex items-center gap-3"> 
                        <Zap className="w-5 h-5 text-blue-600 fill-current" /> 
                        <h3 className="font-black text-slate-900">Thanh toán Quét mã QR</h3> 
                    </div> 
                    <button onClick={() => { exit(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button> 
                </div> 
                <div id="payos-checkout-container" className="flex-grow bg-slate-50"></div> 
                <div className="p-4 border-t border-slate-50 flex gap-2"> 
                    <button onClick={() => onCheckPayment(orderCode)} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2"> 
                        TÔI ĐÃ CHUYỂN KHOẢN XONG 
                    </button> 
                </div> 
            </div> 
        </div> 
    ); 
}
