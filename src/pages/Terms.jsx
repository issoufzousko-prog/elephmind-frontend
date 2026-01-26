import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-transparent py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link to="/" className="inline-flex items-center text-brand-primary hover:text-brand-dark mb-8 font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour à l'accueil
                    </Link>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-brand-primary/10 rounded-full">
                                <FileText className="h-8 w-8 text-brand-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-brand-dark">Conditions d'Utilisation</h1>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 mb-6">
                                <strong>Dernière mise à jour :</strong> Janvier 2026
                            </p>

                            {/* Important Warning */}
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                                <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-orange-800 mb-1">Avertissement Médical</h3>
                                    <p className="text-orange-700 text-sm">
                                        ElephMind est un outil d'aide au diagnostic. Ses résultats ne remplacent en aucun cas l'avis d'un professionnel de santé qualifié. Toute décision médicale doit être validée par un médecin.
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">1. Acceptation des Conditions</h2>
                            <p className="text-gray-600 mb-4">
                                En utilisant ElephMind, vous acceptez les présentes conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                            </p>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">2. Description du Service</h2>
                            <p className="text-gray-600 mb-4">
                                ElephMind fournit un service d'analyse d'images médicales assistée par intelligence artificielle (IA). Le service inclut :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Analyse d'images radiologiques (thorax, orthopédie, etc.)</li>
                                <li>Visualisation Grad-CAM++ pour l'explicabilité</li>
                                <li>Scores de priorité clinique</li>
                                <li>Génération de rapports automatiques</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">3. Limitations de Responsabilité</h2>
                            <p className="text-gray-600 mb-4">
                                ElephMind et ses créateurs ne peuvent être tenus responsables de :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Erreurs de diagnostic ou faux négatifs/positifs</li>
                                <li>Décisions médicales prises sur la base de nos résultats</li>
                                <li>Dommages indirects liés à l'utilisation du service</li>
                                <li>Interruptions de service ou pertes de données</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">4. Utilisation Acceptable</h2>
                            <p className="text-gray-600 mb-4">
                                Vous vous engagez à :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Utiliser le service uniquement à des fins légales</li>
                                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                                <li>Ne pas surcharger intentionnellement nos serveurs</li>
                                <li>Ne pas utiliser le service pour des images non médicales</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">5. Propriété Intellectuelle</h2>
                            <p className="text-gray-600 mb-4">
                                Le modèle SigLIP sous-jacent est développé par Google. ElephMind détient les droits sur l'interface, les algorithmes propriétaires et la marque.
                            </p>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">6. Contact</h2>
                            <p className="text-gray-600 mb-4">
                                Pour toute question :<br />
                                <strong>Email :</strong> <a href="mailto:zouskonicanor@gmail.com" className="text-brand-primary hover:underline">zouskonicanor@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
