import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield, Download, Moon, Sun,
    Globe, Mail, Lock, Eye, EyeOff, Save,
    LogOut, Trash2, ChevronRight
} from 'lucide-react';

const Settings = () => {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        criticalOnly: false
    });
    const [showPassword, setShowPassword] = useState(false);

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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Gérez vos préférences et paramètres de compte
                </p>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-primary" />
                    Profil Utilisateur
                </h2>

                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                        DR
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    defaultValue="Dr. Radiologue"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    defaultValue="dr.radiologue@elephmind.com"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Spécialité</label>
                            <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary">
                                <option>Radiologie Générale</option>
                                <option>Radiologie Thoracique</option>
                                <option>Neuroradiologie</option>
                                <option>Radiologie Pédiatrique</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors">
                    <Save className="h-4 w-4" />
                    Sauvegarder les modifications
                </button>
            </motion.div>

            {/* Appearance Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Moon className="h-5 w-5 text-brand-primary" />
                    Apparence
                </h2>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Mode Sombre</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Réduire la fatigue oculaire</p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-brand-primary' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${isDarkMode ? 'translate-x-6' : ''}`}>
                            {isDarkMode ? <Moon className="h-4 w-4 text-brand-primary" /> : <Sun className="h-4 w-4 text-yellow-500" />}
                        </div>
                    </button>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Langue</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choisir la langue de l'interface</p>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>🇫🇷 Français</option>
                        <option>🇬🇧 English</option>
                    </select>
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-brand-primary" />
                    Notifications
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Notifications Email</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir les alertes par email</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
                        />
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Notifications Push</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir les notifications en temps réel</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
                        />
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Alertes Critiques Uniquement</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir uniquement les cas urgents</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.criticalOnly}
                            onChange={(e) => setNotifications({ ...notifications, criticalOnly: e.target.checked })}
                            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-primary" />
                    Sécurité
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mot de passe actuel</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Confirmer</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Lock className="h-4 w-4" />
                        Changer le mot de passe
                    </button>
                </div>
            </motion.div>

            {/* Data Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-brand-primary" />
                    Données & Confidentialité
                </h2>

                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-brand-primary" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">Exporter mes données</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Télécharger toutes vos données (RGPD)</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            <div className="text-left">
                                <p className="font-medium text-red-700 dark:text-red-300">Supprimer mon compte</p>
                                <p className="text-sm text-red-500 dark:text-red-400">Action irréversible</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-red-400" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Settings;
