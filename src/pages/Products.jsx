import React from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, ArrowRight, Brain, Lock } from 'lucide-react';
// MedicalAnalyzer moved to Dashboard (Private Route)

const Products = () => {
    return (
        <div className="bg-transparent min-h-screen">
            {/* Oeil d'Eléphant Section */}
            <section className="py-20 lg:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10"
                        >
                            <div className="inline-flex items-center space-x-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full font-semibold text-sm mb-6">
                                <Eye className="h-4 w-4" />
                                <span>Disponible Maintenant</span>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-extrabold text-brand-dark mb-6 leading-tight">
                                Oeil d'Eléphant
                            </h2>
                            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                                Le premier système d'IA conçu pour "voir" au-delà du pixel. Notre vision transformer est spécialisé en
                                <span className="text-brand-primary font-bold"> Orthopédie (Genoux)</span>,
                                <span className="text-brand-primary font-bold"> Pneumologie</span>,
                                <span className="text-brand-primary font-bold"> Dermatologie</span>,
                                <span className="text-brand-primary font-bold"> Histologie</span> et
                                <span className="text-brand-primary font-bold"> Ophtalmologie</span>,
                                détectant les anomalies invisibles à l'œil nu aux stades précoces.
                                <br />
                                <span className="text-xs text-gray-400 italic block mt-2">* Modèle optimisé pour adultes uniquement (Version pédiatrique en cours de développement)</span>
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Précision de 99.8% sur les radios thoraciques",
                                    "Visualisation Heatmap en temps réel (Grad-CAM++)",
                                    "Détection des plaques de croissance pédiatriques",
                                    "Score de Priorité de Triage Intégré"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-brand-dark/80">
                                        <CheckCircle className="h-5 w-5 text-brand-primary shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="bg-brand-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-primary transition-colors duration-300 flex items-center">
                                Demander une Démo
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </motion.div>

                        {/* Visual Representation (Placeholder for 3D/Image) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-20 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 text-center"
                        >
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="h-10 w-10 text-brand-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-2">Espace Clinique Sécurisé</h3>
                                <p className="text-gray-500">
                                    L'accès à l'outil de diagnostic IA nécessite une authentification médicale vérifiée.
                                </p>
                            </div>

                            <a
                                href="/login"
                                className="inline-flex items-center space-x-2 bg-brand-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-primary transition-colors duration-300 w-full justify-center"
                            >
                                <span>Accéder à la Plateforme</span>
                                <ArrowRight className="h-5 w-5" />
                            </a>

                            <p className="mt-4 text-xs text-gray-400">
                                Conforme RGPD & HDS
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* BABA Section */}
            <section className="py-20 bg-brand-dark/95 backdrop-blur-sm text-white relative overflow-hidden mt-12 rounded-t-[3rem]">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    {/* Abstract or pattern background could go here */}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-block p-4 rounded-full bg-brand-accent/20 mb-6">
                            <Brain className="h-10 w-10 text-brand-accent" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Présentation de BABA</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            Le premier Grand Modèle de Langage spécifiquement entraîné sur les contextes médicaux africains,
                            les langues locales et les protocoles de santé. Combler le fossé de communication technologique.
                        </p>

                        <div className="inline-flex items-center space-x-2 px-6 py-2 border border-brand-accent/50 rounded-full text-brand-accent bg-brand-accent/5">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
                            </span>
                            <span className="font-mono uppercase tracking-widest text-sm">Sortie Q3 2026</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Products;
