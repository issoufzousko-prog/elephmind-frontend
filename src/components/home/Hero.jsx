import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveEye from '../ui/InteractiveEye';

const Hero = () => {
    return (
        <div className="relative overflow-hidden pt-12 lg:pt-20 pb-16 lg:pb-24 min-h-[90vh] flex items-center">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl opacity-50 animate-pulse"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6 tracking-wide uppercase">
                            L'Avenir du Diagnostic IA
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight mb-8 leading-tight">
                            L'Intelligence Médicale, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">
                                Réinventée.
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            ElephMind allie la sagesse de l'héritage aux réseaux de neurones de pointe.
                            Découvrez <strong>Oeil d'Eléphant</strong> et <strong>BABA</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to="/solutions" className="w-full sm:w-auto px-8 py-4 bg-brand-dark text-white rounded-lg font-bold text-lg hover:bg-brand-primary transition-all duration-300 shadow-xl shadow-brand-dark/20 flex items-center justify-center group">
                                Découvrir nos Solutions
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-dark border-2 border-brand-dark/5 rounded-lg font-bold text-lg hover:border-brand-dark/20 transition-all duration-300 flex items-center justify-center">
                                Contacter un Expert
                            </Link>
                        </div>
                    </motion.div>

                    {/* Interactive Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="flex items-center justify-center"
                    >
                        <InteractiveEye />
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Hero;
