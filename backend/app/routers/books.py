from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.models.schemas import BookCreate, BookResponse
from app.core.security import get_current_user
from app.database import get_database

router = APIRouter(prefix="/books", tags=["Acquisition & Cataloguing"])

MEM_BOOKS = [
    {
        "_id": "bk_1",
        "title": "Higher Engineering Mathematics (44th Edition)",
        "authors": ["Dr. B.S. Grewal"],
        "subject": "Mathematics",
        "isbn": "978-8174091955",
        "accession_no": "LIB-MATH-2026-001",
        "publisher": "Khanna Publishers New Delhi",
        "publication_year": 2021,
        "copies_total": 10,
        "copies_available": 6,
        "shelf_location": "Rack M-02, DDC 510",
        "status": "Available"
    },
    {
        "_id": "bk_2",
        "title": "A Textbook of Electrical Technology (Vol 1)",
        "authors": ["B.L. Theraja", "A.K. Theraja"],
        "subject": "Electrical Engineering",
        "isbn": "978-8121924405",
        "accession_no": "LIB-EE-2026-002",
        "publisher": "S. Chand Publishing India",
        "publication_year": 2020,
        "copies_total": 8,
        "copies_available": 3,
        "shelf_location": "Rack E-01, DDC 621.3",
        "status": "Available"
    },
    {
        "_id": "bk_3",
        "title": "Data Structures Using C (2nd Edition)",
        "authors": ["Reema Thareja"],
        "subject": "Computer Science",
        "isbn": "978-0198099307",
        "accession_no": "LIB-CS-2026-003",
        "publisher": "Oxford University Press India",
        "publication_year": 2018,
        "copies_total": 12,
        "copies_available": 7,
        "shelf_location": "Rack C-04, DDC 005.7",
        "status": "Available"
    }
]

def helper_book_dict(b):
    return {
        "id": str(b.get("_id", b.get("id"))),
        "title": b.get("title"),
        "authors": b.get("authors", []),
        "subject": b.get("subject", "General"),
        "isbn": b.get("isbn", ""),
        "accession_no": b.get("accession_no", ""),
        "publisher": b.get("publisher", ""),
        "publication_year": b.get("publication_year", 2024),
        "copies_total": b.get("copies_total", 1),
        "copies_available": b.get("copies_available", 1),
        "shelf_location": b.get("shelf_location", "Main Stacks"),
        "status": b.get("status", "Available"),
        "created_at": str(b.get("created_at", datetime.utcnow().isoformat()))
    }

# READ LIST
@router.get("", response_model=List[BookResponse])
async def list_books(
    search: Optional[str] = None,
    subject: Optional[str] = None
):
    db = get_database()
    books = []
    if db is not None:
        try:
            query = {}
            if subject:
                query["subject"] = subject
            if search:
                query["$or"] = [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"authors": {"$regex": search, "$options": "i"}},
                    {"isbn": {"$regex": search, "$options": "i"}},
                    {"accession_no": {"$regex": search, "$options": "i"}}
                ]
            cursor = db.books.find(query)
            async for doc in cursor:
                books.append(helper_book_dict(doc))
        except Exception:
            pass

    if not books:
        for b in MEM_BOOKS:
            bd = helper_book_dict(b)
            if subject and bd["subject"] != subject:
                continue
            if search and search.lower() not in bd["title"].lower() and search.lower() not in bd["isbn"].lower():
                continue
            books.append(bd)

    return books

# CREATE
@router.post("", response_model=BookResponse)
async def create_book(
    book_in: BookCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    new_book = book_in.model_dump()
    new_book["created_at"] = datetime.utcnow().isoformat()

    if db is not None:
        try:
            res = await db.books.insert_one(new_book)
            new_book["_id"] = res.inserted_id
            return helper_book_dict(new_book)
        except Exception:
            pass

    new_book["id"] = f"bk_{len(MEM_BOOKS) + 1}"
    MEM_BOOKS.append(new_book)
    return helper_book_dict(new_book)

# UPDATE (PUT)
@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    book_in: BookCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    update_data = book_in.model_dump()

    if db is not None:
        try:
            try:
                oid = ObjectId(book_id)
                res = await db.books.find_one_and_update(
                    {"_id": oid},
                    {"$set": update_data},
                    return_document=True
                )
            except Exception:
                res = await db.books.find_one_and_update(
                    {"_id": book_id},
                    {"$set": update_data},
                    return_document=True
                )
            if res:
                return helper_book_dict(res)
        except Exception:
            pass

    for b in MEM_BOOKS:
        if str(b.get("_id")) == book_id or str(b.get("id")) == book_id:
            b.update(update_data)
            return helper_book_dict(b)

    raise HTTPException(status_code=404, detail="Book not found")

# DELETE
@router.delete("/{book_id}")
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if db is not None:
        try:
            try:
                oid = ObjectId(book_id)
                res = await db.books.delete_one({"_id": oid})
            except Exception:
                res = await db.books.delete_one({"_id": book_id})
            if res.deleted_count > 0:
                return {"detail": "Book deleted successfully"}
        except Exception:
            pass

    global MEM_BOOKS
    MEM_BOOKS = [b for b in MEM_BOOKS if str(b.get("_id")) != book_id and str(b.get("id")) != book_id]
    return {"detail": "Book deleted successfully"}
