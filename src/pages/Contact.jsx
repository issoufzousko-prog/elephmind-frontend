import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMsg('');

        try {
            // Using Formspree or EmailJS would require an API key
            // For now, we'll simulate sending and use mailto as fallback
            const mailtoLink = `mailto:zouskonicanor@gmail.com?subject=Contact ElephMind - ${formData.firstName} ${formData.lastName}&body=${encodeURIComponent(
                `Nom: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            )}`;

            // Open mail client
            window.location.href = mailtoLink;

            // Mark as success after a delay (simulating send)
            setTimeout(() => {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', message: '' });
            }, 1000);

        } catch (err) {
            setStatus('error');
            setErrorMsg('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-extrabold text-brand-dark sm:text-5xl">
                        Contactez-nous
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Prêt à intégrer nos solutions d'IA ? Nous sommes là pour vous aider.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20"
                    >
                        <h3 className="text-2xl font-bold text-brand-dark mb-6">Informations</h3>
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-primary/10 p-3 rounded-lg">
                                    <Mail className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-dark">Email</p>
                                    <a href="mailto:zouskonicanor@gmail.com" className="text-gray-500 hover:text-brand-primary transition-colors">
                                        zouskonicanor@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-primary/10 p-3 rounded-lg">
                                    <Phone className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-dark">WhatsApp</p>
                                    <a href="https://wa.me/2250585098478" className="text-gray-500 hover:text-brand-primary transition-colors">
                                        05 85 09 84 78
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-brand-primary/10 p-3 rounded-lg">
                                    <MapPin className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-dark">Bureaux</p>
                                    <p className="text-gray-500">Pas encore de bureau physique</p>
                                    <p className="text-gray-500">Abidjan, Côte d'Ivoire 🇨🇮</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-4">Suivez-nous</p>
                            <div className="flex gap-3">
                                <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-brand-primary/10 transition-colors" aria-label="LinkedIn">
                                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-brand-primary/10 transition-colors" aria-label="Twitter">
                                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20"
                    >
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-brand-dark mb-2">Message Envoyé !</h3>
                                <p className="text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-brand-primary font-medium hover:underline"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === 'error' && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-white/50 px-4 py-2"
                                            placeholder="Jean"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-white/50 px-4 py-2"
                                            placeholder="Kouassi"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-white/50 px-4 py-2"
                                        placeholder="jean@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-white/50 px-4 py-2"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-dark hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                Envoyer le Message <Send className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
