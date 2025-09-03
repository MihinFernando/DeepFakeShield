# Backend/utils/hf_api.py
import os, time, requests

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
HF_MODEL = "prithivMLmods/deepfake-detector-model-v1"

_FAKE_KEYS = ("fake", "ai", "generated", "synthetic")
_REAL_KEYS = ("real", "authentic", "natural")

def _label_to_kind(label: str) -> str:
    l = (label or "").lower()
    if any(k in l for k in _FAKE_KEYS): return "fake"
    if any(k in l for k in _REAL_KEYS): return "real"
    return "other"

def call_hf_api(image_path: str, timeout: float = 6.0, warm_tries: int = 2):
    """
    Returns p_fake in [0,1] if inferable, else None.
    Retries once if the model is warming up (HF often returns 503 / loading JSON).
    """
    if not HF_API_TOKEN:
        print("⚠️ HF_API_TOKEN not set")
        return None

    url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

    with open(image_path, "rb") as f:
        data = f.read()

    tries = 0
    while tries < max(1, warm_tries):
        tries += 1
        try:
            r = requests.post(url, headers=headers, data=data, timeout=timeout)
            if r.status_code == 503:
                # model warming up
                j = {}
                try: j = r.json()
                except Exception: pass
                print("ℹ️ HF model warming:", j)
                if tries < warm_tries:
                    time.sleep(1.5)
                    continue
                return None
            r.raise_for_status()
            out = r.json()
            # Expected: list of {label, score}
            if isinstance(out, list) and out and isinstance(out[0], dict):
                fake_scores, real_scores = [], []
                for item in out:
                    kind = _label_to_kind(item.get("label",""))
                    if kind == "fake": fake_scores.append(float(item.get("score", 0.0)))
                    elif kind == "real": real_scores.append(float(item.get("score", 0.0)))
                if fake_scores:
                    return max(fake_scores)  # take strongest fake score
                if real_scores:
                    # If only real is present, convert to p_fake
                    return 1.0 - max(real_scores)
                # Otherwise unknown labels; fallback None
                return None
            # Sometimes HF returns dict {error: "..."} or other shapes
            print("⚠️ Unexpected HF output:", out)
            return None
        except Exception as e:
            print("❌ HF API error:", e)
            return None
