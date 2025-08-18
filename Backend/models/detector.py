from transformers import SiglipForImageClassification, AutoImageProcessor
from PIL import Image
import torch

model_name = "prithivMLmods/deepfake-detector-model-v1"
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)
 
# Add this to check how labels are mapped
print("Model labels:", model.config.id2label)

def detect_image(image_path):
    image = Image.open(image_path).convert("RGB")  # Remove resize here
    inputs = processor(images=image, return_tensors="pt")  # Let processor handle it

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    pred_idx = int(torch.argmax(logits, dim=1))

    label = model.config.id2label[pred_idx].lower()
    confidence = round(probs[pred_idx], 4)

    print(f" Prediction: {label} ({confidence * 100:.2f}%)")

    return {
        "label": label,
        "confidence": confidence
    }