import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BrainCircuit, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'Oeil d\'Eléphant', path: '/products' },
        { name: 'À Propos', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    const [user, setUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Check auth status on mount and location change
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.sub });
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location]);

    // Dark mode initialization and persistence
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('elephmind_current_analysis'); // Clear persisted analysis
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="fixed w-full z-50 bg-brand-light/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-brand-dark/10 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-brand-primary p-2 rounded-lg">
                            <BrainCircuit className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">
                            Eleph<span className="text-brand-primary">Mind</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                                        ? 'text-brand-primary bg-brand-primary/10'
                                        : 'text-brand-dark dark:text-gray-300 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons (Desktop) */}
                    <div className="hidden md:flex items-center space-x-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-gray-600" />
                            )}
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-2 pr-4 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="h-8 w-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-brand-dark dark:text-white">{user.username}</span>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-xs text-gray-400">Connecté en tant que</p>
                                                <p className="text-sm font-bold text-brand-dark dark:text-white truncate">{user.username}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" aria-hidden="true" /> Se Déconnecter
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-brand-dark dark:bg-brand-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-primary dark:hover:bg-brand-dark transition-all duration-300 shadow-lg hover:shadow-brand-primary/25">
                                Commencer
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-md text-brand-dark dark:text-white hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-brand-dark dark:text-white hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-brand-light dark:bg-gray-900 border-b border-brand-dark/10 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                        ? 'text-brand-primary bg-brand-primary/10'
                                        : 'text-brand-dark dark:text-gray-300 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {/* Mobile Auth */}
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Déconnexion ({user.username})
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10"
                                >
                                    Se Connecter
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
