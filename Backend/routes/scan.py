# Backend/routes/scan.py
from flask import Blueprint, request, jsonify
import os, tempfile, time
from werkzeug.utils import secure_filename

from models.detector import detect_image_tta
from utils.image_signals import ela_score, exif_hints, laplacian_var
from utils.hf_api import call_hf_api
from firebase_admin_init import db
from google.cloud import firestore as gcfs  # <-- needed for SERVER_TIMESTAMP

bp = Blueprint("scan", __name__, url_prefix="/")

ALLOWED_EXT = {"jpg", "jpeg", "png", "webp", "bmp"}

# --- Behavior toggles ---
NO_UNCERTAIN   = True   # 👈 Always return Fake/Real (never "uncertain")
USE_HF_API     = True   # Use Hugging Face second opinion
SAVE_HISTORY   = True

# --- Thresholds (tune later) ---
CONF_STRONG        = 0.80      # for strong votes
LOW_STRONG         = 1.0 - CONF_STRONG  # 0.20
CONF_MODERATE_HIGH = 0.65
CONF_MODERATE_LOW  = 0.35

HARD_ELA_HIGH = 15.0
SOFT_ELA_HIGH = 10.0
SOFT_ELA_LOW  = 4.0


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT


def _clip(x, lo=0.0, hi=1.0):
    try:
        return max(lo, min(hi, float(x)))
    except Exception:
        return 0.0


def _ela_norm(ela_value: float | None) -> float:
    """
    Map ELA to 0..1.
    - ≤ 4   -> ~0
    - 10    -> ~0.4
    - 15+   -> ~0.73..1
    """
    if ela_value is None:
        return 0.0
    # Linear ramp from 4..20 → 0..1
    return _clip((ela_value - 4.0) / 16.0, 0.0, 1.0)


@bp.route("/scan", methods=["POST"])
def scan():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    user_id = request.form.get("userId") or request.args.get("userId")

    # Save to a temp file
    filename = secure_filename(file.filename)
    tmp_dir = tempfile.mkdtemp(prefix="scan_")
    tmp_path = os.path.join(tmp_dir, filename)
    file.save(tmp_path)

    try:
        # 1) Local model (with TTA)
        tta    = detect_image_tta(tmp_path)
        p_fake = float(tta["p_fake"])
        p_std  = float(tta["p_fake_std"])

        # 2) Heuristics
        ela  = ela_score(tmp_path)
        exif = exif_hints(tmp_path)
        lapv = laplacian_var(tmp_path)

        ELA_HARD = (ela is not None) and (ela >= HARD_ELA_HIGH)
        ELA_HIGH = (ela is not None) and (ela >= SOFT_ELA_HIGH)
        ELA_LOW  = (ela is not None) and (ela <= SOFT_ELA_LOW)

        # 3) HF API second opinion
        api_p_fake = call_hf_api(tmp_path, timeout=6.0) if USE_HF_API else None

        # 4) Voting
        vote_ai, vote_real = 0, 0
        reasons = []

        # strong local
        if p_fake >= CONF_STRONG:
            vote_ai += 1; reasons.append("local>=0.80")
        if p_fake <= LOW_STRONG:
            vote_real += 1; reasons.append("local<=0.20")

        # heuristics
        if ELA_HARD:
            vote_ai += 2; reasons.append("ELA>=15(hard)")
        else:
            if ELA_HIGH:
                vote_ai += 1; reasons.append("ELA>=10(soft)")
            elif ELA_LOW:
                vote_real += 1; reasons.append("ELA<=4(soft_low)")

        # api
        if api_p_fake is not None:
            if api_p_fake >= 0.80:
                vote_ai += 1; reasons.append("api>=0.80")
            elif api_p_fake <= 0.20:
                vote_real += 1; reasons.append("api<=0.20")

        # 5) Primary decision via votes
        if vote_ai >= 2 and vote_ai > vote_real:
            decision = "fake"
            decision_conf = max(p_fake, 0.80)  # show at least strong if votes win
            reasons.append("votes→fake")
        elif vote_real >= 2 and vote_real > vote_ai:
            decision = "real"
            decision_conf = max(1.0 - p_fake, 0.80)
            reasons.append("votes→real")
        else:
            # 6) Composite fallback (no UNCERTAIN)
            # Normalize ELA and compose weighted score
            ela_term = _ela_norm(ela)
            api_term = api_p_fake if api_p_fake is not None else 0.5
            final_score = (0.60 * p_fake) + (0.25 * ela_term) + (0.15 * api_term)
            reasons.append(f"composite={final_score:.3f}(0.60*local+0.25*ela+0.15*api)")

            if final_score >= 0.50:
                decision = "fake"
                decision_conf = final_score
            else:
                decision = "real"
                decision_conf = 1.0 - final_score

        # Ensure confidence is within [0,1]
        decision_conf = float(_clip(decision_conf, 0.0, 1.0))

        payload = {
            "label": "fake" if decision == "fake" else "real",
            "decision": decision,
            "confidence": decision_conf,         # confidence for the chosen side
            "is_confident": decision_conf >= CONF_STRONG,
            "threshold": CONF_STRONG,
            "signals": {
                "local_p_fake": p_fake,
                "tta_std": p_std,
                "ela": float(ela) if ela is not None else None,
                "ela_norm": _ela_norm(ela) if ela is not None else None,
                "laplacian_var": float(lapv) if lapv is not None else None,
                "exif_has": bool(exif.get("has_exif")),
                "exif_software": exif.get("software"),
                "api_p_fake": float(api_p_fake) if api_p_fake is not None else None,
                "votes_ai": vote_ai,
                "votes_real": vote_real,
                "reasons": reasons,
            }
        }

        # --- SAVE TO HISTORY ---
        if SAVE_HISTORY and user_id:
            try:
                # Write where /history expects: users/{uid}/scans with server timestamp
                (db.collection("users")
                   .document(user_id)
                   .collection("scans")
                   .add({
                        "filename": filename,
                        "decision": payload["decision"],
                        "confidence": payload["confidence"],
                        "threshold": payload["threshold"],
                        "signals": payload["signals"],
                        "timestamp": gcfs.SERVER_TIMESTAMP,  # 🔑 enables order_by in history route
                   }))
            except Exception as e:
                print("⚠️ History write failed:", e)

        # Debug prints
        print("\n==== DEBUG RAW ====")
        print("p_fake:", p_fake, "std:", p_std)
        print("ELA:", ela, "ELA_HARD:", ELA_HARD, "ELA_HIGH:", ELA_HIGH, "ELA_LOW:", ELA_LOW)
        print("lapv:", lapv, "exif:", exif)
        print("api_p_fake:", api_p_fake)
        print("votes → AI:", vote_ai, "REAL:", vote_real)
        print("→ decision:", decision, "| conf:", decision_conf, "| reasons:", reasons)
        print("===================\n")

        return jsonify(payload), 200

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.remove(tmp_path); os.rmdir(tmp_dir)
        except Exception:
            pass
