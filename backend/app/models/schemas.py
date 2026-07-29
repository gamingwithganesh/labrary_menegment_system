from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- USER SCHEMAS (4-TIER HIERARCHY) ---
class UserRole:
    SUPER_ADMIN = "Super Admin"      # Company level: creates & manages College Admins
    ADMIN = "Admin font-bold"            # College/Institute level: creates & manages Librarians
    LIBRARIAN = "Librarian font-bold"    # Library Staff: manages tools, books, circulation & students
    STUDENT = "Student/Faculty"      # End user: searches OPAC, views loans & reserves books

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Student/Faculty"
    id_card_number: str
    department: str
    institution: Optional[str] = "Central College"
    max_books_allowed: int = 4

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    captcha: Optional[str] = ""

class CaptchaResponse(BaseModel):
    captcha_id: str
    question: str


# --- BOOK / CATALOG SCHEMAS ---
class BookBase(BaseModel):
    title: str
    authors: List[str]
    subject: str
    isbn: str
    accession_no: str
    publisher: str
    publication_year: int
    copies_total: int = 1
    copies_available: int = 1
    shelf_location: str
    status: str = "Available"

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: str
    created_at: Optional[str] = None


# --- CIRCULATION SCHEMAS ---
class CirculationCreate(BaseModel):
    book_id: str
    user_id: str
    days_requested: int = 14

class CirculationResponse(BaseModel):
    id: str
    book_id: str
    book_title: str
    book_isbn: str
    user_id: str
    user_name: str
    user_id_card: str
    issue_date: str
    due_date: str
    return_date: Optional[str] = None
    status: str
    fine_amount: float = 0.0

class ReturnBookRequest(BaseModel):
    circulation_id: str


# --- ACQUISITION SCHEMAS ---
class VendorOrder(BaseModel):
    book_title: str
    author: str
    isbn: Optional[str] = ""
    quantity: int
    unit_price: float

class AcquisitionCreate(BaseModel):
    vendor_name: str
    vendor_contact: str
    vendor_email: str
    po_number: str
    invoice_no: Optional[str] = ""
    orders: List[VendorOrder]
    total_cost: float
    status: str = "Requisition"

class AcquisitionResponse(AcquisitionCreate):
    id: str
    created_at: Optional[str] = None


# --- SERIAL CONTROL SCHEMAS ---
class NewspaperLog(BaseModel):
    date: str
    paper_name: str
    copies_received: int
    received_by: str

class SerialControlCreate(BaseModel):
    title: str
    frequency: str
    publisher: str
    issn: Optional[str] = ""
    subscription_start: str
    subscription_end: str
    cost: float
    status: str = "Active"

class SerialControlResponse(SerialControlCreate):
    id: str
    non_receipt_reminders: List[str] = []
    newspaper_logs: List[NewspaperLog] = []
    bound_volumes: List[str] = []


# --- MIS LOG SCHEMAS ---
class MISLogCreate(BaseModel):
    log_type: str
    title: str
    description: str
    amount: float = 0.0
    recorded_by: str

class MISLogResponse(MISLogCreate):
    id: str
    timestamp: str
