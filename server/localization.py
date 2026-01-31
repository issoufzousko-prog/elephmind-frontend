# Mappings de localisation (Anglais -> Français)
# Ce fichier permet de traduire les résultats de l'IA sans modifier les prompts originaux
# qui doivent rester en anglais pour la performance du modèle.

DOMAIN_TRANSLATIONS = {
    'Thoracic': {
        'label': 'Thoracique',
        'description': 'Analyse Radiographique du Thorax'
    },
    'Dermatology': {
        'label': 'Dermatologie',
        'description': 'Analyse Dermatoscope des Lésions Cutanées'
    },
    'Histology': {
        'label': 'Histologie',
        'description': 'Analyse Microscopique (H&E)'
    },
    'Ophthalmology': {
        'label': 'Ophtalmologie',
        'description': 'Fond d\'Oeil (Rétine)'
    },
    'Orthopedics': {
        'label': 'Orthopédie',
        'description': 'Radiographie Osseuse'
    }
}

LABEL_TRANSLATIONS = {
    # --- THORACIC ---
    'Diffuse interstitial opacities or ground-glass pattern (Viral/Atypical Pneumonia)': 
        'Opacités interstitielles diffuses ou aspect en verre dépoli (Pneumonie Virale/Atypique)',
    
    'Focal alveolar consolidation with air bronchograms (Bacterial Pneumonia)': 
        'Condensation alvéolaire focale avec bronchogrammes aériens (Pneumonie Bactérienne)',
    
    'Perfectly clear lungs, sharp costophrenic angles, no pathology': 
        'Poumons parfaitement clairs, angles costophréniques nets, aucune pathologie',
    
    'Pneumothorax (Lung collapse)': 'Pneumothorax (Décollement de la plèvre)',
    'Pleural Effusion (Fluid)': 'Épanchement Pleural (Liquide)',
    'Cardiomegaly (Enlarged heart)': 'Cardiomégalie (Cœur élargi)',
    'Pulmonary Edema': 'Œdème Pulmonaire',
    'Lung Nodule or Mass': 'Nodule ou Masse Pulmonaire',
    'Atelectasis (Lung collapse)': 'Atélectasie (Affaissement pulmonaire)',

    # --- DERMATOLOGY ---
    'A healthy skin area without lesion': 'Zone de peau saine sans lésion',
    'A benign nevus (mole) regular, symmetrical and homogeneous': 'Nævus bénin (grain de beauté) régulier, symétrique et homogène',
    'A seborrheic keratosis (benign warty lesion)': 'Kératose séborrhéique (lésion verruqueuse bénigne)',
    'A malignant melanoma with asymmetry, irregular borders and multiple colors': 'Mélanome malin (Asymétrie, Bords irréguliers, Couleurs multiples)',
    'A basal cell carcinoma (pearly or ulcerated lesion)': 'Carcinome basocellulaire (lésion perlée ou ulcérée)',
    'A squamous cell carcinoma (crusty or budding lesion)': 'Carcinome épidermoïde (lésion croûteuse ou bourgeonnante)',
    'A non-specific inflammatory skin lesion': 'Lésion cutanée inflammatoire non spécifique',

    # --- ORTHOPEDICS ---
    'Severe osteoarthritis with bone-on-bone contact and large osteophytes (Grade 4)': 'Arthrose sévère avec contact os-contre-os et ostéophytes importants (Grade 4)',
    'Moderate osteoarthritis with definite joint space narrowing (Grade 2-3)': 'Arthrose modérée avec pincement articulaire net (Grade 2-3)',
    'Normal knee joint with preserved joint space and no osteophytes (Grade 0-1)': 'Genou normal, interligne articulaire préservé (Grade 0-1)',
    'Total knee arthroplasty (TKA) with metallic implant': 'Prothèse totale de genou (implant métallique)',
    'Acute knee fracture or dislocation': 'Fracture ou luxation aiguë du genou',
    'Other x-ray view (Chest, Hand, Foot, Pediatric) - OUT OF DISTRIBUTION': 'Autre vue radiographique (Hors périmètre)',
    'A knee x-ray view (Knee Joint)': 'Radiographie du Genou'
}

def localize_result(result_json):
    """
    Traduit les résultats bruts (Anglais) en Français
    en utilisant les dictionnaires de mapping.
    """
    # 1. Localiser le Domaine
    domain_key = result_json['domain']['label']
    if domain_key in DOMAIN_TRANSLATIONS:
        result_json['domain']['label'] = DOMAIN_TRANSLATIONS[domain_key]['label']
        result_json['domain']['description'] = DOMAIN_TRANSLATIONS[domain_key]['description']
    
    # 2. Localiser les Résultats Spécifiques
    for item in result_json['specific']:
        original_label = item['label']
        if original_label in LABEL_TRANSLATIONS:
            item['label'] = LABEL_TRANSLATIONS[original_label]
        # Si pas de traduction trouvée, on garde l'anglais (fallback)
        
    return result_json
