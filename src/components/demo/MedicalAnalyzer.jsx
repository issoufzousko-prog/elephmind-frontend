import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, AlertCircle, FileText, CheckCircle2, Stethoscope, Microscope, Lock, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const MedicalAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState('idle'); // idle, sending, sent, error
    const [processingStep, setProcessingStep] = useState(0); // Progress indicator
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');


    // API URL from environment or default
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8022';

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        // Reset state
        setResult(null);
        setError(null);
        setStatus('idle');

        // Allow Image or DICOM
        const isImage = selectedFile.type.startsWith('image/');
        const isDicom = selectedFile.name.toLowerCase().endsWith('.dcm');

        if (!isImage && !isDicom) {
            setError("Format non supporté. Veuillez utiliser PNG, JPEG ou DICOM (.dcm).");
            return;
        }

        setFile(selectedFile);

        if (isImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            // Placeholder/Icon for DICOM since browsers can't render it natively without heavy libraries
            // We'll show a generic medical file icon
            setPreview('dicom_placeholder');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setStatus('uploading');
        setUploadProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (uploadRes.status === 401) {
                setError("Session expirée. Veuillez vous reconnecter.");
                setTimeout(() => navigate('/login'), 2000);
                return;
            }


            if (!uploadRes.ok) {
                throw new Error(`Erreur serveur: ${uploadRes.statusText}`);
            }

            const { task_id } = await uploadRes.json();
            setStatus('processing');
            setProcessingStep(1); // Start at step 1 (Prétraitement)

            // Start step progression simulation
            const stepInterval = setInterval(() => {
                setProcessingStep(prev => {
                    if (prev < 4) return prev + 1;
                    clearInterval(stepInterval);
                    return prev;
                });
            }, 2000); // Advance every 2 seconds

            // 2. Poll for Results
            pollResult(task_id);

        } catch (err) {
            console.error(err);
            setError(err.message || "Une erreur est survenue lors de l'analyse.");
            setStatus('error');
        }
    };

    const pollResult = async (taskId) => {
        let failures = 0;
        const maxFailures = 20; // Allow 20 failures (e.g. 20 * 2s = 40s of downtime tolerance)

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/result/${taskId}`);

                // If 500 or 404 momentarily, we might count as failure but continue
                if (!res.ok) {
                    failures++;
                    console.warn(`Polling failed (${res.status}). Attempt ${failures}/${maxFailures}`);
                    if (failures >= maxFailures) throw new Error("Erreur de connexion serveur (Timeout)");
                    return;
                }

                failures = 0; // Reset failures on success
                const data = await res.json();

                if (data.status === 'completed') {
                    clearInterval(interval);
                    setProcessingStep(5); // Complete all steps
                    setResult(data.result);
                    setStatus('completed');
                    // Play notification sound
                    try {
                        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleUECAIrV8teleT4BAHTL8dSTWz8AAGWv5MqRXjsAAFms4s2RazUAAEmn3seMaTIAADye2cyNazUAAC+Y0smMbTYAACiT0cuNbzYAACGN0M6RcjYAABqHz9KVdzYAABSBydeadzkAAA180+Cfe0AAAB130OelgEIAABtx0OerhEYAAB9t0fGwh0gAACZo0ve2i0sAACxk0/y8kE8AADJh1AG/lVQAACRe1QXCmVcAAB5c1grFnVsAABhX1w7JpGEAABhZ2BXKpGEAABVW1hfKo2YA');
                        audio.volume = 0.3;
                        audio.play().catch(() => { }); // Ignore errors if autoplay blocked
                    } catch (e) { }
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    if (data.error && data.error.includes("Unknown image format")) {
                        setError("Format d'image non reconnu. Assurez-vous d'envoyer un DICOM ou une image valide.");
                    } else {
                        setError(data.error || "L'analyse a échoué.");
                    }
                    setStatus('error');
                }
                // If pending, continue
            } catch (err) {
                console.error("Polling error:", err);
                failures++;
                if (failures >= maxFailures) {
                    clearInterval(interval);
                    setError("Le serveur ne répond pas. Veuillez réessayer.");
                    setStatus('error');
                }
            }
        }, 2000); // Check every 2 seconds
    };

    const submitFeedback = async () => {
        if (feedbackRating === 0) return;
        setFeedbackStatus('sending');

        // Get username from token (simple decode or just send anonymous if backend handles it)
        // For prototype, we'll extract from token payload or just send "user"
        let username = "anonymous";
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            username = payload.sub;
        } catch (e) { }

        try {
            await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    rating: feedbackRating,
                    comment: feedbackComment
                })
            });
            setFeedbackStatus('sent');
        } catch (e) {
            console.error(e);
            setFeedbackStatus('error');
        }
    };


    const clearAll = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setStatus('idle');
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFeedbackStatus('idle');
        setFeedbackRating(0);
        setFeedbackComment('');
    };


    return (
        <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-brand-primary" />
                            Interface Clinique
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Analyse Standardisée (DICOM/PNG)</p>
                    </div>
                    {status === 'idle' && (
                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold border border-green-500/20">
                            Système Prêt
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors duration-300 group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Microscope className="h-8 w-8 text-gray-400 group-hover:text-brand-primary transition-colors" />
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Glissez un fichier DICOM (.dcm) ou une image
                            </p>
                            <p className="text-sm text-gray-400">
                                Supporte le fenêtrage automatique (-600/1500)
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,.dcm"
                                className="hidden"
                            />
                        </motion.div>
                    ) : !token ? (
                        <div className="text-center p-8 border border-dashed border-red-200 bg-red-50 rounded-xl">
                            <Lock className="h-10 w-10 text-red-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-red-800">Authentification Requise</h3>
                            <p className="text-sm text-red-600 mb-4">Vous devez être connecté pour utiliser l'IA Médicale.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-brand-dark text-white rounded-lg font-bold hover:bg-brand-primary transition-colors"
                            >
                                Se Connecter
                            </button>
                        </div>
                    ) : (
                        <motion.div

                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center group border border-gray-700">
                                {preview === 'dicom_placeholder' ? (
                                    <div className="text-center text-gray-400">
                                        <FileText className="h-16 w-16 mx-auto mb-2 text-brand-primary" />
                                        <p className="font-mono text-sm">{file.name}</p>
                                        <p className="text-xs mt-1 text-gray-500">Fichier DICOM Détecté</p>
                                    </div>
                                ) : (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                )}

                                {status === 'idle' && (
                                    <button
                                        onClick={clearAll}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {status === 'idle' && (
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold text-lg hover:bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/25 active:scale-[0.98]"
                                >
                                    Lancer l'Analyse Clinique
                                </button>
                            )}

                            {status === 'processing' || status === 'uploading' ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-10 w-10 text-brand-primary animate-spin mx-auto mb-4" aria-hidden="true" />
                                    <p className="text-lg font-medium text-brand-dark dark:text-white">
                                        Traitement Radiologique en Cours...
                                    </p>

                                    {/* Step Progress Indicator */}
                                    <div className="mt-6 max-w-md mx-auto">
                                        {(() => {
                                            const steps = [
                                                { name: 'Upload', key: 0 },
                                                { name: 'Prétraitement', key: 1 },
                                                { name: 'Détection Domaine', key: 2 },
                                                { name: 'Analyse IA', key: 3 },
                                                { name: 'Génération Heatmap', key: 4 }
                                            ];
                                            return (
                                                <>
                                                    <div className="flex gap-1 mb-2">
                                                        {steps.map((step, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= processingStep
                                                                    ? 'bg-brand-primary'
                                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {steps[Math.min(processingStep, steps.length - 1)]?.name || 'En attente...'}
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <p className="text-xs text-gray-400 mt-4">Lecture DICOM • Fenêtrage • Inférence SigLIP</p>
                                </div>
                            ) : null}

                            {status === 'completed' && result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl border border-brand-primary/20 p-6 shadow-xl"
                                >
                                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                        <div>
                                            <h4 className="font-bold text-lg text-brand-dark dark:text-white">
                                                Rapport IA Généré
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Zone : {result.domain.label} (Confiance : {result.domain.probability}%)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {result.heatmap && (
                                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <h5 className="font-bold text-sm text-brand-dark dark:text-white mb-2 flex items-center justify-between">
                                                    <span>Visualisation Grad-CAM++ (Explicabilité)</span>
                                                    <span className="text-xs font-normal text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">BÊTA</span>
                                                </h5>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Les zones rouges indiquent où l'IA a "regardé" pour prendre sa décision.
                                                    Utile pour détecter les biais (ex: l'IA regarde un fil au lieu du poumon).
                                                </p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Original Image */}
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-semibold text-gray-500 block text-center">Image Originale</span>
                                                        <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 aspect-square bg-black">
                                                            <img
                                                                src={result.original_image ? `data:image/png;base64,${result.original_image}` : preview}
                                                                alt="Original"
                                                                className="absolute inset-0 w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Heatmap Overlay */}
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-semibold text-red-500 block text-center">Focus IA (Grad-CAM++)</span>
                                                        <div className="relative rounded-lg overflow-hidden border border-red-200 dark:border-red-900 aspect-square bg-black">
                                                            <img
                                                                src={`data:image/png;base64,${result.heatmap}`}
                                                                alt="Grad-CAM Heatmap"
                                                                className="absolute inset-0 w-full h-full object-fill"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {result.specific.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium font-mono text-sm leading-tight max-w-[70%]">
                                                    {item.label}
                                                </span>
                                                <div className="flex items-center space-x-3 ml-4 shrink-0">
                                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.probability > 70 ? 'bg-red-500' :
                                                                item.probability > 40 ? 'bg-orange-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${item.probability}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-brand-dark dark:text-white w-10 text-right text-sm">
                                                        {Math.round(item.probability)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Display Others if necessary */}
                                        {(() => {
                                            const top3Sum = result.specific.slice(0, 3).reduce((acc, curr) => acc + curr.probability, 0);
                                            const others = Math.max(0, 100 - top3Sum);
                                            if (others > 1) {
                                                return (
                                                    <div className="flex justify-between items-center group p-2 rounded-lg transition-colors opacity-60">
                                                        <span className="text-gray-500 dark:text-gray-400 font-medium font-mono text-sm leading-tight italic">
                                                            Autres pathologies (probabilité faible)
                                                        </span>
                                                        <div className="flex items-center space-x-3 ml-4 shrink-0">
                                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-gray-400"
                                                                    style={{ width: `${others}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="font-bold text-gray-400 w-10 text-right text-sm">
                                                                {Math.round(others)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* ============================================= */}
                                    {/* 🧠 INTELLIGENCE ALGORITHMS DISPLAY */}
                                    {/* ============================================= */}

                                    {/* Priority Badge */}
                                    {result.priority && (
                                        <div className={`mt-4 p-4 rounded-lg border-2 ${result.priority.priority_level === 'CRITIQUE' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                                            result.priority.priority_level === 'ÉLEVÉ' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
                                                result.priority.priority_level === 'MODÉRÉ' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
                                                    'bg-green-50 dark:bg-green-900/20 border-green-400'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-bold text-sm flex items-center gap-2">
                                                    <span className="text-lg">🚨</span>
                                                    Niveau de Priorité:
                                                    <span className={`px-2 py-0.5 rounded text-white text-xs ${result.priority.priority_level === 'CRITIQUE' ? 'bg-red-500' :
                                                        result.priority.priority_level === 'ÉLEVÉ' ? 'bg-orange-500' :
                                                            result.priority.priority_level === 'MODÉRÉ' ? 'bg-yellow-500 text-black' :
                                                                'bg-green-500'
                                                        }`}>
                                                        {result.priority.priority_level}
                                                    </span>
                                                </h5>
                                                <span className="text-sm font-bold">{result.priority.priority_score}/10</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                <strong>Action:</strong> {result.priority.recommended_action}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Délai: {result.priority.time_sensitivity} • Spécialité: {result.priority.specialty}
                                            </p>
                                        </div>
                                    )}

                                    {/* Confidence Band */}
                                    {result.confidence && (
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <h5 className="font-bold text-sm text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                                                <span className="text-lg">📊</span>
                                                Indicateurs de Confiance
                                            </h5>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <div className={`text-2xl font-bold ${result.confidence.confidence_band === 'high' ? 'text-green-500' :
                                                        result.confidence.confidence_band === 'medium' ? 'text-yellow-500' :
                                                            'text-red-500'
                                                        }`}>
                                                        {result.confidence.confidence_band === 'high' ? '🟢' :
                                                            result.confidence.confidence_band === 'medium' ? '🟡' : '🔴'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Confiance</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-brand-dark dark:text-white">
                                                        {Math.round((1 - result.confidence.uncertainty) * 100)}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">Certitude</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-brand-dark dark:text-white">
                                                        {result.confidence.decision_margin}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">Marge</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 italic text-center">
                                                {result.confidence.confidence_message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Image Quality */}
                                    {result.image_quality && (
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <h5 className="font-bold text-sm text-brand-dark dark:text-white mb-2 flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">📷</span>
                                                    Qualité d'Image
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${result.image_quality.quality_level === 'excellent' ? 'bg-green-100 text-green-700' :
                                                    result.image_quality.quality_level === 'good' ? 'bg-blue-100 text-blue-700' :
                                                        result.image_quality.quality_level === 'acceptable' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {result.image_quality.quality_level}
                                                </span>
                                            </h5>
                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                <div className="text-center">
                                                    <div className="text-sm font-bold">{Math.round(result.image_quality.blur_score * 100)}%</div>
                                                    <div className="text-xs text-gray-500">Netteté</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-bold">{Math.round(result.image_quality.contrast_score * 100)}%</div>
                                                    <div className="text-xs text-gray-500">Contraste</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-bold">{Math.round(result.image_quality.brightness_score * 100)}%</div>
                                                    <div className="text-xs text-gray-500">Luminosité</div>
                                                </div>
                                            </div>
                                            {result.image_quality.recommendations && result.image_quality.recommendations.length > 0 && (
                                                <div className="text-xs text-gray-500 italic">
                                                    {result.image_quality.recommendations[0]}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Similar Cases */}
                                    {result.similar_cases && result.similar_cases.similar_cases && result.similar_cases.similar_cases.length > 0 && (
                                        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-600">
                                            <h5 className="font-bold text-sm text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                                                <span className="text-lg">🔎</span>
                                                Cas Similaires Détectés
                                            </h5>
                                            <div className="space-y-2">
                                                {result.similar_cases.similar_cases.map((caseItem, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {caseItem.diagnosis.substring(0, 40)}...
                                                        </span>
                                                        <span className="text-purple-600 font-bold">
                                                            {caseItem.similarity}% similaire
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Base: {result.similar_cases.cases_searched} cas analysés
                                            </p>
                                        </div>
                                    )}

                                    {/* Report Download Button */}
                                    {result.report && result.report.text && (
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([result.report.text], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `rapport_elephmind_${new Date().toISOString().slice(0, 10)}.txt`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="mt-4 w-full py-3 bg-brand-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
                                        >
                                            <FileText className="h-5 w-5" />
                                            Télécharger le Rapport Clinique
                                        </button>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 italic">
                                        * Analyse enrichie par 7 algorithmes d'intelligence (v2.0)
                                    </div>

                                    {/* Feedback Section */}
                                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <h5 className="font-bold text-sm text-brand-dark dark:text-white mb-3 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-brand-primary" />
                                            Votre avis d'expert
                                        </h5>

                                        {feedbackStatus === 'sent' ? (
                                            <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" /> Merci pour votre retour !
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setFeedbackRating(star)}
                                                            className={`p-1 transition-transform hover:scale-110 ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        >
                                                            <Star className="h-6 w-6 fill-current" />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    placeholder="Une remarque sur le diagnostic ?"
                                                    value={feedbackComment}
                                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                                    className="w-full p-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                                                    rows="2"
                                                />
                                                <button
                                                    onClick={submitFeedback}
                                                    disabled={feedbackStatus === 'sending' || feedbackRating === 0}
                                                    className="px-4 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-brand-dark transition-colors"
                                                >
                                                    {feedbackStatus === 'sending' ? 'Envoi...' : 'Envoyer'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={clearAll}

                                        className="mt-4 w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase text-xs font-bold tracking-widest"
                                    >
                                        Nouvelle Analyse
                                    </button>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3">
                                    <AlertCircle className="h-6 w-6 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                    <button onClick={clearAll} className="ml-auto underline text-xs font-bold">Réinitialiser</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default MedicalAnalyzer;
