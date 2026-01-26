import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Activity, AlertTriangle, Stethoscope, FileImage, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Non authentifié');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Erreur de chargement');

                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const priorityColors = {
        'Normale': 'bg-green-100 text-green-800 border-green-200',
        'Moyenne': 'bg-orange-100 text-orange-800 border-orange-200',
        'Élevée': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                            Tableau de Bord
                        </h1>
                        <p className="text-gray-500">
                            Registre des analyses • Données réelles uniquement
                        </p>
                    </div>
                    <Link
                        to="/app/analysis"
                        className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all shadow-lg"
                    >
                        Nouvelle Analyse
                    </Link>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Total Analyses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Total Analyses</span>
                            <BarChart3 className="w-5 h-5 text-brand-primary" />
                        </div>
                        <p className="text-4xl font-bold text-brand-dark dark:text-white">
                            {stats.total_analyses}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {stats.total_analyses === 0 ? 'Aucune analyse effectuée' : 'Analyses enregistrées'}
                        </p>
                    </motion.div>

                    {/* Average Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Temps Moyen</span>
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-4xl font-bold text-brand-dark dark:text-white">
                            {stats.avg_computation_time_ms > 0 ? `${(stats.avg_computation_time_ms / 1000).toFixed(1)}s` : '-'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Par analyse</p>
                    </motion.div>

                    {/* By Domain */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Par Domaine</span>
                            <Stethoscope className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="space-y-2">
                            {(!stats.by_domain || Object.keys(stats.by_domain).length === 0) ? (
                                <p className="text-gray-400 text-sm">Aucune donnée</p>
                            ) : (
                                Object.entries(stats.by_domain).map(([domain, count]) => (
                                    <div key={domain} className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">{domain}</span>
                                        <span className="font-semibold text-brand-dark dark:text-white">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* By Priority */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Par Urgence</span>
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="space-y-2">
                            {(!stats.by_priority || Object.keys(stats.by_priority).length === 0) ? (
                                <p className="text-gray-400 text-sm">Aucune donnée</p>
                            ) : (
                                Object.entries(stats.by_priority).map(([priority, count]) => (
                                    <div key={priority} className="flex justify-between items-center text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[priority] || 'bg-gray-100 text-gray-600'}`}>
                                            {priority}
                                        </span>
                                        <span className="font-semibold text-brand-dark dark:text-white">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Analyses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-brand-dark dark:text-white">Analyses Récentes</h2>
                        <FileImage className="w-5 h-5 text-gray-400" />
                    </div>

                    {(!stats.recent_analyses || stats.recent_analyses.length === 0) ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Aucune analyse effectuée</p>
                            <p className="text-gray-400 text-sm mt-1">Les analyses apparaîtront ici après votre première utilisation</p>
                            <Link
                                to="/app/analysis"
                                className="inline-block mt-6 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary/90 transition-all"
                            >
                                Lancer ma première analyse
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Date</th>
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Domaine</th>
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Diagnostic</th>
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Confiance</th>
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Urgence</th>
                                        <th className="text-left py-3 px-4 text-gray-500 text-sm font-medium">Temps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_analyses.map((analysis) => (
                                        <tr key={analysis.id || Math.random()} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-brand-dark dark:text-white">
                                                {analysis.domain}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                                {analysis.top_diagnosis}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-brand-primary">
                                                {analysis.confidence}%
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[analysis.priority] || 'bg-gray-100 text-gray-600'}`}>
                                                    {analysis.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {(analysis.computation_time_ms / 1000).toFixed(1)}s
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
