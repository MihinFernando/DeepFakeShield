# Backend/models/detector.py
from io import BytesIO
from PIL import Image, ImageOps
import numpy as np
import torch
from typing import Optional, Tuple

# --- Model config ---
MODEL_ID: Optional[str] = "prithivMLmods/deepfake-detector-model-v1"
INVERT_LOCAL_PROB: bool = False   # ← set True if you discover the labels are reversed
_PROCESSOR = None
_MODEL = None


def _lazy_load() -> Tuple[object, torch.nn.Module]:
    """Lazy-load processor/model if not injected. Safe no-op if already set."""
    global _PROCESSOR, _MODEL
    if _PROCESSOR is not None and _MODEL is not None:
        return _PROCESSOR, _MODEL

    if MODEL_ID is None:
        raise RuntimeError(
            "detector.py needs model objects. Either set MODEL_ID to your checkpoint "
            "or inject via set_model_objects(processor, model)."
        )

    from transformers import AutoImageProcessor, AutoModelForImageClassification
    _PROCESSOR = AutoImageProcessor.from_pretrained(MODEL_ID)
    _MODEL = AutoModelForImageClassification.from_pretrained(MODEL_ID)
    _MODEL.eval()

    # One-time visibility into label mapping
    try:
        print("🧭 id2label:", getattr(_MODEL.config, "id2label", None))
    except Exception:
        pass

    return _PROCESSOR, _MODEL


def set_model_objects(processor, model):
    """
    If your app loads the model elsewhere (recommended), call this once during startup:
        set_model_objects(processor, model)
    """
    global _PROCESSOR, _MODEL
    _PROCESSOR, _MODEL = processor, model
    try:
        _MODEL.eval()
    except Exception:
        pass


def _get_fake_index(model) -> int:
    """
    Try to map 'fake'/'ai' label to index using id2label. Fallback to index 1.
    """
    try:
        id2label = getattr(getattr(model, "config", None), "id2label", None)
        if isinstance(id2label, dict) and len(id2label) > 0:
            norm = {int(k): str(v).lower() for k, v in id2label.items()}
            for idx, name in norm.items():
                if "fake" in name or "ai" in name or "generated" in name:
                    return int(idx)
    except Exception:
        pass
    return 1  # sensible default for many 2-class heads


@torch.inference_mode()
def _predict_one(img: Image.Image) -> float:
    """
    Return probability that image is AI/fake (0..1).
    """
    processor, model = (_PROCESSOR, _MODEL) if (_PROCESSOR and _MODEL) else _lazy_load()
    inputs = processor(images=img, return_tensors="pt")
    logits = model(**{k: v for k, v in inputs.items()}).logits
    probs = torch.softmax(logits, dim=-1)[0].detach().cpu().numpy()
    fake_idx = _get_fake_index(model)
    if fake_idx < 0 or fake_idx >= probs.shape[-1]:
        fake_idx = min(1, probs.shape[-1] - 1)
    p = float(probs[fake_idx])
    return 1.0 - p if INVERT_LOCAL_PROB else p


def detect_image_tta(path: str):
    """
    Simple, fast TTA:
      - original
      - horizontal mirror
      - 0.9x bicubic resize
      - JPEG re-encode @85
    Returns: {'p_fake': mean, 'p_fake_std': std, 'n': count}
    """
    img = Image.open(path).convert("RGB")

    variants = [
        img,
        ImageOps.mirror(img),
        img.resize(
            (max(64, int(img.width * 0.9)), max(64, int(img.height * 0.9))),
            Image.BICUBIC,
        ),
    ]

    # JPEG re-encode
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)
    variants.append(Image.open(buf).convert("RGB"))

    scores = [_predict_one(v) for v in variants]
    return {
        "p_fake": float(np.mean(scores)),
        "p_fake_std": float(np.std(scores)),
        "n": len(scores),
    }


__all__ = ["detect_image_tta", "set_model_objects"]
