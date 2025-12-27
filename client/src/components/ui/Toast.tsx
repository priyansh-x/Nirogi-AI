import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 w-full max-w-md pointer-events-none">
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            className="pointer-events-auto flex items-start gap-3 w-full bg-white border border-slate-200 shadow-lg rounded-lg p-4 transform transition-all animate-in slide-in-from-right-full duration-300"
                        >
                            {t.type === 'success' && <CheckCircle className="text-green-500 shrink-0" size={20} />}
                            {t.type === 'error' && <AlertCircle className="text-red-500 shrink-0" size={20} />}
                            {t.type === 'info' && <Info className="text-blue-500 shrink-0" size={20} />}

                            <div className="flex-1 text-sm font-medium text-slate-900">{t.message}</div>

                            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
