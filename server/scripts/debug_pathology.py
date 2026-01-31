import torch
from transformers import AutoProcessor, AutoModel
import numpy as np
from PIL import Image, ImageDraw

# Configuration
MODEL_DIR = r"D:\oeil d'elephant"

def test_inference():
    print(f"Loading model from {MODEL_DIR}...")
    try:
        model = AutoModel.from_pretrained(MODEL_DIR, local_files_only=True)
        processor = AutoProcessor.from_pretrained(MODEL_DIR, local_files_only=True)
        model.eval()
        
        # Apply fix
        if hasattr(model, 'logit_scale'):
            with torch.no_grad():
                model.logit_scale.data.fill_(4.60517)
                
        print("Model loaded.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    # Synthetic Pneumonia X-ray
    # Two lungs, one with a big white consolidation
    image = Image.new('RGB', (448, 448), color=(0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse([100, 100, 200, 350], fill=(100, 100, 100)) # Left lung (clearer)
    draw.ellipse([248, 100, 348, 350], fill=(200, 200, 200)) # Right lung (consolidated/white)
    
    # Check "Thoracic" specific labels
    labels = [
        'Cardiomédiastin élargi', 'Cardiomégalie', 'Opacité pulmonaire',
        'Lésion pulmonaire', 'Consolidation', 'Œdème', 'Pneumonie',
        'Atelectasis', 'Pneumothorax', 'Effusion pleurale', 'Pleural Autre'
    ]
    
    # Try simplified versions too
    simple_labels = [
        'Coeur', 'Gros coeur', 'Opacité',
        'Lésion', 'Blanc', 'Eau', 'Infection',
        'Ecrasé', 'Air', 'Liquide', 'Autre'
    ]
    
    print("\nTesting Pathology Prompts:")
    
    with torch.no_grad():
        inputs = processor(text=labels, images=image, padding="max_length", return_tensors="pt")
        outputs = model(**inputs)
        logits = outputs.logits_per_image
        probs = torch.sigmoid(logits)[0]
        
        print("\nOriginal Labels:")
        for i, label in enumerate(labels):
            print(f"'{label}': Logit {logits[0][i]:.4f} | Prob {probs[i]:.6f}")

        # Test Simple
        inputs_simple = processor(text=simple_labels, images=image, padding="max_length", return_tensors="pt")
        outputs_simple = model(**inputs_simple)
        logits_simple = outputs_simple.logits_per_image
        probs_simple = torch.sigmoid(logits_simple)[0]

        print("\nSimple Labels:")
        for i, label in enumerate(simple_labels):
            print(f"'{label}': Logit {logits_simple[0][i]:.4f} | Prob {probs_simple[0][i]:.6f}")

if __name__ == "__main__":
    test_inference()
