import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderOpen,
    ScanLine,
    Settings,
    ChevronLeft,
    ChevronRight,
    BrainCircuit,
    LogOut
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();

    const navItems = [
        { path: '/app/dashboard', name: 'Tableau de Bord', icon: LayoutDashboard },
        { path: '/app/patients', name: 'Dossiers Patients', icon: FolderOpen },
        { path: '/app/analysis', name: 'Analyse IA', icon: ScanLine },
        { path: '/app/settings', name: 'Paramètres', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen bg-brand-dark text-white z-40 flex flex-col shadow-2xl"
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="bg-brand-primary p-2 rounded-lg">
                                <BrainCircuit className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                Eleph<span className="text-brand-primary">Mind</span>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isCollapsed && (
                    <div className="mx-auto bg-brand-primary p-2 rounded-lg">
                        <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-primary'}`} />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-white/10 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="font-medium">Déconnexion</span>}
                </button>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!isCollapsed && <span className="font-medium">Réduire</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
