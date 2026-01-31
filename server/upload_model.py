# upload_model.py - Upload model to Hugging Face Hub
from huggingface_hub import upload_folder
import os

model_path = os.path.join("models", "oeil d'elephant")
print(f"Uploading from: {model_path}")
print(f"Path exists: {os.path.exists(model_path)}")

if os.path.exists(model_path):
    print("Starting upload... (this may take a while for 3.5GB)")
    upload_folder(
        folder_path=model_path,
        repo_id="issoufzousko07/medsigclip-model",
        repo_type="model"
    )
    print("Upload complete!")
else:
    print(f"ERROR: Path not found: {model_path}")
    print("Available in models/:")
    if os.path.exists("models"):
        print(os.listdir("models"))
