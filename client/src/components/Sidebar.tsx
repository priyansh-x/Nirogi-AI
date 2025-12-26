import React from 'react';
import { Users, FileText, Settings, Activity, BookOpen, Layers, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <Link
            to={to}
            className={clsx(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mx-2 my-0.5",
                isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-blue-200/50"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
        >
            <Icon size={18} className={clsx(isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            {label}
        </Link>
    );
};

export const Sidebar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="w-64 bg-card border-r border-border flex flex-col h-full shadow-sm z-10 transition-all duration-300">
            <Link to="/" className="p-6 border-b border-border hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xl tracking-tight">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Activity size={22} />
                    </div>
                    <span className="text-foreground">Nirogi AI</span>
                </div>
            </Link>

            <nav className="flex-1 py-6 space-y-1">
                <div className="px-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</div>
                <NavItem to="/app/patients" icon={Users} label="Patients" />
                <NavItem to="/app/audit" icon={FileText} label="Audit Logs" />

                <div className="px-6 pb-2 pt-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</div>
                <NavItem to="/app/integrations" icon={Layers} label="EHR Integrations" />
                <NavItem to="/app/docs" icon={BookOpen} label="Documentation" />
                <NavItem to="/app/settings" icon={Settings} label="Settings" />
            </nav>

            <div className="p-4 border-t border-border bg-muted/50">
                <div className="flex items-center justify-between mb-2 px-2">
                    <Link to="/app/profile" className="flex items-center gap-3 hover:bg-secondary p-1 rounded-lg transition-colors cursor-pointer flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-background">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-foreground truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user?.role || 'Member'}</p>
                        </div>
                    </Link>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sign out">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
