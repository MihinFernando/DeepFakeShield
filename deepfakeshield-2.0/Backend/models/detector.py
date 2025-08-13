# In models/detector.py
from transformers import SiglipForImageClassification, AutoImageProcessor
from PIL import Image
import torch
import io

# --- Model Loading (runs once on import) ---
model_name = "prithivMLmods/deepfake-detector-model-v1"
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)


# --- Core Detection Function (accepts bytes) ---
def detect_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
        pred_idx = int(torch.argmax(logits, dim=1))
        label = model.config.id2label[pred_idx].lower()
        confidence = round(probs[pred_idx], 4)

        print(f"Detection result: label={label}, confidence={confidence}")

        return {"label": label, "confidence": confidence}
    except Exception as e:
        print(f"Error during detection: {e}")
        return None
