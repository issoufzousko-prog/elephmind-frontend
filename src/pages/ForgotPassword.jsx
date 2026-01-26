import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, ArrowRight, HelpCircle, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Username, 2: Answer & Reset, 3: Fallback (Support)
    const [username, setUsername] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';

    // Step 1: Fetch Question
    const handleCheckUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/recover/${username}`);
            if (!res.ok) throw new Error("Utilisateur introuvable. Vérifiez l'identifiant.");
            const data = await res.json();
            setQuestion(data.question);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Answer & Reset
    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/recover/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    security_answer: answer,
                    new_password: newPassword
                })
            });

            if (!res.ok) {
                // If answer fails, maybe offer support?
                if (res.status === 400) {
                    setError("Réponse incorrecte.");
                    // Optional: If multiple failures, goToSupport()
                } else {
                    throw new Error("Erreur serveur.");
                }
                return;
            }

            // Success
            navigate('/login', { state: { message: 'Mot de passe réinitialisé ! Connectez-vous.' } });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const goToSupport = () => setStep(3);

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50"
            >
                <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-brand-primary/10 rounded-full mb-4">
                        <Key className="h-8 w-8 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark">Récupération</h2>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            onSubmit={handleCheckUser}
                            className="space-y-4"
                        >
                            <p className="text-center text-gray-500 text-sm mb-4">Entrez votre identifiant pour récupérer votre question de sécurité.</p>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                            <input
                                type="text"
                                placeholder="Identifiant (ex: admin)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-primary transition-all"
                            >
                                {loading ? 'Recherche...' : 'Continuer'}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            onSubmit={handleReset}
                            className="space-y-4"
                        >
                            <div className="bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10">
                                <p className="text-xs text-brand-primary font-bold uppercase mb-1">Question de Sécurité</p>
                                <p className="text-gray-800 font-medium">{question}</p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex justify-between items-center">
                                    <span>{error}</span>
                                    <button type="button" onClick={goToSupport} className="text-red-800 font-bold underline text-xs">Aide ?</button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Votre Réponse</label>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nouveau Mot de Passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-primary transition-all"
                            >
                                {loading ? 'Réinitialisation...' : 'Changer le Mot de Passe'}
                            </button>

                            <button
                                type="button"
                                onClick={goToSupport}
                                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-2"
                            >
                                Je ne connais pas la réponse
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                <HelpCircle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">Besoin d'aide ?</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    L'authentification automatique a échoué. Veuillez contacter le support directement pour vérifier votre identité manuellement.
                                </p>

                                <div className="space-y-3">
                                    <a href="mailto:zouskonicanor@gmail.com" className="flex items-center justify-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-brand-primary transition-colors">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="font-mono text-sm">zouskonicanor@gmail.com</span>
                                    </a>
                                    <a href="https://wa.me/2250585098478" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-colors text-green-800">
                                        <Phone className="h-5 w-5" />
                                        <span className="font-mono text-sm font-bold">WhatsApp: 05 85 09 84 78</span>
                                    </a>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm text-gray-500 underline hover:text-brand-primary"
                            >
                                Retour à la connexion
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
