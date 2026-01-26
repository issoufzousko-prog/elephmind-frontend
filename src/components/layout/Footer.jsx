import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <BrainCircuit className="h-8 w-8 text-brand-primary" aria-hidden="true" />
                            <span className="text-2xl font-bold tracking-tight">
                                Eleph<span className="text-brand-primary">Mind</span>
                            </span>
                        </div>
                        <p className="text-gray-400 max-w-sm mb-6">
                            Pionnier de l'avenir du diagnostic médical grâce à l'Intelligence Artificielle avancée.
                            Faire le pont entre l'héritage et la santé high-tech.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-primary/20 transition-colors" aria-label="GitHub">
                                <svg className="h-5 w-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-primary/20 transition-colors" aria-label="LinkedIn">
                                <svg className="h-5 w-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-primary">Plateforme</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/products" className="hover:text-white transition-colors">Oeil d'Eléphant</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">BABA LLM</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">À Propos</Link></li>
                            <li><Link to="/solutions" className="hover:text-white transition-colors">Notre Vision</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-primary">Contact</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                                <a href="mailto:zouskonicanor@gmail.com" className="hover:text-white transition-colors">
                                    zouskonicanor@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                                <a href="https://wa.me/2250585098478" className="hover:text-white transition-colors">
                                    +225 05 85 09 84 78
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                                <span>Abidjan, Côte d'Ivoire 🇨🇮</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>© 2026 ElephMind AI. Tous droits réservés.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Conditions d'Utilisation</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
