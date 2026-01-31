import json
import os

MODEL_DIR = r"D:\oeil d'elephant"

def inspect():
    files = ["config.json", "preprocessor_config.json", "tokenizer_config.json"]
    
    for f in files:
        path = os.path.join(MODEL_DIR, f)
        print(f"\n--- {f} ---")
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = json.load(file)
                    # Print summary to avoid huge output
                    if f == "config.json":
                        print(json.dumps({k:v for k,v in content.items() if k in ['architectures', 'model_type', 'logit_scale_init_value', 'vision_config', 'text_config']}, indent=2))
                    elif f == "preprocessor_config.json":
                        print(json.dumps(content, indent=2))
                    else:
                        print(json.dumps(content, indent=2))
            except Exception as e:
                print(f"Error reading {f}: {e}")
        else:
            print("File not found.")

if __name__ == "__main__":
    inspect()
