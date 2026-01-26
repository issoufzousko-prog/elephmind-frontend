import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, Clock, CheckCircle, AlertTriangle,
    TrendingUp, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Stat Card Component
export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay = 0 }) => {
    const colorClasses = {
        primary: 'from-brand-primary to-emerald-500',
        warning: 'from-amber-500 to-orange-500',
        success: 'from-green-500 to-emerald-500',
        danger: 'from-red-500 to-rose-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </motion.div>
    );
};

// Critical Alert Component
export const CriticalAlert = ({ patient, type, time, priority }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-4"
        >
            <div className="p-2 bg-red-500 rounded-lg animate-pulse">
                <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-red-800 dark:text-red-200">{patient}</p>
                <p className="text-sm text-red-600 dark:text-red-300">{type} • {time}</p>
            </div>
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase">
                {priority}
            </span>
        </motion.div>
    );
};

// Activity Table Row
export const ActivityRow = ({ patient, examType, date, status, index }) => {
    const statusStyles = {
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        inProgress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const statusLabels = {
        completed: 'Terminé',
        pending: 'En attente',
        critical: 'Critique',
        inProgress: 'En cours',
    };

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-brand-primary font-bold text-sm">
                            {patient.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{patient}</span>
                </div>
            </td>
            <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{examType}</td>
            <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{date}</td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
                    {statusLabels[status]}
                </span>
            </td>
        </motion.tr>
    );
};

// Activity Table
export const ActivityTable = ({ activities }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-brand-primary" />
                    Activité Récente
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type Examen</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                            <ActivityRow key={index} {...activity} index={index} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default { StatCard, CriticalAlert, ActivityTable, ActivityRow };
