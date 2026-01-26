import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, Plus, Filter, UserCircle, Calendar,
    Phone, Mail, ChevronRight, ChevronLeft, Eye, FileText as FileTextIcon,
    SortAsc, SortDesc, X
} from 'lucide-react';

// Les patients seront chargés depuis l'API backend
// L'application démarre vide - les radiologues ajoutent les patients via le formulaire

// Patient Card Component
const PatientCard = ({ patient, index }) => {
    const statusStyles = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };

    const getAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        return Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-brand-primary/30 transition-all group"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {patient.firstName?.[0] || '?'}{patient.lastName?.[0] || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{patient.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[patient.status]}`}>
                            {patient.status === 'active' ? 'Actif' : patient.status === 'critical' ? 'Critique' : 'Inactif'}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {getAge(patient.birthDate)} ans
                        </span>
                        <span className="flex items-center gap-1">
                            <FileTextIcon className="h-4 w-4" />
                            {patient.totalExams} examens
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Dernier examen: {patient.lastExam}
                </span>
                <Link
                    to={`/app/patients/${patient.id}`}
                    className="flex items-center gap-1 text-brand-primary font-medium text-sm group-hover:gap-2 transition-all"
                >
                    Voir dossier <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </motion.div>
    );
};

// New Patient Modal
const NewPatientModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        phone: '',
        email: '',
        photo: null
    });
    const [photoPreview, setPhotoPreview] = React.useState(null);

    // Cleanup ObjectURL
    React.useEffect(() => {
        if (formData.photo) {
            const url = URL.createObjectURL(formData.photo);
            setPhotoPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPhotoPreview(null);
        }
    }, [formData.photo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau Patient</h2>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Photo Upload */}
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Patient" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <UserCircle className="h-10 w-10 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo (optionnel)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:font-medium hover:file:bg-brand-primary/90"
                                        onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="Amadou"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="Koné"
                                />
                            </div>
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance *</label>
                            <input
                                type="date"
                                required
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                            />
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="+223 70 00 00 00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                    placeholder="patient@email.com"
                                />
                            </div>
                        </div>

                        {/* Patient ID (auto-generated) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Patient</label>
                            <input
                                type="text"
                                disabled
                                value="PAT-2026-XXXXXX (auto-généré)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors"
                            >
                                Créer le patient
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Patient Detail Component
const PatientDetail = ({ patient, onBack }) => {
    if (!patient) return (
        <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Patient introuvable</h3>
            <button onClick={onBack} className="mt-4 text-brand-primary hover:underline">
                Retour à la liste
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Back */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {patient.firstName} {patient.lastName}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        ID: {patient.id} • Né(e) le {new Date(patient.birthDate).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Coordonnées</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Phone className="h-5 w-5 text-brand-primary" />
                                <span>{patient.phone || 'Non renseigné'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Mail className="h-5 w-5 text-brand-primary" />
                                <span>{patient.email || 'Non renseigné'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Calendar className="h-5 w-5 text-brand-primary" />
                                <span>{new Date(patient.birthDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Exams History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historique des Examens</h2>
                            <Link to="/app/analysis" className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Nouvel examen
                            </Link>
                        </div>

                        {(!patient.exams || patient.exams.length === 0) ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                                <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Aucun examen enregistré</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patient.exams.map((exam, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <FileTextIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{exam.type || 'Analyse IA'}</p>
                                                <p className="text-xs text-gray-500">{new Date(exam.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                Complet
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Patients Page
import { usePatients } from '../context/PatientContext';
import { useParams, useNavigate } from 'react-router-dom';

const Patients = () => {
    const { patients, addPatient } = usePatients();
    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();

    // Derived state for filtered list
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('lastName');
    const [sortOrder, setSortOrder] = useState('asc');

    // If ID is present, find the patient
    const selectedPatient = id ? patients.find(p => p.id === id) : null;

    // Handle back to list
    const handleBack = () => navigate('/app/patients');

    // New Patient Modal Wrapper
    const handleAddPatient = (patientData) => {
        addPatient({
            ...patientData,
            status: 'active',
            totalExams: 0,
            lastExam: 'Jamais',
            exams: [] // Initialize exams array
        });
        setIsModalOpen(false);
    };

    // If selecting a patient, show detail view
    if (id) {
        return <PatientDetail patient={selectedPatient} onBack={handleBack} />;
    }

    // Otherwise render list view
    const filteredPatients = patients
        .filter(p =>
            (p.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (p.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (p.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dossiers Patients</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} enregistré{filteredPatients.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25"
                >
                    <Plus className="h-5 w-5" />
                    Nouveau Patient
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                        Trier
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Filter className="h-5 w-5" />
                        Filtrer
                    </button>
                </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPatients.map((patient, index) => (
                    <PatientCard key={patient.id} patient={patient} index={index} />
                ))}
            </div>

            {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                    <UserCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun patient trouvé</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Essayez une autre recherche ou créez un nouveau patient.</p>
                </div>
            )}

            {/* New Patient Modal */}
            <NewPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddPatient}
            />
        </div>
    );
};

export default Patients;
