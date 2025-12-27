// import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '../components/ui/Toast';

export const Layout = () => {
    return (
        <ToastProvider>
            <div className="flex h-screen bg-background text-foreground font-sans">
                <Sidebar />
                <main className="flex-1 overflow-y-auto relative">
                    <Outlet />
                </main>
            </div>
        </ToastProvider>
    );
};
