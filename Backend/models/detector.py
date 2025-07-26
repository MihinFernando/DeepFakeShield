from transformers import SiglipForImageClassification, AutoImageProcessor
from PIL import Image
import torch

model_name = "prithivMLmods/deepfake-detector-model-v1"
model = SiglipForImageClassification.from_pretrained(model_name)
processor = AutoImageProcessor.from_pretrained(model_name)

def detect_image(image_path):
    image = Image.open(image_path).convert("RGB").resize((512,512))
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()
    pred_idx = int(torch.argmax(outputs.logits, dim=1))
    label = model.config.id2label.get(str(pred_idx), "fake" if pred_idx == 0 else "real")
    confidence = round(probs[pred_idx] * 100, 2)
    return {"prediction": label.upper(), "confidence": confidence}
