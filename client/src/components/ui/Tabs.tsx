import React, { createContext, useContext } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TabsContextType {
    value: string;
    onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }) => {
    return (
        <TabsContext.Provider value={{ value, onChange: onValueChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    return (
        <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}>
            {children}
        </div>
    );
};

export const TabsTrigger = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200/50 hover:text-gray-700",
                className
            )}
            onClick={() => context.onChange(value)}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return (
        <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
            {children}
        </div>
    );
};
