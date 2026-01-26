import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const InteractiveEye = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [pupilSize, setPupilSize] = useState(1);
    const eyeRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Calculate normalized position (-1 to 1) relative to window center
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Pupil dilation on hover
    useEffect(() => {
        if (isHovering) {
            setPupilSize(1.3);
        } else {
            setPupilSize(1);
        }
    }, [isHovering]);

    return (
        <div
            ref={eyeRef}
            className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            role="img"
            aria-label="Oeil interactif d'ElephMind - suivez avec la souris"
        >
            {/* Outer Glow - Pulsing */}
            <motion.div
                className="absolute inset-0 bg-brand-primary/20 blur-[80px] rounded-full"
                animate={{
                    scale: isHovering ? [1, 1.1, 1] : 1,
                    opacity: isHovering ? 0.4 : 0.3
                }}
                transition={{
                    repeat: isHovering ? Infinity : 0,
                    duration: 2,
                    ease: "easeInOut"
                }}
            />

            {/* Outer Ring - Rotating data visualization */}
            <svg className="w-full h-full text-brand-dark/10 absolute top-0 left-0" viewBox="0 0 100 100">
                <motion.circle
                    cx="50" cy="50" r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50px", originY: "50px" }}
                />
                <motion.circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    strokeDasharray="2 6"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "50px", originY: "50px" }}
                />
            </svg>

            {/* Tech data points orbiting */}
            <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-brand-primary/40 rounded-full"
                        style={{
                            top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                            left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </motion.div>

            {/* The Eye Sclera */}
            <motion.div
                className="relative w-48 h-48 md:w-64 md:h-64 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden"
                animate={{
                    borderColor: isHovering ? "rgba(27, 125, 125, 0.5)" : "rgba(255, 255, 255, 0.2)"
                }}
                transition={{ duration: 0.3 }}
            >
                {/* Iris */}
                <motion.div
                    className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-brand-primary via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-inner"
                    animate={{
                        x: mousePosition.x * 25,
                        y: mousePosition.y * 25,
                        scale: isHovering ? 1.05 : 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    {/* Iris detail - radial lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                        {[...Array(12)].map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="15"
                                x2="50" y2="35"
                                stroke="rgba(0,0,0,0.3)"
                                strokeWidth="1"
                                transform={`rotate(${i * 30} 50 50)`}
                            />
                        ))}
                    </svg>

                    {/* Pupil */}
                    <motion.div
                        className="w-8 h-8 md:w-12 md:h-12 bg-black rounded-full relative flex items-center justify-center"
                        animate={{
                            scale: pupilSize,
                            width: isHovering ? "3.5rem" : "3rem",
                            height: isHovering ? "3.5rem" : "3rem"
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Light reflection - main */}
                        <div className="absolute top-1 right-2 w-3 h-3 bg-white rounded-full opacity-70" />
                        {/* Light reflection - secondary */}
                        <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-40" />

                        {/* AI scanning effect on hover */}
                        {isHovering && (
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-brand-primary/50"
                                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                    </motion.div>

                    {/* Iris outer ring detail */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-brand-dark/20 opacity-50" />
                </motion.div>

                {/* Reflection/Gloss on sclera */}
                <motion.div
                    className="absolute top-6 left-6 w-16 h-8 bg-white/25 rounded-full -rotate-45 blur-[3px]"
                    animate={{
                        x: mousePosition.x * -5,
                        y: mousePosition.y * -5,
                        opacity: isHovering ? 0.4 : 0.25
                    }}
                />
            </motion.div>

            {/* Tooltip on hover */}
            <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isHovering ? 1 : 0, y: isHovering ? 0 : -10 }}
            >
                Suivez-moi avec votre souris 👁️
            </motion.div>
        </div>
    );
};

export default InteractiveEye;
