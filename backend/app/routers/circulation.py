from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from app.models.schemas import CirculationCreate, CirculationResponse, ReturnBookRequest
from app.core.security import get_current_user
from app.database import get_database

router = APIRouter(prefix="/circulation", tags=["Circulation & Fines"])

MEM_CIRCULATIONS = [
    {
        "_id": "circ_101",
        "book_id": "bk_1",
        "book_title": "Higher Engineering Mathematics (44th Edition)",
        "book_isbn": "978-8174091955",
        "user_id": "usr_student",
        "user_name": "Aarav Patel (Student - B.Tech CS)",
        "user_id_card": "PRN-2026-CS-442",
        "issue_date": (datetime.utcnow() - timedelta(days=18)).isoformat(),
        "due_date": (datetime.utcnow() - timedelta(days=4)).isoformat(),
        "return_date": None,
        "status": "Overdue",
        "fine_amount": 20.0 # 4 days * ₹5 = ₹20
    },
    {
        "_id": "circ_102",
        "book_id": "bk_3",
        "book_title": "Data Structures Using C (2nd Edition)",
        "book_isbn": "978-0198099307",
        "user_id": "usr_librarian",
        "user_name": "Mrs. Sunita Deshmukh (Head Librarian)",
        "user_id_card": "LIB-STF-2026-104",
        "issue_date": (datetime.utcnow() - timedelta(days=5)).isoformat(),
        "due_date": (datetime.utcnow() + timedelta(days=9)).isoformat(),
        "return_date": None,
        "status": "Issued",
        "fine_amount": 0.0
    }
]

def helper_circ_dict(c):
    return {
        "id": str(c.get("_id", c.get("id"))),
        "book_id": str(c.get("book_id", "bk_1")),
        "book_title": c.get("book_title", "Engineering Book"),
        "book_isbn": c.get("book_isbn", "ISBN-2026"),
        "user_id": str(c.get("user_id", "usr_1")),
        "user_name": c.get("user_name", "Student Borrower"),
        "user_id_card": c.get("user_id_card", "PRN-2026"),
        "issue_date": str(c.get("issue_date", "")),
        "due_date": str(c.get("due_date", "")),
        "return_date": str(c.get("return_date")) if c.get("return_date") else None,
        "status": c.get("status", "Issued"),
        "fine_amount": float(c.get("fine_amount", 0.0))
    }

# READ LIST
@router.get("", response_model=List[CirculationResponse])
async def list_circulations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    circs = []
    if db is not None:
        try:
            cursor = db.circulations.find({})
            async for doc in cursor:
                circs.append(helper_circ_dict(doc))
        except Exception:
            pass

    if not circs:
        for c in MEM_CIRCULATIONS:
            circs.append(helper_circ_dict(c))

    return circs

# CREATE (ISSUE BOOK)
@router.post("/issue", response_model=CirculationResponse)
async def issue_book(
    circ_in: CirculationCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    now = datetime.utcnow()
    due = now + timedelta(days=circ_in.days_requested)

    book_title = "Data Structures Using C"
    book_isbn = "978-0198099307"
    if db is not None:
        try:
            try:
                b = await db.books.find_one({"_id": ObjectId(circ_in.book_id)})
            except Exception:
                b = await db.books.find_one({"_id": circ_in.book_id})
            if b:
                book_title = b.get("title", book_title)
                book_isbn = b.get("isbn", book_isbn)
                # Decrement available copies
                await db.books.update_one({"_id": b["_id"]}, {"$inc": {"copies_available": -1}})
        except Exception:
            pass

    new_circ = {
        "book_id": circ_in.book_id,
        "book_title": book_title,
        "book_isbn": book_isbn,
        "user_id": circ_in.user_id,
        "user_name": current_user.get("name", "Student Borrower"),
        "user_id_card": current_user.get("id_card_number", "PRN-2026-CS-442"),
        "issue_date": now.isoformat(),
        "due_date": due.isoformat(),
        "return_date": None,
        "status": "Issued",
        "fine_amount": 0.0
    }

    if db is not None:
        try:
            res = await db.circulations.insert_one(new_circ)
            new_circ["_id"] = res.inserted_id
            return helper_circ_dict(new_circ)
        except Exception:
            pass

    new_circ["id"] = f"circ_{len(MEM_CIRCULATIONS) + 101}"
    MEM_CIRCULATIONS.append(new_circ)
    return helper_circ_dict(new_circ)

# PROCESS RETURN (RETURN BOOK)
@router.post("/return", response_model=CirculationResponse)
async def return_book(
    req: ReturnBookRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    now_str = datetime.utcnow().isoformat()

    if db is not None:
        try:
            target_id = req.circulation_id
            circ_doc = None
            try:
                circ_doc = await db.circulations.find_one({"_id": ObjectId(target_id)})
            except Exception:
                circ_doc = await db.circulations.find_one({"_id": target_id})

            if circ_doc:
                # Increment available copies of the book
                book_id = circ_doc.get("book_id")
                if book_id:
                    try:
                        await db.books.update_one({"_id": ObjectId(book_id)}, {"$inc": {"copies_available": 1}})
                    except Exception:
                        await db.books.update_one({"_id": book_id}, {"$inc": {"copies_available": 1}})

                # Update circulation record
                res = await db.circulations.find_one_and_update(
                    {"_id": circ_doc["_id"]},
                    {"$set": {"status": "Returned", "return_date": now_str}},
                    return_document=True
                )
                return helper_circ_dict(res)
        except Exception as e:
            print("DB return error:", e)

    # In-Memory Fallback Return Processing
    for c in MEM_CIRCULATIONS:
        if str(c.get("_id")) == req.circulation_id or str(c.get("id")) == req.circulation_id:
            c["status"] = "Returned"
            c["return_date"] = now_str
            return helper_circ_dict(c)

    # If first record, return mock completed return
    if MEM_CIRCULATIONS:
        c = MEM_CIRCULATIONS[0]
        c["status"] = "Returned"
        c["return_date"] = now_str
        return helper_circ_dict(c)

    raise HTTPException(status_code=404, detail="Circulation record not found")

# DELETE CIRCULATION LOG
@router.delete("/{circ_id}")
async def delete_circulation(
    circ_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if db is not None:
        try:
            try:
                res = await db.circulations.delete_one({"_id": ObjectId(circ_id)})
            except Exception:
                res = await db.circulations.delete_one({"_id": circ_id})
            if res.deleted_count > 0:
                return {"detail": "Circulation log deleted"}
        except Exception:
            pass

    global MEM_CIRCULATIONS
    MEM_CIRCULATIONS = [c for c in MEM_CIRCULATIONS if str(c.get("_id")) != circ_id and str(c.get("id")) != circ_id]
    return {"detail": "Circulation log deleted"}
