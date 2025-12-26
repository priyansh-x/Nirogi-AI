import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    to?: string;
}

export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
    return (
        <nav className="flex items-center text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600 transition-colors">
                <Home size={16} />
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={14} className="mx-2 text-slate-400" />
                    {item.to ? (
                        <Link to={item.to} className="hover:text-blue-600 transition-colors font-medium">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-slate-900">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
