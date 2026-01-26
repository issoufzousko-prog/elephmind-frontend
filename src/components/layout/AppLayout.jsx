import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';

const AppLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check authentication & Verify session with Backend
    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // 1. Local Check
                const payload = JSON.parse(atob(token.split('.')[1]));
                const username = payload.sub;
                setUser({ username });

                // 2. Server Check (Critical for volatile DBs)
                const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';
                const res = await fetch(`${API_URL}/api/dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401 || res.status === 404) {
                    console.warn("Session invalid on server - logging out");
                    throw new Error("Session expired");
                }
            } catch (e) {
                console.error("Auth Error:", e);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        verifySession();
    }, [navigate]);

    // Dark mode
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: isDarkMode ? '#1f2937' : '#fff',
                        color: isDarkMode ? '#fff' : '#1f2937',
                    },
                }}
            />

            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-[280px]'}`}
            >
                {/* Top Header */}
                <header className="h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex items-center justify-between px-6">
                    {/* Search */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un patient, examen..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-brand-primary text-gray-800 dark:text-white placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </button>

                        {/* Notifications */}
                        <button className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-semibold text-gray-800 dark:text-white text-sm">{user.username}</p>
                                <p className="text-xs text-gray-500">Radiologue</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
