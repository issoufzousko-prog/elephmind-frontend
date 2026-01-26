import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Hero />
            <Features />
        </motion.div>
    );
};

export default Home;
