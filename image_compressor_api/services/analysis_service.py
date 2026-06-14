import requests
from config import Config
import json

# Primary and Fallback Models
PRIMARY_MODEL = "google/vit-base-patch16-224"
FALLBACK_MODEL = "Salesforce/blip-image-captioning-base"

def analyze_image(filepath):
    """
    Sends image to Hugging Face API and returns recommendations.
    Categories: Photograph, Screenshot, Artwork, Logo, Document.
    """
    token = Config.HF_TOKEN
    if not token or token == "your_huggingface_token":
        # Provide default fallback if no token
        return {"type": "Photograph", "recommended_quality": 80, "recommended_format": "webp"}
        
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        with open(filepath, "rb") as f:
            data = f.read()
    except Exception as e:
        print(f"Error reading file for analysis: {e}")
        return {"type": "Unknown", "recommended_quality": 80, "recommended_format": "webp"}
        
    # Try Primary Model (ViT - Classification)
    try:
        response = requests.post(f"https://api-inference.huggingface.co/models/{PRIMARY_MODEL}", headers=headers, data=data, timeout=10)
        if response.status_code == 200:
            predictions = response.json()
            return _parse_predictions(predictions)
    except Exception as e:
        print(f"Primary model failed: {e}")
        
    # Try Fallback Model (BLIP - Captioning)
    try:
        response = requests.post(f"https://api-inference.huggingface.co/models/{FALLBACK_MODEL}", headers=headers, data=data, timeout=10)
        if response.status_code == 200:
            caption = response.json()[0].get('generated_text', '').lower()
            return _parse_caption(caption)
    except Exception as e:
        print(f"Fallback model failed: {e}")

    # Default fallback
    return {"type": "Photograph", "recommended_quality": 80, "recommended_format": "webp"}

def _parse_predictions(predictions):
    if not predictions or not isinstance(predictions, list):
        return {"type": "Photograph", "recommended_quality": 80, "recommended_format": "webp"}
    
    top_label = predictions[0].get('label', '').lower()
    return _map_to_category(top_label)

def _parse_caption(caption):
    return _map_to_category(caption)
    
def _map_to_category(text):
    if any(word in text for word in ['screenshot', 'screen', 'window', 'text', 'document', 'paper', 'receipt']):
        if 'document' in text or 'paper' in text or 'receipt' in text:
            return {"type": "Document", "recommended_quality": 60, "recommended_format": "png"}
        return {"type": "Screenshot", "recommended_quality": 75, "recommended_format": "png"}
    elif any(word in text for word in ['logo', 'icon', 'symbol', 'vector']):
        return {"type": "Logo", "recommended_quality": 90, "recommended_format": "png"}
    elif any(word in text for word in ['art', 'drawing', 'illustration', 'painting', 'sketch']):
        return {"type": "Artwork", "recommended_quality": 85, "recommended_format": "webp"}
    else:
        return {"type": "Photograph", "recommended_quality": 75, "recommended_format": "webp"}
