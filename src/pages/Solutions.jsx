import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Eye, Brain, Heart, Globe, Users, Zap,
    Target, Sparkles, ArrowRight, CheckCircle,
    Stethoscope, Bot, MessageSquare, Shield
} from 'lucide-react';

const Solutions = () => {
    return (
        <div className="bg-transparent min-h-screen">
            {/* Hero Section - Vision */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-block py-2 px-4 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6 uppercase tracking-widest">
                            Notre Vision
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark dark:text-white mb-8 leading-tight">
                            La Médecine <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">2.0</span>
                            <br />pour l'Afrique
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-10">
                            Chez <strong className="text-brand-dark dark:text-white">ElephMind</strong>, nous croyons que l'intelligence artificielle
                            peut révolutionner l'accès aux soins médicaux sur le continent africain.
                            Notre mission : <em>rendre la médecine de pointe accessible à tous</em>.
                        </p>
                    </motion.div>

                    {/* Founder Quote */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="max-w-3xl mx-auto mt-12"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 dark:border-gray-700">
                            <div className="flex items-start gap-6">
                                <div className="shrink-0">
                                    <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        ZN
                                    </div>
                                </div>
                                <div>
                                    <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed mb-4">
                                        "J'ai grandi en voyant des patients attendre des semaines pour un diagnostic qui aurait pu être fait en minutes.
                                        Avec ElephMind, nous créons les outils qui auraient pu sauver ces vies.
                                        L'IA n'est pas là pour remplacer les médecins, mais pour leur donner des super-pouvoirs."
                                    </blockquote>
                                    <div>
                                        <p className="font-bold text-brand-dark dark:text-white">Zousko Nicanor</p>
                                        <p className="text-sm text-gray-500">Fondateur & CEO, ElephMind</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Mission Pillars */}
            <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-4">Nos Piliers</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Trois valeurs fondamentales guident chacune de nos décisions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Heart className="h-8 w-8" />,
                                title: "Accessibilité",
                                description: "Réduire les inégalités d'accès aux soins. Nos outils fonctionnent même avec une connexion limitée.",
                                color: "from-red-500 to-pink-500"
                            },
                            {
                                icon: <Shield className="h-8 w-8" />,
                                title: "Fiabilité",
                                description: "Chaque prédiction est calibrée et validée. Nous ne promettons que ce que nous pouvons livrer.",
                                color: "from-brand-primary to-emerald-500"
                            },
                            {
                                icon: <Users className="h-8 w-8" />,
                                title: "Collaboration",
                                description: "L'IA assiste, le médecin décide. Nous renforçons l'expertise humaine, nous ne la remplaçons pas.",
                                color: "from-blue-500 to-indigo-500"
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-shadow"
                            >
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${pillar.color} text-white mb-6`}>
                                    {pillar.icon}
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{pillar.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{pillar.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product 1: Oeil d'Eléphant */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Eye className="h-4 w-4" />
                                <span>Disponible Maintenant</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-brand-dark dark:text-white mb-6">
                                Oeil d'Eléphant
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Notre système de vision par IA qui "voit" au-delà du pixel.
                                Spécialisé en <strong>pneumologie</strong>, <strong>orthopédie</strong>,
                                <strong> dermatologie</strong>, <strong>histologie</strong> et <strong>ophtalmologie</strong>.
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Analyse d'images médicales en secondes",
                                    "Visualisation Grad-CAM++ pour l'explicabilité",
                                    "Score de priorité clinique automatique",
                                    "7 algorithmes d'intelligence intégrés",
                                    "Détection précoce des pathologies"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 bg-brand-dark dark:bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-primary dark:hover:bg-brand-dark transition-colors shadow-lg"
                            >
                                Essayer Maintenant
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-brand-primary/20 to-emerald-500/20 rounded-3xl p-8 backdrop-blur-sm">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <span className="ml-2 text-sm text-gray-500">Station Médicale ElephMind</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pneumonie Virale</span>
                                            <span className="text-sm font-bold text-green-600">87%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Normal</span>
                                            <span className="text-sm text-gray-500">8%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Autres</span>
                                            <span className="text-sm text-gray-500">5%</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-500 font-bold text-xs uppercase">🚨 Priorité Élevée</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Consultation spécialisée recommandée sous 24h</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Product 2: BABA LLM */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="relative">
                                {/* Chat Interface Mockup */}
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-orange-500 rounded-full flex items-center justify-center">
                                            <Bot className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold">BABA</p>
                                            <p className="text-xs text-gray-400">Assistant IA Médical</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-xs text-gray-400">En ligne</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 bg-brand-accent rounded-full shrink-0 flex items-center justify-center text-xs font-bold">B</div>
                                            <div className="bg-gray-700/50 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                                <p className="text-sm">Bonjour ! Je suis BABA, votre assistant médical. Comment puis-je vous aider aujourd'hui ?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <div className="bg-brand-primary/80 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                                                <p className="text-sm">Je cherche des informations sur le paludisme chez l'enfant</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 bg-brand-accent rounded-full shrink-0 flex items-center justify-center text-xs font-bold">B</div>
                                            <div className="bg-gray-700/50 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                                                <p className="text-sm">Le paludisme pédiatrique est une urgence médicale en zone endémique. Voici les protocoles de l'OMS adaptés au contexte africain...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating features */}
                                <motion.div
                                    className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    🌍 Multilingue
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 bg-brand-accent/20 text-brand-accent px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                <Sparkles className="h-4 w-4" />
                                <span>Sortie Q3 2026</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
                                BABA <span className="text-brand-accent">LLM</span>
                            </h2>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Le premier Grand Modèle de Langage entraîné sur les contextes médicaux africains.
                                <strong className="text-white"> Multilingue</strong>, <strong className="text-white">contextuel</strong>,
                                et conçu pour les réalités du terrain.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {[
                                    { icon: <MessageSquare className="h-5 w-5" />, text: "Support Wolof, Dioula, Swahili..." },
                                    { icon: <Stethoscope className="h-5 w-5" />, text: "Protocoles OMS intégrés" },
                                    { icon: <Bot className="h-5 w-5" />, text: "Robot réceptionniste" },
                                    { icon: <Globe className="h-5 w-5" />, text: "Application mobile" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-300">
                                        <div className="text-brand-accent">{item.icon}</div>
                                        <span className="text-sm">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-brand-accent" />
                                    Applications Futures
                                </h4>
                                <ul className="space-y-3 text-gray-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                        <span><strong>Robot Réceptionniste</strong> : Accueil des patients, triage initial, prise de rendez-vous</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                        <span><strong>App Mobile</strong> : Consultation à distance pour zones rurales</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                        <span><strong>Formation & Tutorat</strong> : Aide à la formation des agents de santé communautaires. Tutorat personnalisé en fonction du profil pour nos futurs médecins.</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark dark:text-white mb-6">
                            Prêt à Rejoindre la Révolution ?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
                            Que vous soyez médecin, hôpital ou investisseur, nous voulons vous entendre.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/products"
                                className="px-8 py-4 bg-brand-dark dark:bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary dark:hover:bg-brand-dark transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <Eye className="h-5 w-5" />
                                Tester Oeil d'Eléphant
                            </Link>
                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-white dark:bg-gray-800 text-brand-dark dark:text-white border-2 border-brand-dark/10 dark:border-gray-700 rounded-xl font-bold hover:border-brand-primary transition-colors flex items-center justify-center gap-2"
                            >
                                Nous Contacter
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Solutions;
