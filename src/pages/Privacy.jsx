import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
                                <Shield className="h-8 w-8 text-brand-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-brand-dark">Politique de Confidentialité</h1>
                        </div>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 mb-6">
                                <strong>Dernière mise à jour :</strong> Janvier 2026
                            </p>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">1. Collecte des Données</h2>
                            <p className="text-gray-600 mb-4">
                                ElephMind collecte uniquement les données nécessaires au fonctionnement du service :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Identifiant et mot de passe (hashé avec bcrypt)</li>
                                <li>Adresse email (optionnelle)</li>
                                <li>Images médicales soumises pour analyse (traitées et supprimées)</li>
                                <li>Logs d'audit pour la traçabilité</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">2. Utilisation des Données</h2>
                            <p className="text-gray-600 mb-4">
                                Vos données sont utilisées exclusivement pour :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Fournir le service d'analyse médicale par IA</li>
                                <li>Améliorer la précision de nos modèles (données anonymisées)</li>
                                <li>Vous contacter en cas de besoin (si email fourni)</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">3. Sécurité</h2>
                            <p className="text-gray-600 mb-4">
                                Nous mettons en œuvre des mesures de sécurité robustes :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li>Chiffrement Fernet pour les données sensibles</li>
                                <li>Tokens JWT avec expiration</li>
                                <li>Hashage bcrypt des mots de passe</li>
                                <li>CORS restrictif en production</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">4. Vos Droits (RGPD)</h2>
                            <p className="text-gray-600 mb-4">
                                Conformément au RGPD, vous disposez des droits suivants :
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                                <li><strong>Accès :</strong> Demander une copie de vos données</li>
                                <li><strong>Rectification :</strong> Corriger vos informations</li>
                                <li><strong>Suppression :</strong> Demander l'effacement de vos données</li>
                                <li><strong>Portabilité :</strong> Recevoir vos données dans un format lisible</li>
                            </ul>

                            <h2 className="text-xl font-bold text-brand-dark mt-8 mb-4">5. Contact</h2>
                            <p className="text-gray-600 mb-4">
                                Pour toute question relative à cette politique :<br />
                                <strong>Email :</strong> <a href="mailto:zouskonicanor@gmail.com" className="text-brand-primary hover:underline">zouskonicanor@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
