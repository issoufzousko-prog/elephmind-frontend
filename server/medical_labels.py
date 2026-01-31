from typing import Dict, List, Any

# =========================================================================
# CANONICAL MEDICAL DOMAINS CONFIGURATION (MODEL SOURCE OF TRUTH)
# =========================================================================
# - Prompts must be in ENGLISH (Model Language).
# - Labels must have a stable 'id'.
# - Logic Gates define structural/quality constraints.

MEDICAL_DOMAINS = {
    'Thoracic': {
        'id': 'DOM_THORACIC',
        'domain_prompt': 'Chest X-Ray Analysis',
        'specific_labels': [
            {'id': 'TH_PNEUMONIA_VIRAL', 'label_en': 'Diffuse interstitial opacities or ground-glass pattern (Viral/Atypical Pneumonia)'},
            {'id': 'TH_PNEUMONIA_BACT', 'label_en': 'Focal alveolar consolidation with air bronchograms (Bacterial Pneumonia)'},
            {'id': 'TH_NORMAL', 'label_en': 'Normal chest radiograph: normal cardiothoracic ratio, clear lungs, no pleural abnormality'}, 
            {'id': 'TH_PNEUMOTHORAX', 'label_en': 'Pneumothorax (Lung collapse)'},
            {'id': 'TH_PLEURAL_EFFUSION', 'label_en': 'Pleural Effusion (Fluid)'},
            {'id': 'TH_CARDIOMEGALY', 'label_en': 'Cardiomegaly with clear lung fields (no pulmonary edema)'}, 
            {'id': 'TH_CARDIOMEGALY_EDEMA', 'label_en': 'Cardiomegaly with pulmonary congestion or edema'},
            {'id': 'TH_EDEMA', 'label_en': 'Pulmonary Edema (without cardiomegaly)'},
            {'id': 'TH_NODULE', 'label_en': 'Lung Nodule or Mass'},
            {'id': 'TH_ATELECTASIS', 'label_en': 'Atelectasis (Lung collapse)'}
        ],
        'logic_gate': {
            'prompt': 'Evaluate cardiac silhouette size',
            'labels': ['Normal cardiac size (CTR < 0.5)', 'Enlarged cardiac silhouette (Cardiomegaly)'],
            'penalty_target': 'TH_NORMAL', # Penalize the ID of the normal label
            'abnormal_index': 1
        }
    },
    'Dermatology': {
        'id': 'DOM_DERMATOLOGY',
        'domain_prompt': 'Dermatoscopic analysis of a pigmented or non-pigmented skin lesion',
        'specific_labels': [
            {'id': 'DERM_NORMAL', 'label_en': 'Normal skin without visible lesion or abnormal pigmentation'},
            {'id': 'DERM_NEVUS', 'label_en': 'Benign melanocytic nevus with symmetry and uniform pigmentation'},
            {'id': 'DERM_SEBORRHEIC', 'label_en': 'Seborrheic keratosis (benign warty lesion)'},
            {'id': 'DERM_MELANOMA', 'label_en': 'Malignant melanoma with asymmetry, irregular borders, and color variegation'},
            {'id': 'DERM_BCC', 'label_en': 'Basal cell carcinoma (pearly or ulcerated lesion)'},
            {'id': 'DERM_SCC', 'label_en': 'Squamous cell carcinoma (crusty or budding lesion)'},
            {'id': 'DERM_INFLAMMATORY', 'label_en': 'Inflammatory skin lesion (Eczema, Psoriasis)'}
        ],
        'logic_gate': {
            'prompt': 'Is there a visible skin lesion?',
            'labels': ['No visible skin lesion', 'Visible skin lesion (pigmented or non-pigmented)'],
            'penalty_target': 'ALL_PATHOLOGY', 
            'abnormal_index': 0 
        }
    },
    'Histology': {
        'id': 'DOM_HISTOLOGY',
        'domain_prompt': 'Microscopic analysis of a histological section (H&E stain)',
        'specific_labels': [
            {'id': 'HIST_HEALTHY_BREAST', 'label_en': 'Healthy breast tissue with preserved lobular architecture'},
            {'id': 'HIST_HEALTHY_PROSTATE', 'label_en': 'Healthy prostatic tissue with regular glands'},
            {'id': 'HIST_IDC_BREAST', 'label_en': 'Invasive ductal carcinoma (Disorganized cells)'},
            {'id': 'HIST_ADENO_PROSTATE', 'label_en': 'Prostate adenocarcinoma (Gland fusion)'},
            {'id': 'HIST_DYSPLASIA', 'label_en': 'Cervical dysplasia or intraepithelial neoplasia'},
            {'id': 'HIST_COLON_CA', 'label_en': 'Colon cancer tumor tissue'},
            {'id': 'HIST_LUNG_CA', 'label_en': 'Lung cancer tumor tissue'},
            {'id': 'HIST_ADIPOSE', 'label_en': 'Adipose tissue (Fat) or connective stroma'},
            {'id': 'HIST_ARTIFACT', 'label_en': 'Preparation artifact, empty area, or blurred region'} 
        ],
        'logic_gate': {
            'prompt': 'Assess histological validity of the image',
            'labels': ['Adequate H&E tissue section', 'Artifact, empty area, or blurred region'],
            'penalty_target': 'ALL_DIAGNOSIS',
            'abnormal_index': 1
        }
    },
    'Ophthalmology': {
        'id': 'DOM_OPHTHALMOLOGY',
        'domain_prompt': 'Fundus photography (Retina)',
        'specific_labels': [
            {'id': 'OPH_NORMAL', 'label_en': 'Normal retina with visible optic disc and macula'},
            {'id': 'OPH_DIABETIC', 'label_en': 'Diabetic retinopathy (hemorrhages, exudates)'},
            {'id': 'OPH_GLAUCOMA', 'label_en': 'Glaucoma (optic disc cupping)'},
            {'id': 'OPH_AMD', 'label_en': 'Macular degeneration (drusen or atrophy)'}
        ],
        'logic_gate': {
             'prompt': 'Is the fundus image clinically interpretable?',
             'labels': ['Good quality fundus image', 'Poor quality, uninterpretable or partial view'],
             'penalty_target': 'ALL_DIAGNOSIS',
             'abnormal_index': 1
        }
    },
    'Orthopedics': {
        'id': 'DOM_ORTHOPEDICS',
        'domain_prompt': 'Bone X-Ray (Musculoskeletal)',
        'stage_1_triage': {
            'prompt': 'Anatomical region identification',
            'labels': [
                'Other x-ray view (Chest, Hand, Foot, Pediatric) - OUT OF DISTRIBUTION',
                'A knee x-ray view (Knee Joint)'
            ]
        },
        'specific_labels': [ 
             {'id': 'ORTH_OA_SEVERE', 'label_en': 'Severe osteoarthritis (Grade 4)'}, 
             {'id': 'ORTH_OA_MODERATE', 'label_en': 'Moderate osteoarthritis (Grade 2-3)'}, 
             {'id': 'ORTH_NORMAL', 'label_en': 'Normal knee'}, 
             {'id': 'ORTH_IMPLANT', 'label_en': 'Implant'}
        ],
        'stage_2_diagnosis': {
            'prompt': 'Knee Osteoarthritis Severity Assessment',
            'labels': [
                {'id': 'ORTH_OA_SEVERE', 'label_en': 'Severe osteoarthritis with bone-on-bone contact (Grade 4)'},
                {'id': 'ORTH_OA_MODERATE', 'label_en': 'Moderate osteoarthritis with definite joint space narrowing (Grade 2-3)'},
                {'id': 'ORTH_NORMAL', 'label_en': 'Normal knee joint with preserved joint space (Grade 0-1)'},
                {'id': 'ORTH_IMPLANT', 'label_en': 'Total knee arthroplasty (TKA) with metallic implant'}, 
                {'id': 'ORTH_FRACTURE', 'label_en': 'Acute knee fracture or dislocation'}
            ]
        },
        'logic_gate': {
            'prompt': 'Is there a metallic implant?',
            'labels': ['Native knee joint', 'Knee with metallic implant (Arthroplasty)'],
            'penalty_target': 'ORTH_OA', # Logic target string match (Prefix)
            'abnormal_index': 1
        }
    }
}

# =========================================================================
# FRENCH TRANSLATIONS (USER INTERFACE ONLY)
# =========================================================================
# - Strict Mapping: ID -> {title, description}
# - No dynamic translation allowed.

LABEL_TRANSLATIONS_FR = {
    # --- THORACIC ---
    'TH_NORMAL': {
        'short': 'Thorax sans anomalie',
        'long': 'Silhouette cardiaque normale, poumons clairs, pas d’épanchement.',
        'severity': 'low'
    },
    'TH_PNEUMONIA_VIRAL': {
        'short': 'Pneumonie Virale / Atypique',
        'long': 'Opacités interstitielles diffuses ou verre dépoli.',
        'severity': 'high'
    },
    'TH_PNEUMONIA_BACT': {
        'short': 'Pneumonie Bactérienne',
        'long': 'Consolidation alvéolaire focale avec bronchogramme aérien.',
        'severity': 'high'
    },
    'TH_PNEUMOTHORAX': {
        'short': 'Pneumothorax',
        'long': 'Présence possible d’air dans la cavité pleurale (collapsus).',
        'severity': 'emergency'
    },
    'TH_PLEURAL_EFFUSION': {
        'short': 'Épanchement Pleural',
        'long': 'Accumulation de liquide dans l’espace pleural.',
        'severity': 'medium'
    },
    'TH_CARDIOMEGALY': {
        'short': 'Cardiomégalie (Poumons clairs)',
        'long': 'Silhouette cardiaque augmentée de taille sans signe d’œdème pulmonaire.',
        'severity': 'medium'
    },
    'TH_CARDIOMEGALY_EDEMA': {
        'short': 'Cardiomégalie avec Stase',
        'long': 'Cœur augmenté de taille associé à une congestion pulmonaire.',
        'severity': 'high'
    },
    'TH_EDEMA': {
        'short': 'Œdème Pulmonaire',
        'long': 'Surcharge liquidienne pulmonaire (sans cardiomégalie évidente).',
        'severity': 'high'
    },
    'TH_NODULE': {
        'short': 'Nodule ou Masse Pulmonaire',
        'long': 'Lésion focale suspecte nécessitant un scanner de contrôle.',
        'severity': 'high'
    },
    'TH_ATELECTASIS': {
        'short': 'Atélectasie',
        'long': 'Affaissement d’une partie du poumon.',
        'severity': 'medium'
    },

    # --- DERMATOLOGY ---
    'DERM_NORMAL': {
        'short': 'Peau saine / Pas de lésion',
        'long': 'Aucune lésion dermatologique suspecte visible.',
        'severity': 'low'
    },
    'DERM_NEVUS': {
        'short': 'Nævus Bénin (Grain de beauté)',
        'long': 'Lésion régulière, symétrique et homogène.',
        'severity': 'low'
    },
    'DERM_SEBORRHEIC': {
        'short': 'Kératose Séborrhéique',
        'long': 'Lésion bénigne fréquente ("verrue de vieillesse").',
        'severity': 'low'
    },
    'DERM_MELANOMA': {
        'short': 'Suspicion de Mélanome',
        'long': 'Lésion pigmentée asymétrique, bords irréguliers (critères ABCDE). Urgence.',
        'severity': 'emergency'
    },
    'DERM_BCC': {
        'short': 'Carcinome Basocellulaire',
        'long': 'Lésion perlée ou ulcérée suggérant un carcinome non-mélanique.',
        'severity': 'high'
    },
    'DERM_SCC': {
        'short': 'Carcinome Épidermoïde',
        'long': 'Lésion croûteuse ou bourgeonnante suspecte.',
        'severity': 'high'
    },
    'DERM_INFLAMMATORY': {
        'short': 'Lésion Inflammatoire',
        'long': 'Aspect compatible avec eczéma, psoriasis ou dermatite.',
        'severity': 'medium'
    },

    # --- HISTOLOGY ---
    'HIST_ARTIFACT': {
        'short': 'Qualité Insuffisante (Artefact)',
        'long': 'Tissu non interprétable (section vide, floue ou artefact technique).',
        'severity': 'none'
    },
    'HIST_HEALTHY_BREAST': {
        'short': 'Tissu Mammaire Sain',
        'long': 'Architecture lobulaire préservée.',
        'severity': 'low'
    },
    'HIST_IDC_BREAST': {
        'short': 'Carcinome Canalaire Infiltrant',
        'long': 'Prolifération cellulaire désorganisée invasive (Sein).',
        'severity': 'high'
    },
    'HIST_HEALTHY_PROSTATE': {
        'short': 'Tissu Prostatique Sain',
        'long': 'Glandes régulières, stroma normal.',
        'severity': 'low'
    },
    'HIST_ADENO_PROSTATE': {
        'short': 'Adénocarcinome Prostatique',
        'long': 'Fusion glandulaire et atypies cytonucléaires.',
        'severity': 'high'
    },
    'HIST_COLON_CA': {'short': 'Cancer Colorectal', 'long': 'Tissu tumoral colique.', 'severity': 'high'},
    'HIST_LUNG_CA': {'short': 'Cancer Pulmonaire', 'long': 'Tissu tumoral pulmonaire.', 'severity': 'high'},
    'HIST_DYSPLASIA': {'short': 'Dysplasie / CIN', 'long': 'Anomalies précancéreuses.', 'severity': 'medium'},
    'HIST_ADIPOSE': {'short': 'Tissu Adipeux / Stroma', 'long': 'Tissu de soutien normal.', 'severity': 'low'},

    # --- OPHTHALMOLOGY ---
    'OPH_NORMAL': {
        'short': 'Fond d’œil Normal',
        'long': 'Rétine, macula et papille d’aspect sain.',
        'severity': 'low'
    },
    'OPH_DIABETIC': {
        'short': 'Rétinopathie Diabétique',
        'long': 'Présence d’hémorragies, exsudats ou anévrismes.',
        'severity': 'high'
    },
    'OPH_GLAUCOMA': {
        'short': 'Suspicion de Glaucome',
        'long': 'Excavation papillaire (cup/disc ratio) augmentée.',
        'severity': 'high'
    },
    'OPH_AMD': {
        'short': 'DMLA',
        'long': 'Dégénérescence Maculaire (drusens ou atrophie).',
        'severity': 'medium'
    },

    # --- ORTHOPEDICS ---
    'ORTH_NORMAL': {
        'short': 'Genou Normal',
        'long': 'Interligne articulaire préservé, pas d’ostéophyte.',
        'severity': 'low'
    },
    'ORTH_OA_MODERATE': {
        'short': 'Arthrose Modérée (Grade 2-3)',
        'long': 'Pincement articulaire visible et ostéophytes.',
        'severity': 'medium'
    },
    'ORTH_OA_SEVERE': {
        'short': 'Arthrose Sévère (Grade 4)',
        'long': 'Disparition de l’interligne (os sur os), déformation.',
        'severity': 'high'
    },
    'ORTH_IMPLANT': {
        'short': 'Prothèse Totale (PTG)',
        'long': 'Genou avec implant métallique (Arthroplastie).',
        'severity': 'low'
    },
    'ORTH_FRACTURE': {
        'short': 'Fracture Récente / Luxation',
        'long': 'Solution de continuité osseuse ou perte de congruence.',
        'severity': 'emergency'
    }
}

DOMAIN_TRANSLATIONS_FR = {
    'Thoracic': 'Radiographie Thoracique',
    'Dermatology': 'Dermatoscopie',
    'Histology': 'Histopathologie (H&E)',
    'Ophthalmology': 'Fond d’Oeil (Rétine)',
    'Orthopedics': 'Radiographie Osseuse'
}
