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
        
        if hasattr(model, 'logit_scale'):
            with torch.no_grad():
                model.logit_scale.data.fill_(4.60517) # exp(4.6) = 100
                
        print("Model loaded.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    # Synthetic Chest X-ray
    image = Image.new('RGB', (448, 448), color=(0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse([100, 100, 200, 350], fill=(200, 200, 200))
    draw.ellipse([248, 100, 348, 350], fill=(200, 200, 200)) # Lungs
    
    # Simple Prompts Hypothesis
    prompts = [
        'Os', 
        'Poumons', 
        'Peau', 
        'Oeil', 
        'Sein', 
        'Tissu'
    ]
    
    # Also test slightly descriptive
    prompts_v2 = [
        'Radiographie Os',
        'Radiographie Poumons',
        'Photo Peau',
        'Fond d\'oeil',
        'Mammographie Sein',
        'Microscope Tissu'
    ]
    
    print("\nTesting Simple Prompts on Synthetic Chest X-ray:")
    
    for p_set in [prompts, prompts_v2]:
        with torch.no_grad():
            inputs = processor(text=p_set, images=image, padding="max_length", return_tensors="pt")
            outputs = model(**inputs)
            logits = outputs.logits_per_image
            probs = torch.sigmoid(logits)[0]
            
            # Also calculate Softmax
            probs_softmax = torch.softmax(logits, dim=1)[0]
            
            for i, prompt in enumerate(p_set):
                l = logits[0][i].item()
                p_sig = probs[i].item()
                p_soft = probs_softmax[i].item()
                print(f"Prompt: '{prompt:<20}' | Logit: {l:.4f} | Sigmoid: {p_sig*100:.6f}% | Softmax: {p_soft*100:.2f}%")
        print("-" * 60)

if __name__ == "__main__":
    test_inference()
