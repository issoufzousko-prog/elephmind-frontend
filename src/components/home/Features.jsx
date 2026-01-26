import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, Database, Cpu } from 'lucide-react';

const features = [
    {
        icon: <Eye className="h-8 w-8 text-white" />,
        title: "Oeil d'Eléphant",
        description: "Notre vision transformer phare pour la pneumologie et l'orthopédie. Détecte les pathologies avec une précision surhumaine.",
        color: "bg-brand-primary"
    },
    {
        icon: <MessageSquare className="h-8 w-8 text-white" />,
        title: "BABA LLM",
        description: "Un Grand Modèle de Langage (LLM) spécialisé dans les contextes médicaux africains et le support multilingue.",
        color: "bg-brand-accent"
    },
    {
        icon: <Database className="h-8 w-8 text-white" />,
        title: "Data Lake Sécurisé",
        description: "Stockage unifié des données patients avec apprentissage fédéré pour une amélioration continue du modèle.",
        color: "bg-gray-800"
    },
    {
        icon: <Cpu className="h-8 w-8 text-white" />,
        title: "Inférence Edge",
        description: "Exécutez des modèles de diagnostic directement sur du matériel local, sans connexion internet fiable.",
        color: "bg-indigo-600"
    }
];

const Features = () => {
    return (
        <div className="py-20 bg-white/40 backdrop-blur-lg border-t border-brand-dark/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-brand-dark sm:text-4xl">
                        Notre Écosystème Technologique
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Conçu pour la robustesse, adapté à la réalité.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative group p-6 bg-white/60 rounded-2xl border border-gray-100 hover:border-brand-primary/20 hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 ${feature.color} rounded-2xl shadow-lg flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform`}>
                                {feature.icon}
                            </div>
                            <div className="mt-12 text-center">
                                <h3 className="text-xl font-bold text-brand-dark mb-2">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
