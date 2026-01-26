import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Shield, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        security_question: 'Quel est le nom de votre premier animal de compagnie ?',
        security_answer: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const questions = [
        "Quel est le nom de votre premier animal de compagnie ?",
        "Dans quelle ville êtes-vous né ?",
        "Quel est le nom de jeune fille de votre mère ?",
        "Quel est votre plat préféré ?",
        "Quel est le nom de votre école primaire ?"
    ];

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Erreur lors de l\'inscription');
            }

            navigate('/login', { state: { message: 'Compte créé avec succès ! Connectez-vous.' } });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-lg border border-white/50"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-brand-dark">Créer un Compte</h2>
                    <p className="text-gray-500 text-sm mt-2">Rejoignez la communauté ElephMind</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optionnel)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de Passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label htmlFor="security_question" className="block text-sm font-medium text-brand-dark mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-brand-primary" aria-hidden="true" /> Question de Sécurité (Récupération)
                        </label>
                        <select
                            id="security_question"
                            name="security_question"
                            value={formData.security_question}
                            onChange={handleChange}
                            className="w-full p-3 mb-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm"
                        >
                            {questions.map((q, i) => (
                                <option key={i} value={q}>{q}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            id="security_answer"
                            name="security_answer"
                            placeholder="Votre réponse..."
                            value={formData.security_answer}
                            onChange={handleChange}
                            className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-primary transition-all mt-6 shadow-lg hover:shadow-brand-primary/25 disabled:opacity-70"
                    >
                        {loading ? 'Création...' : "S'inscrire"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Déjà un compte ? <Link to="/login" className="text-brand-primary font-bold hover:underline">Se connecter</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
