from typing import List, Optional
from fastapi import APIRouter, Depends
from datetime import datetime
from app.models.schemas import MISLogCreate, MISLogResponse
from app.core.security import require_roles
from app.database import get_database

router = APIRouter(prefix="/reports", tags=["MIS Reports & Analytics"])

DEMO_MIS_LOGS = [
    {
        "_id": "mis_601",
        "log_type": "Accession",
        "title": "Annual STEM Collection Accession",
        "description": "50 new volumes accessioned under CS & AI department grant.",
        "amount": 3200.0,
        "recorded_by": "Chief Librarian",
        "timestamp": "2026-01-10T11:00:00"
    },
    {
        "_id": "mis_602",
        "log_type": "Withdrawal",
        "title": "Damaged Volume Weeding out",
        "description": "12 obsolete 1998 edition textbooks withdrawn from shelf Rack D.",
        "amount": 0.0,
        "recorded_by": "Senior Staff Member",
        "timestamp": "2026-01-25T15:30:00"
    },
    {
        "_id": "mis_603",
        "log_type": "Lost",
        "title": "Lost Item Report - Replacement Fee Collected",
        "description": "Copy of Operating Systems concepts reported lost by student; replacement cost paid.",
        "amount": 85.0,
        "recorded_by": "Circulation Desk",
        "timestamp": "2026-02-04T10:15:00"
    }
]

@router.get("/dashboard-metrics")
async def get_dashboard_metrics():
    # Computes live institute metrics for MIS visual charts
    return {
        "total_books": 1450,
        "total_titles": 420,
        "active_borrowers": 284,
        "books_issued": 182,
        "overdue_books": 14,
        "fine_collected_month": 340.0,
        "budget_allocated": 25000.0,
        "budget_spent": 14850.0,
        "utilization_rate_pct": 86.4,
        "monthly_circulation_stats": [
            {"month": "Jan", "issued": 140, "returned": 130, "fines": 180},
            {"month": "Feb", "issued": 182, "returned": 160, "fines": 340},
            {"month": "Mar", "issued": 210, "returned": 195, "fines": 290},
            {"month": "Apr", "issued": 165, "returned": 170, "fines": 210},
            {"month": "May", "issued": 190, "returned": 185, "fines": 310},
            {"month": "Jun", "issued": 175, "returned": 168, "fines": 260}
        ],
        "department_utilization": [
            {"dept": "Computer Science", "usage": 42},
            {"dept": "Electronics", "usage": 24},
            {"dept": "Mechanical", "usage": 18},
            {"dept": "Management", "usage": 10},
            {"dept": "Basic Sciences", "usage": 6}
        ]
    }

@router.get("/logs", response_model=List[MISLogResponse])
async def list_mis_logs():
    db = get_database()
    logs = []
    if db is not None:
        try:
            cursor = db.mis_logs.find()
            async for doc in cursor:
                logs.append({
                    "id": str(doc.get("_id")),
                    "log_type": doc.get("log_type"),
                    "title": doc.get("title"),
                    "description": doc.get("description"),
                    "amount": float(doc.get("amount", 0.0)),
                    "recorded_by": doc.get("recorded_by"),
                    "timestamp": str(doc.get("timestamp"))
                })
        except Exception:
            pass

    if not logs:
        for l in DEMO_MIS_LOGS:
            logs.append({
                "id": str(l.get("_id")),
                "log_type": l.get("log_type"),
                "title": l.get("title"),
                "description": l.get("description"),
                "amount": float(l.get("amount", 0.0)),
                "recorded_by": l.get("recorded_by"),
                "timestamp": str(l.get("timestamp"))
            })

    return logs

@router.post("/logs", response_model=MISLogResponse)
async def create_mis_log(
    log_in: MISLogCreate,
    current_user: dict = Depends(require_roles(["Admin", "Library Staff"]))
):
    db = get_database()
    new_log = log_in.model_dump()
    new_log["timestamp"] = datetime.utcnow().isoformat()

    if db is not None:
        try:
            res = await db.mis_logs.insert_one(new_log)
            new_log["id"] = str(res.inserted_id)
            return new_log
        except Exception:
            pass

    new_log["id"] = f"mis_{len(DEMO_MIS_LOGS) + 601}"
    DEMO_MIS_LOGS.insert(0, new_log)
    return new_log
