import React, { useState, useCallback, useEffect, useRef, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, X, Loader2, AlertCircle, CheckCircle,
    FileImage, User, Calendar, Hash, Camera, FileText,
    Stethoscope, TrendingUp, Activity, Clock,
    ChevronRight, Download, Share2, Brain
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

const COLORS = ['#1B7D7D', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// French translations for medical diagnosis labels
const TRANSLATIONS = {
    // Thoracic / Chest X-Ray
    'Diffuse interstitial opacities or ground-glass pattern (Viral/Atypical Pneumonia)': 'Opacités interstitielles diffuses ou aspect en verre dépoli (Pneumonie Virale/Atypique)',
    'Focal alveolar consolidation with air bronchograms (Bacterial Pneumonia)': 'Condensation alvéolaire focale avec bronchogrammes aériens (Pneumonie Bactérienne)',
    'Perfectly clear lungs, sharp costophrenic angles, no pathology': 'Poumons parfaitement clairs, culs-de-sac costophréniques nets, aucune pathologie',
    'Pneumothorax (Lung collapse)': 'Pneumothorax (Collapsus pulmonaire)',
    'Pleural Effusion (Fluid)': 'Épanchement Pleural (Liquide)',
    'Cardiomegaly (Enlarged heart)': 'Cardiomégalie (Cœur élargi)',
    'Pulmonary Edema': 'Œdème Pulmonaire',
    'Lung Nodule or Mass': 'Nodule ou Masse Pulmonaire',
    'Atelectasis (Lung collapse)': 'Atélectasie (Collapsus pulmonaire)',

    // Dermatology
    'A healthy skin area without lesion': 'Zone de peau saine sans lésion',
    'A benign nevus (mole) regular, symmetrical and homogeneous': 'Naevus bénin (grain de beauté) régulier, symétrique et homogène',
    'A seborrheic keratosis (benign warty lesion)': 'Kératose séborrhéique (lésion verruqueuse bénigne)',
    'A malignant melanoma with asymmetry, irregular borders and multiple colors': 'Mélanome malin avec asymétrie, bords irréguliers et couleurs multiples',
    'A basal cell carcinoma (pearly or ulcerated lesion)': 'Carcinome basocellulaire (lésion perlée ou ulcérée)',
    'A squamous cell carcinoma (crusty or budding lesion)': 'Carcinome épidermoïde (lésion croûteuse ou bourgeonnante)',
    'A non-specific inflammatory skin lesion': 'Lésion cutanée inflammatoire non spécifique',

    // Histology
    'Healthy breast tissue with preserved lobular architecture': 'Tissu mammaire sain avec architecture lobulaire préservée',
    'Healthy prostatic tissue with regular glands': 'Tissu prostatique sain avec glandes régulières',
    'Invasive ductal carcinoma of the breast (Disorganized cells)': 'Carcinome canalaire infiltrant du sein (Cellules désorganisées)',
    'Prostate adenocarcinoma (Gland fusion)': 'Adénocarcinome prostatique (Fusion glandulaire)',
    'Cervical dysplasia or intraepithelial neoplasia': 'Dysplasie cervicale ou néoplasie intra-épithéliale',
    'Colon cancer tumor tissue': 'Tissu tumoral du cancer du côlon',
    'Lung cancer tumor tissue': 'Tissu tumoral du cancer du poumon',
    'Adipose tissue (Fat) or connective stroma': 'Tissu adipeux (Graisse) ou stroma conjonctif',
    'Preparation artifact or empty area': 'Artéfact de préparation ou zone vide',

    // Ophthalmology
    'Normal retina, healthy macula and optic disc': 'Rétine normale, macula et disque optique sains',
    'Diabetic retinopathy (hemorrhages, exudates, aneurysms)': 'Rétinopathie diabétique (hémorragies, exsudats, anévrismes)',
    'Glaucoma (optic disc cupping)': 'Glaucome (excavation du disque optique)',
    'Macular degeneration (drusen or atrophy)': 'Dégénérescence maculaire (drusen ou atrophie)',

    // Orthopedics
    'Severe osteoarthritis with bone-on-bone contact and large osteophytes (Grade 4)': 'Arthrose sévère avec contact os-os et grands ostéophytes (Grade 4)',
    'Moderate osteoarthritis with definite joint space narrowing (Grade 2-3)': 'Arthrose modérée avec pincement articulaire net (Grade 2-3)',
    'Normal knee joint with preserved joint space and no osteophytes (Grade 0-1)': 'Articulation du genou normale avec interligne préservé et sans ostéophytes (Grade 0-1)',
    'Total knee arthroplasty (TKA) with metallic implant': 'Arthroplastie totale du genou (PTG) avec implant métallique',
    'Acute knee fracture or dislocation': 'Fracture ou luxation aiguë du genou',

    // Domains
    'Thoracic': 'Thoracique',
    'Dermatology': 'Dermatologie',
    'Histology': 'Histologie',
    'Ophthalmology': 'Ophtalmologie',
    'Orthopedics': 'Orthopédie',
    'Chest X-Ray Analysis': 'Analyse Radiographie Thoracique',
};

// Translation helper function
const translateLabel = (label) => {
    if (!label) return label;
    return TRANSLATIONS[label] || label;
};

// Error Boundary to catch React errors
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🚨 ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                    <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Erreur d'affichage
                    </h3>
                    <p className="text-red-500 text-sm mt-2">
                        {this.state.error?.message || 'Une erreur est survenue lors du rendu'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
// API URL
import { API_URL } from '../config/api';

// Patient Form Component with Search
import { usePatients } from '../context/PatientContext';
import { Search } from 'lucide-react';

const PatientInfoForm = ({ patientInfo, setPatientInfo }) => {
    const [photoPreview, setPhotoPreview] = React.useState(null);
    const { patients } = usePatients();
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Cleanup ObjectURL on unmount or photo change
    React.useEffect(() => {
        if (patientInfo.photo && typeof patientInfo.photo !== 'string') {
            const url = URL.createObjectURL(patientInfo.photo);
            setPhotoPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof patientInfo.photo === 'string') {
            setPhotoPreview(patientInfo.photo);
        } else {
            setPhotoPreview(null);
        }
    }, [patientInfo.photo]);

    const filteredPatients = patients.filter(p =>
        searchTerm && (
            (p.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.patientId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
    );

    const selectPatient = (p) => {
        setPatientInfo({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            patientId: p.patientId || p.id || '',
            birthDate: p.birthDate || '',
            photo: p.photo || null
        });
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-primary" />
                    Informations Patient
                </h3>
                <div className="relative">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-primary">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-32 outline-none dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                        />
                    </div>
                    {showResults && searchTerm && (
                        <div className="absolute top-full right-0 w-64 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                            {filteredPatients.length > 0 ? (
                                <ul>
                                    {filteredPatients.map(p => (
                                        <li
                                            key={p.id}
                                            onClick={() => selectPatient(p)}
                                            className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-50 last:border-0 dark:border-gray-700"
                                        >
                                            <div className="font-bold text-gray-900 dark:text-white">{p.firstName} {p.lastName}</div>
                                            <div className="text-xs text-brand-primary">{p.patientId || p.id}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-3 text-sm text-gray-500 text-center">Aucun patient trouvé</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-6">
                {/* Photo */}
                <div className="shrink-0">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Patient" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                        )}
                    </div>
                    <label className="block mt-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setPatientInfo({ ...patientInfo, photo: e.target.files[0] })}
                        />
                        <span className="text-xs text-brand-primary cursor-pointer hover:underline">+ Ajouter photo</span>
                    </label>
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                        <input
                            type="text"
                            value={patientInfo.lastName}
                            onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary"
                            placeholder="Koné"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Prénom</label>
                        <input
                            type="text"
                            value={patientInfo.firstName}
                            onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary"
                            placeholder="Amadou"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ID Patient</label>
                        <input
                            type="text"
                            value={patientInfo.patientId}
                            onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary"
                            placeholder="PAT-2026-XXXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date de Naissance</label>
                        <input
                            type="date"
                            value={patientInfo.birthDate}
                            onChange={(e) => setPatientInfo({ ...patientInfo, birthDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Image Upload Zone
const ImageUploadZone = ({ image, setImage, isAnalyzing }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // Cleanup ObjectURL on unmount or image change
    useEffect(() => {
        if (image && image.type?.startsWith('image/')) {
            const url = URL.createObjectURL(image);
            setImagePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreview(null);
        }
    }, [image]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.name.endsWith('.dcm'))) {
            setImage(file);
        }
    }, [setImage]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-dashed transition-colors ${isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 dark:border-gray-700'
                }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="text-center">
                {image ? (
                    <div className="relative">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-64 mx-auto rounded-xl shadow-lg"
                            />
                        )}
                        {!isAnalyzing && (
                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <FileImage className="h-10 w-10 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Déposez votre image ici
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            PNG, JPEG, DICOM jusqu'à 50MB
                        </p>
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-medium cursor-pointer hover:bg-brand-primary/90 transition-colors">
                            <Upload className="h-5 w-5" />
                            Parcourir les fichiers
                            <input
                                type="file"
                                accept="image/*,.dcm"
                                className="hidden"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                        </label>
                    </>
                )}
            </div>
        </motion.div>
    );
};

// Results Panel with Charts
const ResultsPanel = ({ result, isAnalyzing }) => {
    const [zoomedImage, setZoomedImage] = useState(null);

    if (isAnalyzing) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]"
            >
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-brand-primary/20 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-10 w-10 text-brand-primary animate-pulse" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">Analyse en cours...</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">L'IA traite votre image médicale</p>
                <div className="mt-6 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-brand-primary animate-spin" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Extraction des features...</span>
                </div>
            </motion.div>
        );
    }

    if (!result) return null;

    // Safe defaults to prevent crashes
    const predictions = result.predictions || [];
    const qualityMetrics = result.quality_metrics || [];
    const diagnosis = translateLabel(result.diagnosis) || 'Analyse complète';
    const confidence = result.confidence ?? 0;
    const processingTime = result.processing_time ?? 0;
    const priority = result.priority || 'Normale';
    const qualityScore = result.quality_score ?? 0;
    const calibratedConfidence = result.calibrated_confidence ?? 0;
    // similar_cases might be: number, or object {similar_cases: [...array], cases_searched, message}
    const similarCasesRaw = result.similar_cases;
    let similarCases = 0;
    if (typeof similarCasesRaw === 'number') {
        similarCases = similarCasesRaw;
    } else if (typeof similarCasesRaw === 'object' && similarCasesRaw !== null) {
        // If it's an object, the nested similar_cases might be an array
        const nested = similarCasesRaw.similar_cases;
        if (Array.isArray(nested)) {
            similarCases = nested.length;
        } else if (typeof nested === 'number') {
            similarCases = nested;
        }
    }

    // Translate predictions for display
    // Translate predictions for display
    const translatedPredictions = predictions.map(p => {
        const rawLabel = p.label || p.name || 'Inconnu';
        return {
            ...p,
            name: translateLabel(rawLabel) || rawLabel,
            label: translateLabel(rawLabel) || rawLabel
        };
    });

    console.log('🎨 Rendering ResultsPanel with:', { diagnosis, confidence, predictions: predictions.length });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Main Diagnosis Card */}
            <div className="bg-gradient-to-br from-brand-primary to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-white/80 text-sm font-medium">Diagnostic Principal</p>
                        <h2 className="text-2xl font-bold mt-1">{diagnosis}</h2>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-sm">
                                <Activity className="h-4 w-4" />
                                Confiance: {confidence}%
                            </span>
                            <span className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4" />
                                {processingTime}s
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${priority === 'Élevée' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                            Priorité {priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Image Comparison: Original vs GradCAM++ */}
            {(result.original_image || result.heatmap) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileImage className="h-5 w-5 text-brand-primary" />
                        Visualisation GradCAM++
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {result.original_image && (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setZoomedImage({ src: `data:image/png;base64,${result.original_image}`, title: 'Image Originale' })}
                            >
                                <img
                                    src={`data:image/png;base64,${result.original_image}`}
                                    alt="Image Originale"
                                    className="w-full rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        Cliquer pour agrandir
                                    </span>
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">Image Originale</p>
                            </div>
                        )}
                        {result.heatmap && (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setZoomedImage({ src: `data:image/png;base64,${result.heatmap}`, title: 'Zones d\'Attention (GradCAM++)' })}
                            >
                                <img
                                    src={`data:image/png;base64,${result.heatmap}`}
                                    alt="GradCAM++ Heatmap"
                                    className="w-full rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        Cliquer pour agrandir
                                    </span>
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">Zones d'Attention (GradCAM++)</p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Les zones colorées indiquent les régions ayant influencé la décision de l'IA
                    </p>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Probability Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-brand-primary" />
                        Probabilités par Pathologie
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={translatedPredictions} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={180}
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickFormatter={(value) => (value && value.length > 30) ? value.substring(0, 30) + '...' : (value || '')}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value) => [`${value}%`, 'Probabilité']}
                            />
                            <Bar dataKey="probability" fill="#1B7D7D" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quality Radar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-brand-primary" />
                        Qualité de l'Image
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={qualityMetrics}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Qualité"
                                dataKey="value"
                                stroke="#1B7D7D"
                                fill="#1B7D7D"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribution des Résultats</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={translatedPredictions.slice(0, 5)}
                                dataKey="probability"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                outerRadius={60}
                                label={false}
                            >
                                {translatedPredictions.slice(0, 5).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={entry.name} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                payload={(translatedPredictions || []).slice(0, 3).map((entry, index) => ({
                                    value: (entry.name && entry.name.length > 20) ? entry.name.substring(0, 20) + '...' : (entry.name || 'Inconnu'),
                                    type: 'circle',
                                    color: COLORS[index % COLORS.length]
                                }))}
                                wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Metrics Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Métriques Avancées</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Score Qualité Image</span>
                            <span className="font-bold text-gray-900 dark:text-white">{qualityScore}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${qualityScore}%` }} />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-600 dark:text-gray-400">Confiance Calibrée</span>
                            <span className="font-bold text-gray-900 dark:text-white">{calibratedConfidence}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${calibratedConfidence}%` }} />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-600 dark:text-gray-400">Cas Similaires Trouvés</span>
                            <span className="font-bold text-gray-900 dark:text-white">{similarCases}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        // Download Report logic (simplified to downloading heatmap for now)
                        if (result.heatmap) {
                            const link = document.createElement('a');
                            link.href = `data:image/png;base64,${result.heatmap}`;
                            link.download = `Analysis_ElephMind_${new Date().toISOString().slice(0, 10)}.png`;
                            link.click();
                        } else {
                            alert('Aucune donnée à télécharger');
                        }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 transition-colors"
                >
                    <Download className="h-5 w-5" />
                    Télécharger l'Analyse
                </button>
                <button
                    onClick={() => {
                        // Navigate to patient folder using router to preserve state
                        navigate('/app/patients');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <FileText className="h-5 w-5" />
                    Voir Dossier
                </button>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            onClick={() => setZoomedImage(null)}
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <img
                            src={zoomedImage.src}
                            alt={zoomedImage.title}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        />
                        <p className="text-center text-white mt-2">{zoomedImage.title}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Main Analysis Page
const Analysis = () => {
    // Context for persistence
    const { currentAnalysis, setCurrentAnalysis } = usePatients();

    const [patientInfo, setPatientInfo] = useState({
        firstName: '',
        lastName: '',
        patientId: '',
        birthDate: '',
        photo: null
    });
    const [image, setImage] = useState(null);
    // Initialize isAnalyzing from context
    const [isAnalyzing, setIsAnalyzing] = useState(() => currentAnalysis ? currentAnalysis.status === 'analyzing' : false);

    // Initialize result from context if available
    const [result, setResult] = useState(() => currentAnalysis ? currentAnalysis.result : null);

    // Resume polling on mount ONLY if strictly analyzing (not just completed)
    useEffect(() => {
        if (currentAnalysis && currentAnalysis.status === 'analyzing' && currentAnalysis.taskId) {
            console.log("🔄 Resuming analysis for Task ID:", currentAnalysis.taskId);
            setIsAnalyzing(true);
            pollResult(currentAnalysis.taskId);
        }
    }, []); // Run ONCE on mount

    // Sync result to context when it changes (save)
    useEffect(() => {
        // ... (existing persist logic for completed result is fine effectively, 
        // but we need to ensure we don't overwrite if we are just transitioning)
        if (result && !isAnalyzing) {
            const analysisData = {
                status: 'completed',
                result: result,
                taskId: null // Clear task ID when done
            };
            setCurrentAnalysis(analysisData);
        }
    }, [result, isAnalyzing, setCurrentAnalysis]);


    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        // Save 'analyzing' state immediately
        // Note: we don't have task_id yet, but we mark intent
        setCurrentAnalysis({ status: 'analyzing', result: null, taskId: null });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('file', image);

            // 1. Upload
            const uploadRes = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (uploadRes.status === 401) {
                navigate('/login');
                return;
            }

            if (!uploadRes.ok) {
                throw new Error("Erreur lors de l'envoi du fichier");
            }

            const { task_id } = await uploadRes.json();

            // Update context with task_id so we can resume if user leaves now
            setCurrentAnalysis({ status: 'analyzing', result: null, taskId: task_id });

            // 2. Poll
            pollResult(task_id);

        } catch (err) {
            console.error(err);
            setError(err.message || "Erreur inconnue");
            setIsAnalyzing(false);
            // Clear context on error
            setCurrentAnalysis(null);
        }
    };

    const pollResult = async (taskId) => {
        let failures = 0;
        const maxFailures = 20;
        const token = localStorage.getItem('token');

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/result/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    failures++;
                    if (failures >= maxFailures) throw new Error("Timeout serveur");
                    return;
                }

                const data = await res.json();
                console.log('📊 Poll Response:', JSON.stringify(data, null, 2));

                if (data.status === 'completed') {
                    clearInterval(interval);
                    console.log('✅ Result received:', data.result);
                    setResult(data.result);
                    setIsAnalyzing(false);

                    // Auto-fill patient info if metadata available
                    if (data.result.patient_metadata) {
                        const meta = data.result.patient_metadata;
                        // Parse name (often "LAST^FIRST")
                        let lastName = meta.patient_name;
                        let firstName = "";
                        if (meta.patient_name && meta.patient_name.includes('^')) {
                            const parts = meta.patient_name.split('^');
                            lastName = parts[0];
                            firstName = parts[1] || "";
                        }

                        setPatientInfo(prev => ({
                            ...prev,
                            lastName: lastName || prev.lastName,
                            firstName: firstName || prev.firstName,
                            patientId: meta.patient_id !== "N/A" ? meta.patient_id : prev.patientId,
                            birthDate: meta.birth_date ?
                                `${meta.birth_date.slice(0, 4)}-${meta.birth_date.slice(4, 6)}-${meta.birth_date.slice(6, 8)}`
                                : prev.birthDate
                        }));
                    }
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setError(data.error || "Analyse échouée");
                    setIsAnalyzing(false);
                }
            } catch (err) {
                failures++;
                if (failures >= maxFailures) {
                    clearInterval(interval);
                    setError("Le serveur ne répond pas");
                    setIsAnalyzing(false);
                }
            }
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse IA Assistée (v2.3.1)</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Téléchargez une image médicale pour obtenir une analyse par intelligence artificielle
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Input */}
                <div className="space-y-6">
                    <PatientInfoForm patientInfo={patientInfo} setPatientInfo={setPatientInfo} />

                    {!result ? (
                        <>
                            <ImageUploadZone image={image} setImage={setImage} isAnalyzing={isAnalyzing} />
                            {image && !isAnalyzing && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleAnalyze}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-brand-primary to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-primary/25 hover:shadow-xl transition-shadow"
                                >
                                    <Brain className="h-6 w-6" />
                                    Lancer l'Analyse IA
                                    <ChevronRight className="h-5 w-5" />
                                </motion.button>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analyse Terminée</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Les résultats sont affichés à droite.
                            </p>

                            <button
                                onClick={() => {
                                    setResult(null);
                                    setImage(null);
                                    setError(null);
                                    setPatientInfo({
                                        firstName: '',
                                        lastName: '',
                                        patientId: '',
                                        birthDate: '',
                                        photo: null
                                    });
                                    // Clear context
                                    setCurrentAnalysis(null);
                                }}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Nouvelle Analyse
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Results */}
                <div>
                    {(isAnalyzing || result) ? (
                        <ErrorBoundary>
                            <ResultsPanel result={result} isAnalyzing={isAnalyzing} />
                        </ErrorBoundary>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <Brain className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                Les résultats apparaîtront ici
                            </h3>
                            <p className="text-gray-400 dark:text-gray-500 mt-2">
                                Téléchargez une image et lancez l'analyse
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analysis;
