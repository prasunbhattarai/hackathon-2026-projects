from __future__ import annotations

import json
import os
import uuid
from dataclasses import dataclass

import httpx
from dotenv import dotenv_values

BASE = "http://127.0.0.1:8002/api/v1"
TIMEOUT = 30.0


@dataclass
class Result:
    name: str
    ok: bool
    status: int
    detail: str


def call(method: str, path: str, token: str | None = None, body: dict | None = None) -> tuple[bool, int, dict | None, str]:
    headers: dict[str, str] = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    with httpx.Client(timeout=TIMEOUT) as client:
        resp = client.request(method, f"{BASE}{path}", headers=headers, json=body)

    status = resp.status_code
    try:
        payload = resp.json()
    except ValueError:
        return False, status, None, resp.text[:300]

    ok = 200 <= status < 300 and bool(payload.get("success") is True)
    detail = payload.get("error", {}).get("message", "") if not ok else ""
    return ok, status, payload, detail


def ensure_user(email: str, password: str, full_name: str, role: str) -> tuple[int, str]:
    cfg = dotenv_values(".env")
    url = f"{cfg['SUPABASE_URL'].rstrip('/')}/auth/v1/admin/users"
    token = cfg["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name},
        "app_metadata": {"role": role},
    }
    with httpx.Client(timeout=TIMEOUT) as client:
        resp = client.post(url, headers=headers, json=payload)
    return resp.status_code, resp.text[:200]


def main() -> None:
    results: list[Result] = []

    status, body = ensure_user("admin.demo@caredevi.ai", "FundusAdmin123!", "CareDevi Demo Admin", "super_admin")
    results.append(Result("ensure_super_admin_user", status in (200, 422), status, body))

    status, body = ensure_user("doctor.demo@caredevi.ai", "FundusDemo123!", "CareDevi Demo Doctor", "doctor")
    results.append(Result("ensure_doctor_user", status in (200, 422), status, body))

    doc_ok, doc_status, doc_payload, doc_err = call(
        "POST", "/auth/login", body={"email": "doctor.demo@caredevi.ai", "password": "FundusDemo123!"}
    )
    results.append(Result("doctor_login", doc_ok, doc_status, doc_err))

    adm_ok, adm_status, adm_payload, adm_err = call(
        "POST", "/auth/login", body={"email": "admin.demo@caredevi.ai", "password": "FundusAdmin123!"}
    )
    results.append(Result("admin_login", adm_ok, adm_status, adm_err))

    if not (doc_ok and adm_ok and doc_payload and adm_payload):
        print(json.dumps([r.__dict__ for r in results], indent=2))
        return

    doctor_token = doc_payload["data"]["accessToken"]
    admin_token = adm_payload["data"]["accessToken"]

    ok, status, payload, err = call("GET", "/auth/me", token=doctor_token)
    role = payload["data"]["role"] if ok and payload else ""
    results.append(Result("doctor_me", ok and role == "doctor", status, f"role={role}" if ok else err))

    ok, status, payload, err = call("GET", "/auth/me", token=admin_token)
    role = payload["data"]["role"] if ok and payload else ""
    results.append(Result("admin_me", ok and role == "super_admin", status, f"role={role}" if ok else err))

    ok, status, _, err = call("GET", "/admin/stats", token=doctor_token)
    results.append(Result("doctor_admin_stats_forbidden", (not ok) and status == 403, status, err))

    ok, status, _, err = call("GET", "/admin/stats", token=admin_token)
    results.append(Result("admin_admin_stats", ok, status, err))

    ok, status, payload, err = call(
        "POST",
        "/admin/clinics",
        token=admin_token,
        body={"name": f"API Test Clinic {uuid.uuid4().hex[:6]}", "address": "Kathmandu", "phone": "+977-1-5000000"},
    )
    results.append(Result("admin_create_clinic", ok, status, err))

    ok, status, payload, err = call("GET", "/patients?page=1&limit=5", token=admin_token)
    results.append(Result("admin_list_patients", ok, status, err))

    med_id = f"MID-{uuid.uuid4().hex[:8]}"
    ok, status, payload, err = call(
        "POST",
        "/patients",
        token=admin_token,
        body={
            "fullName": "API Test Patient",
            "dateOfBirth": "1988-09-09",
            "gender": "male",
            "contact": "+9779800000000",
            "medicalId": med_id,
        },
    )
    results.append(Result("admin_create_patient", ok, status, err))

    patient_id = payload["data"]["id"] if ok and payload else None
    if patient_id:
        ok2, status2, _, err2 = call("GET", f"/patients/{patient_id}", token=admin_token)
        results.append(Result("admin_get_patient", ok2, status2, err2))

        ok3, status3, _, err3 = call(
            "PUT",
            f"/patients/{patient_id}",
            token=admin_token,
            body={"contact": "+9779811111111"},
        )
        results.append(Result("admin_update_patient", ok3, status3, err3))

    ok, status, payload, err = call("GET", "/cases?page=1&limit=5", token=admin_token)
    results.append(Result("admin_list_cases", ok, status, err))

    case_id = None
    if ok and payload:
        items = payload.get("data", {}).get("items", [])
        if items:
            case_id = items[0].get("id")

    if case_id:
        ok2, status2, _, err2 = call("GET", f"/cases/{case_id}", token=admin_token)
        results.append(Result("admin_case_detail", ok2, status2, err2))

        ok3, status3, _, err3 = call("GET", f"/cases/{case_id}/status", token=admin_token)
        results.append(Result("admin_case_status", ok3, status3, err3))

        ok4, status4, _, err4 = call("GET", f"/reports/{case_id}/doctor", token=admin_token)
        results.append(Result("admin_report_doctor", ok4, status4, err4))

        ok5, status5, _, err5 = call("GET", f"/reports/{case_id}/patient", token=admin_token)
        results.append(Result("admin_report_patient", ok5, status5, err5))

        ok6, status6, _, err6 = call("GET", f"/reports/{case_id}/general", token=admin_token)
        results.append(Result("admin_report_general", ok6, status6, err6))

        ok7, status7, _, err7 = call("GET", f"/reports/{case_id}/pdf?type=doctor", token=admin_token)
        results.append(Result("admin_report_pdf", ok7, status7, err7))

        ok8, status8, _, err8 = call(
            "POST", f"/reports/{case_id}/share", token=admin_token, body={"email": "patient@example.com"}
        )
        results.append(Result("admin_report_share", ok8, status8, err8))
    else:
        results.append(Result("case_dependent_routes_skipped", True, 0, "No cases available in DB for report/detail checks"))

    ok, status, _, err = call("POST", "/auth/logout", token=admin_token, body={})
    results.append(Result("admin_logout", ok, status, err))

    ok, status, _, err = call("POST", "/auth/refresh", body={"refreshToken": "invalid-token"})
    results.append(Result("refresh_invalid_expected_failure", (not ok) and status == 401, status, err))

    print(json.dumps([r.__dict__ for r in results], indent=2))


if __name__ == "__main__":
    main()
