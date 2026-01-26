import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // API URL from environment or default
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataBody = new URLSearchParams();
            formDataBody.append('username', formData.username);
            formDataBody.append('password', formData.password);

            const res = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formDataBody,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Erreur de connexion');
            }

            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            navigate('/app/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-light">
            {/* Background elements would go here */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Stethoscope className="h-8 w-8 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark">Accès Praticien</h2>
                    <p className="text-gray-500 text-sm mt-2">Connectez-vous à la suite ElephMind</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Identifiant Médical</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="ID Praticien"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                            <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline">Mot de passe oublié ?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-brand-primary transition-colors flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <span>Connexion...</span>
                        ) : (
                            <>
                                <span>Accéder au Dashboard</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
                            Pas encore de compte ? <Link to="/register" className="text-brand-primary font-bold hover:underline">S'inscrire</Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                        v2.0.0 (Production)
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
