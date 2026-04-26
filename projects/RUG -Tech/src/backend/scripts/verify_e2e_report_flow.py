"""
End-to-end smoke test for FundusAI backend:
  login -> create patient -> upload case -> poll status -> fetch analysis -> fetch reports (JSON + PDF URL)

Usage (PowerShell):
  python -m scripts.verify_e2e_report_flow --base http://127.0.0.1:8000 --email you@example.com --password yourpass

Notes:
  - Requires the backend API to be running.
  - Requires Celery worker + Redis to be running if you want real analysis + report generation.
  - If the AI worker isn't running, upload will still succeed but status may remain "processing".
"""

from __future__ import annotations

import argparse
import os
import time
import uuid
from dataclasses import dataclass
from typing import Any

import httpx
from PIL import Image
from io import BytesIO


@dataclass
class Cfg:
    base: str
    email: str
    password: str
    timeout_s: float
    poll_s: float
    poll_timeout_s: float


def _api_prefix(base: str) -> str:
    return base.rstrip("/") + "/api/v1"


def _raise_if_fail(envelope: dict[str, Any], label: str) -> dict[str, Any]:
    if not envelope.get("success"):
        raise RuntimeError(f"{label} failed: {envelope.get('error')}")
    return envelope


def _make_demo_fundus_png_bytes(size: int = 512) -> bytes:
    # A synthetic image is enough to exercise upload+pipeline wiring.
    img = Image.new("RGB", (size, size), color=(20, 20, 20))
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--base", default=os.getenv("FUNDUS_BASE", "http://127.0.0.1:8000"))
    p.add_argument("--email", default=os.getenv("FUNDUS_EMAIL", ""))
    p.add_argument("--password", default=os.getenv("FUNDUS_PASSWORD", ""))
    p.add_argument("--timeout", type=float, default=float(os.getenv("FUNDUS_TIMEOUT_S", "30")))
    p.add_argument("--poll-interval", type=float, default=float(os.getenv("FUNDUS_POLL_S", "2")))
    p.add_argument("--poll-timeout", type=float, default=float(os.getenv("FUNDUS_POLL_TIMEOUT_S", "90")))
    args = p.parse_args()

    if not args.email or not args.password:
        raise SystemExit("Missing --email/--password (or FUNDUS_EMAIL/FUNDUS_PASSWORD env vars).")

    cfg = Cfg(
        base=args.base,
        email=args.email,
        password=args.password,
        timeout_s=args.timeout,
        poll_s=args.poll_interval,
        poll_timeout_s=args.poll_timeout,
    )

    api = _api_prefix(cfg.base)

    with httpx.Client(timeout=cfg.timeout_s) as c:
        # 1) Login
        login_res = c.post(
            f"{api}/auth/login",
            json={"email": cfg.email, "password": cfg.password},
        ).json()
        _raise_if_fail(login_res, "login")
        token = login_res["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2) Create patient
        medical_id = f"E2E-{uuid.uuid4().hex[:8]}"
        patient_res = c.post(
            f"{api}/patients",
            headers=headers,
            json={
                "fullName": "E2E Patient",
                "dateOfBirth": "1970-01-01",
                "gender": "other",
                "contact": "+977-0000000000",
                "medicalId": medical_id,
            },
        ).json()
        _raise_if_fail(patient_res, "create patient")
        patient_id = patient_res["data"]["id"]

        # 3) Upload case (multipart)
        img_bytes = _make_demo_fundus_png_bytes()
        files = {"image": ("e2e-fundus.png", img_bytes, "image/png")}
        data = {"patient_id": patient_id}
        upload_res = c.post(
            f"{api}/cases/upload",
            headers=headers,
            files=files,
            data=data,
        ).json()
        _raise_if_fail(upload_res, "upload case")
        case_id = upload_res["data"]["caseId"]

        # 4) Poll status
        deadline = time.time() + cfg.poll_timeout_s
        status_val = None
        while time.time() < deadline:
            st = c.get(f"{api}/cases/{case_id}/status", headers=headers).json()
            _raise_if_fail(st, "poll status")
            status_val = st["data"]["status"]
            if status_val in ("awaiting_review", "quality_failed", "failed", "approved", "rejected"):
                break
            time.sleep(cfg.poll_s)

        print(f"case_id={case_id} status={status_val}")

        # 5) Fetch analysis (may not exist if worker isn't running yet)
        analysis_res = c.get(f"{api}/analysis/{case_id}", headers=headers).json()
        if analysis_res.get("success"):
            print("analysis: ok")
        else:
            print(f"analysis: not ready ({analysis_res.get('error')})")

        # 6) Fetch reports
        doc = c.get(f"{api}/reports/{case_id}/doctor", headers=headers).json()
        if doc.get("success"):
            print("doctor report: ok")
        else:
            print(f"doctor report: not ready ({doc.get('error')})")

        pat = c.get(f"{api}/reports/{case_id}/patient", headers=headers).json()
        if pat.get("success"):
            print("patient report: ok")
        else:
            print(f"patient report: not ready ({pat.get('error')})")

        pdf = c.get(f"{api}/reports/{case_id}/pdf?type=doctor", headers=headers).json()
        if pdf.get("success"):
            print("pdf url: ok")
        else:
            print(f"pdf url: not ready ({pdf.get('error')})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

