from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
import random
from app.models.schemas import UserCreate, UserResponse, LoginRequest, Token, CaptchaResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user, require_roles
from app.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

MEM_USERS = [
    {
        "_id": "usr_superadmin",
        "name": "LIB-MAN India Corporate Super Admin",
        "email": "superadmin@libman.co.in",
        "password": get_password_hash("superadmin123"),
        "role": "Super Admin",
        "id_card_number": "SUP-IND-2026-001",
        "department": "Executive Management",
        "institution": "LIB-MAN Software Solutions India Pvt. Ltd.",
        "max_books_allowed": 10
    },
    {
        "_id": "usr_admin",
        "name": "Dr. Rameshchandra Sharma (Principal / Admin)",
        "email": "admin@libman.edu.in",
        "password": get_password_hash("admin123"),
        "role": "Admin",
        "id_card_number": "ADM-VJTI-2026",
        "department": "College Administration",
        "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
        "max_books_allowed": 10
    },
    {
        "_id": "usr_librarian",
        "name": "Mrs. Sunita Deshmukh (Head Librarian)",
        "email": "librarian@libman.edu.in",
        "password": get_password_hash("librarian123"),
        "role": "Librarian",
        "id_card_number": "LIB-STF-2026-104",
        "department": "Central Library Services",
        "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
        "max_books_allowed": 6
    },
    {
        "_id": "usr_student",
        "name": "Aarav Patel (Student - B.Tech CS)",
        "email": "student@libman.edu.in",
        "password": get_password_hash("student123"),
        "role": "Student/Faculty",
        "id_card_number": "PRN-2026-CS-442",
        "department": "Computer Engineering",
        "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
        "max_books_allowed": 4
    }
]

CAPTCHA_STORE = {"c_101": {"question": "7 + 5 = ?", "answer": "12"}}

def helper_user_dict(u):
    return {
        "id": str(u.get("_id", u.get("id"))),
        "name": u.get("name"),
        "email": u.get("email"),
        "role": u.get("role", "Student/Faculty"),
        "id_card_number": u.get("id_card_number", "PRN-2026"),
        "department": u.get("department", "General"),
        "institution": u.get("institution", "VJTI Mumbai"),
        "max_books_allowed": u.get("max_books_allowed", 4),
        "created_at": str(u.get("created_at", datetime.utcnow().isoformat()))
    }

@router.get("/captcha", response_model=CaptchaResponse)
async def get_captcha():
    num1 = random.randint(3, 12)
    num2 = random.randint(2, 9)
    cid = f"c_{random.randint(100, 999)}"
    ans = str(num1 + num2)
    CAPTCHA_STORE[cid] = {"question": f"What is {num1} + {num2} ?", "answer": ans}
    return {"captcha_id": cid, "question": f"What is {num1} + {num2} ?"}

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    db = get_database()
    hashed_pwd = get_password_hash(user_in.password)
    new_user = user_in.model_dump()
    new_user["password"] = hashed_pwd
    new_user["created_at"] = datetime.utcnow().isoformat()

    if db is not None:
        try:
            existing = await db.users.find_one({"email": user_in.email})
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
            res = await db.users.insert_one(new_user)
            new_user["_id"] = res.inserted_id
            return helper_user_dict(new_user)
        except Exception:
            pass

    new_user["id"] = f"usr_{len(MEM_USERS) + 1}"
    MEM_USERS.append(new_user)
    return helper_user_dict(new_user)

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    db = get_database()
    user = None

    if db is not None:
        try:
            user = await db.users.find_one({"email": credentials.email})
        except Exception:
            pass

    if not user:
        for u in MEM_USERS:
            if u.get("email") == credentials.email:
                user = u
                break

    if not user or not verify_password(credentials.password, user.get("password", "")):
        demo_accounts = {
            "superadmin@libman.co.in": ("superadmin123", "Super Admin", "LIB-MAN Software Solutions India"),
            "admin@libman.edu.in": ("admin123", "Admin", "VJTI Mumbai"),
            "librarian@libman.edu.in": ("librarian123", "Librarian", "VJTI Mumbai"),
            "student@libman.edu.in": ("student123", "Student/Faculty", "VJTI Mumbai")
        }
        if credentials.email in demo_accounts and credentials.password == demo_accounts[credentials.email][0]:
            role_info = demo_accounts[credentials.email]
            user = {
                "_id": "demo_" + credentials.email.split("@")[0],
                "name": credentials.email.split("@")[0].replace(".", " ").capitalize(),
                "email": credentials.email,
                "role": role_info[1],
                "id_card_number": f"{role_info[1][:3].upper()}-2026-IND",
                "department": "Central Library",
                "institution": role_info[2],
                "max_books_allowed": 5
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid User ID/Email or Password")

    user_dict = helper_user_dict(user)
    token = create_access_token({"sub": user_dict["email"], "role": user_dict["role"], "id": user_dict["id"]})
    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return helper_user_dict(current_user)

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    users = []
    if db is not None:
        try:
            query = {}
            if role:
                query["role"] = role
            cursor = db.users.find(query)
            async for doc in cursor:
                users.append(helper_user_dict(doc))
        except Exception:
            pass

    if not users:
        for u in MEM_USERS:
            ud = helper_user_dict(u)
            if role and ud["role"] != role:
                continue
            users.append(ud)

    return users
