import React from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Activity, Users, Globe, Microchip } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-transparent min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-6 leading-tight">
                            L'Intelligence Artificielle au Service de <span className="text-brand-primary">l'Expertise Médicale</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                            ElephMind n'est pas seulement un algorithme. C'est la fusion entre des millions de données cliniques et la puissance des Vision Transformers, conçue pour assister, et non remplacer.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-12 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-gray-200 rounded-3xl h-96 w-full flex items-center justify-center relative overflow-hidden group"
                        >
                            {/* Abstract 'Radiologist & AI' representation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark to-brand-primary opacity-80 z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                                alt="Radiologue travaillant avec IA"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="relative z-20 text-white text-center p-8">
                                <Activity className="h-16 w-16 mx-auto mb-4 text-white/80" />
                                <h3 className="text-2xl font-bold">Symbiose Homme-Machine</h3>
                            </div>
                        </motion.div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                                    <Globe className="text-brand-primary" />
                                    Notre Mission
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Démocratiser l'accès au diagnostic de pointe. Dans les zones où les radiologues manquent, ElephMind agit comme un filtre de triage, permettant de traiter les urgences plus vite et avec plus de précision.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                                    <Microchip className="text-brand-primary" />
                                    Technologie
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Basé sur l'architecture <strong>SigLIP (Sigmoid Loss for Language Image Pre-Training)</strong>, notre modèle ne se contente pas de classer. Il comprend la structure anatomique grâce à un entraînement multimodal (Texte + Image).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data & Training */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-brand-dark text-center mb-16">Données et Entraînement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-brand-primary/30 transition-colors">
                            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Database className="text-blue-600 h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-bold text-brand-dark mb-2">3.5 Millions d'Images</h4>
                            <p className="text-gray-500 text-sm">
                                Entraîné sur des datasets diversifiés (MIMIC-CXR, CheXpert, PadChest) pour garantir une robustesse face aux variations ethniques et techniques.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-brand-primary/30 transition-colors">
                            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="text-orange-600 h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-bold text-brand-dark mb-2">Validation Clinique</h4>
                            <p className="text-gray-500 text-sm">
                                Les prédictions sont calibrées par des radiologues experts. Chaque heatmap est vérifiée pour s'assurer que l'IA ne "triche" pas en regardant des artefacts.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-brand-primary/30 transition-colors">
                            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <Users className="text-green-600 h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-bold text-brand-dark mb-2">Éthique & Privacy</h4>
                            <p className="text-gray-500 text-sm">
                                Aucune donnée patient n'est stockée de manière persistante sans anonymisation stricte. Nous respectons les standards RGPD et HIPAA.
                                <br /><span className="text-xs font-semibold text-brand-primary mt-1 block">Version Adulte Uniquement.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
