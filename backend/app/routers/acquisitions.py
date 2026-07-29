from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.models.schemas import AcquisitionCreate, AcquisitionResponse
from app.core.security import require_roles
from app.database import get_database

router = APIRouter(prefix="/acquisitions", tags=["Acquisition & Vendors"])

DEMO_ACQUISITIONS = [
    {
        "_id": "acq_401",
        "vendor_name": "Oxford University Press India",
        "vendor_contact": "+91 11 2345 6789",
        "vendor_email": "orders@oup.org.in",
        "po_number": "PO-2026-CS-088",
        "invoice_no": "INV-OUP-9921",
        "orders": [
            {"book_title": "Quantum Computing Essentials", "author": "Dr. S. Mehta", "isbn": "978-0198877112", "quantity": 10, "unit_price": 45.0},
            {"book_title": "Deep Learning Fundamentals", "author": "Ian Goodfellow", "isbn": "978-0262035613", "quantity": 5, "unit_price": 60.0}
        ],
        "total_cost": 750.0,
        "status": "Invoiced",
        "created_at": "2026-02-10T11:00:00"
    },
    {
        "_id": "acq_402",
        "vendor_name": "Pearson Academic Publishers",
        "vendor_contact": "+1 800 555 0199",
        "vendor_email": "highered@pearson.com",
        "po_number": "PO-2026-EE-042",
        "invoice_no": "",
        "orders": [
            {"book_title": "Microelectronic Circuits", "author": "Adel S. Sedra", "isbn": "978-0190853464", "quantity": 12, "unit_price": 80.0}
        ],
        "total_cost": 960.0,
        "status": "PO Issued",
        "created_at": "2026-02-18T14:30:00"
    }
]

def acq_to_dict(a):
    return {
        "id": str(a.get("_id", a.get("id"))),
        "vendor_name": a.get("vendor_name"),
        "vendor_contact": a.get("vendor_contact"),
        "vendor_email": a.get("vendor_email"),
        "po_number": a.get("po_number"),
        "invoice_no": a.get("invoice_no", ""),
        "orders": a.get("orders", []),
        "total_cost": float(a.get("total_cost", 0.0)),
        "status": a.get("status", "Requisition"),
        "created_at": str(a.get("created_at", datetime.utcnow().isoformat()))
    }

@router.get("", response_model=List[AcquisitionResponse])
async def list_acquisitions():
    db = get_database()
    items = []
    if db is not None:
        try:
            cursor = db.acquisitions.find()
            async for doc in cursor:
                items.append(acq_to_dict(doc))
        except Exception:
            pass

    if not items:
        for a in DEMO_ACQUISITIONS:
            items.append(acq_to_dict(a))

    return items

@router.post("", response_model=AcquisitionResponse)
async def create_acquisition(
    acq_in: AcquisitionCreate,
    current_user: dict = Depends(require_roles(["Admin", "Library Staff"]))
):
    db = get_database()
    new_acq = acq_in.model_dump()
    new_acq["created_at"] = datetime.utcnow().isoformat()

    if db is not None:
        try:
            res = await db.acquisitions.insert_one(new_acq)
            new_acq["_id"] = res.inserted_id
            return acq_to_dict(new_acq)
        except Exception:
            pass

    new_acq["_id"] = f"acq_{len(DEMO_ACQUISITIONS) + 401}"
    DEMO_ACQUISITIONS.append(new_acq)
    return acq_to_dict(new_acq)
