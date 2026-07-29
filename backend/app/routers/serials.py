from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.models.schemas import SerialControlCreate, SerialControlResponse, NewspaperLog
from app.core.security import require_roles
from app.database import get_database

router = APIRouter(prefix="/serials", tags=["Serial Control"])

DEMO_SERIALS = [
    {
        "_id": "ser_501",
        "title": "IEEE Transactions on Pattern Analysis and Machine Intelligence",
        "frequency": "Monthly",
        "publisher": "IEEE Computer Society",
        "issn": "0162-8828",
        "subscription_start": "2026-01-01",
        "subscription_end": "2026-12-31",
        "cost": 1200.0,
        "status": "Active",
        "non_receipt_reminders": ["Issue No. 2 Reminder sent on Feb 05, 2026"],
        "newspaper_logs": [],
        "bound_volumes": ["Vol. 47 (2025) Bound", "Vol. 46 (2024) Bound"]
    },
    {
        "_id": "ser_502",
        "title": "ACM Computing Surveys",
        "frequency": "Quarterly",
        "publisher": "Association for Computing Machinery",
        "issn": "0360-0300",
        "subscription_start": "2025-06-01",
        "subscription_end": "2026-05-31",
        "cost": 850.0,
        "status": "Active",
        "non_receipt_reminders": [],
        "newspaper_logs": [],
        "bound_volumes": ["Vol. 56 (2024-2025)"]
    }
]

DEMO_NEWSPAPERS = [
    {"date": "2026-07-28", "paper_name": "The New York Times", "copies_received": 5, "received_by": "Library Staff A"},
    {"date": "2026-07-28", "paper_name": "The Wall Street Journal", "copies_received": 3, "received_by": "Library Staff A"},
    {"date": "2026-07-28", "paper_name": "Times of India / Financial Express", "copies_received": 10, "received_by": "Library Staff B"}
]

def serial_to_dict(s):
    return {
        "id": str(s.get("_id", s.get("id"))),
        "title": s.get("title"),
        "frequency": s.get("frequency"),
        "publisher": s.get("publisher"),
        "issn": s.get("issn", ""),
        "subscription_start": str(s.get("subscription_start")),
        "subscription_end": str(s.get("subscription_end")),
        "cost": float(s.get("cost", 0.0)),
        "status": s.get("status", "Active"),
        "non_receipt_reminders": s.get("non_receipt_reminders", []),
        "newspaper_logs": s.get("newspaper_logs", []),
        "bound_volumes": s.get("bound_volumes", [])
    }

@router.get("", response_model=List[SerialControlResponse])
async def list_serials():
    db = get_database()
    items = []
    if db is not None:
        try:
            cursor = db.serials.find()
            async for doc in cursor:
                items.append(serial_to_dict(doc))
        except Exception:
            pass

    if not items:
        for s in DEMO_SERIALS:
            items.append(serial_to_dict(s))

    return items

@router.post("", response_model=SerialControlResponse)
async def create_serial(
    serial_in: SerialControlCreate,
    current_user: dict = Depends(require_roles(["Admin", "Library Staff"]))
):
    db = get_database()
    new_s = serial_in.model_dump()
    new_s["non_receipt_reminders"] = []
    new_s["newspaper_logs"] = []
    new_s["bound_volumes"] = []

    if db is not None:
        try:
            res = await db.serials.insert_one(new_s)
            new_s["_id"] = res.inserted_id
            return serial_to_dict(new_s)
        except Exception:
            pass

    new_s["_id"] = f"ser_{len(DEMO_SERIALS) + 501}"
    DEMO_SERIALS.append(new_s)
    return serial_to_dict(new_s)

@router.get("/newspapers", response_model=List[NewspaperLog])
async def get_newspaper_logs():
    return DEMO_NEWSPAPERS

@router.post("/newspapers", response_model=NewspaperLog)
async def add_newspaper_log(
    log_in: NewspaperLog,
    current_user: dict = Depends(require_roles(["Admin", "Library Staff"]))
):
    DEMO_NEWSPAPERS.insert(0, log_in.model_dump())
    return log_in
