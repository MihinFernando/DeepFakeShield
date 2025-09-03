# Backend/utils/image_signals.py
"""
Lightweight, dependency-friendly image signals:
- ELA score (compression inconsistency)
- EXIF hints (presence + Software tag)
- Laplacian variance (sharpness/noise) — uses OpenCV if available

All functions are defensive: they return None / safe defaults on failure.
"""

from io import BytesIO
from typing import Optional, Dict, Any

from PIL import Image, ImageChops, ImageStat, ImageEnhance, ExifTags


def ela_score(path: str, quality: int = 95) -> Optional[float]:
    """
    Compute a simple Error Level Analysis score.
    Higher ≈ more compression inconsistencies (often seen in AI/composited images).
    Typical ballpark you might see (will vary by data):
      ~0–5   : low ELA
      ~10–14 : moderate
      ~15–30 : high
    Always CALIBRATE on your own set.

    Returns: float (mean brightness of the ELA diff, 0..~30+), or None on error.
    """
    try:
        orig = Image.open(path).convert("RGB")
        tmp = BytesIO()
        orig.save(tmp, "JPEG", quality=quality)
        tmp.seek(0)
        resaved = Image.open(tmp).convert("RGB")

        diff = ImageChops.difference(orig, resaved)

        # amplify dynamic range so small diffs are measurable
        extrema = diff.getextrema()  # per-channel (min, max)
        maxdiff = max(ch_max for (_, ch_max) in extrema)
        scale = 255.0 / max(1, maxdiff)
        diff = ImageEnhance.Brightness(diff).enhance(scale)

        stat = ImageStat.Stat(diff)
        return float(sum(stat.mean) / 3.0)
    except Exception:
        return None


def exif_hints(path: str) -> Dict[str, Any]:
    """
    Return very basic EXIF hints:
      - has_exif: bool
      - software: str|None (if present)
    Many web images have EXIF stripped; treat this only as a weak signal.
    """
    hints = {"has_exif": False, "software": None}
    try:
        img = Image.open(path)
        exif = img.getexif()
        if exif and len(exif.items()) > 0:
            hints["has_exif"] = True
            for k, v in exif.items():
                tag = ExifTags.TAGS.get(k, str(k)).lower()
                if tag == "software":
                    hints["software"] = str(v)
                    break
    except Exception:
        # keep defaults
        pass
    return hints


def laplacian_var(path: str) -> Optional[float]:
    """
    Variance of Laplacian (focus/noise proxy). Requires OpenCV.
    Returns: float or None if cv2 not available or image unreadable.
    """
    try:
        import cv2  # type: ignore
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
        return float(cv2.Laplacian(img, cv2.CV_64F).var())
    except Exception:
        return None
