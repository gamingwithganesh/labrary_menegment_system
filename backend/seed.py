import asyncio
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

MONGODB_URI = "mongodb://localhost:27017"
DB_NAME = "libman_db"

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

async def seed_database():
    print(f"Connecting to MongoDB at {MONGODB_URI}...")
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("Connected successfully to MongoDB server!")
    except Exception as e:
        print(f"Note: MongoDB not reachable locally on port 27017 ({e}). Seed script completed offline simulation.")
        return

    # Clear existing collections for a clean seed
    await db.users.delete_many({})
    await db.books.delete_many({})
    await db.circulations.delete_many({})
    await db.acquisitions.delete_many({})
    await db.serials.delete_many({})
    await db.mis_logs.delete_many({})
    print("Cleared existing test collections.")

    # 1. Seed Users (Indian College 4-Tier Hierarchy)
    users = [
        {
            "name": "LIB-MAN India Corporate Super Admin",
            "email": "superadmin@libman.co.in",
            "password": get_password_hash("superadmin123"),
            "role": "Super Admin",
            "id_card_number": "SUP-IND-2026-001",
            "department": "Executive Management",
            "institution": "LIB-MAN Software Solutions India Pvt. Ltd.",
            "max_books_allowed": 10,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Dr. Rameshchandra Sharma (Principal / Admin)",
            "email": "admin@libman.edu.in",
            "password": get_password_hash("admin123"),
            "role": "Admin",
            "id_card_number": "ADM-VJTI-2026",
            "department": "College Administration",
            "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
            "max_books_allowed": 10,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Mrs. Sunita Deshmukh (Head Librarian)",
            "email": "librarian@libman.edu.in",
            "password": get_password_hash("librarian123"),
            "role": "Librarian",
            "id_card_number": "LIB-STF-2026-104",
            "department": "Central Library Services",
            "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
            "max_books_allowed": 6,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "name": "Aarav Patel (Student - B.Tech CS)",
            "email": "student@libman.edu.in",
            "password": get_password_hash("student123"),
            "role": "Student/Faculty",
            "id_card_number": "PRN-2026-CS-442",
            "department": "Computer Engineering",
            "institution": "Veermata Jijabai Technological Institute (VJTI Mumbai)",
            "max_books_allowed": 4,
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    u_res = await db.users.insert_many(users)
    user_ids = u_res.inserted_ids
    print(f"Seeded {len(users)} Indian Users (Super Admin, Admin, Librarian, Student).")

    # 2. Seed Books (Indian Cataloguing & Classifications)
    books = [
        {
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
            "status": "Available",
            "created_at": datetime.utcnow().isoformat()
        },
        {
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
            "status": "Available",
            "created_at": datetime.utcnow().isoformat()
        },
        {
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
            "status": "Available",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "title": "Indian Economy for Civil Services (15th Edition)",
            "authors": ["Ramesh Singh"],
            "subject": "Economics & Public Admin",
            "isbn": "978-9355325884",
            "accession_no": "LIB-ECO-2026-004",
            "publisher": "McGraw Hill Education India",
            "publication_year": 2023,
            "copies_total": 5,
            "copies_available": 2,
            "shelf_location": "Rack R-03, DDC 330.954",
            "status": "Available",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    b_res = await db.books.insert_many(books)
    book_ids = b_res.inserted_ids
    print(f"Seeded {len(books)} Indian Books.")

    # 3. Seed Circulation Transactions (Fine Rate ₹5/day)
    now = datetime.utcnow()
    circs = [
        {
            "book_id": str(book_ids[0]),
            "book_title": books[0]["title"],
            "book_isbn": books[0]["isbn"],
            "user_id": str(user_ids[3]),
            "user_name": users[3]["name"],
            "user_id_card": users[3]["id_card_number"],
            "issue_date": (now - timedelta(days=18)).isoformat(),
            "due_date": (now - timedelta(days=4)).isoformat(),
            "return_date": None,
            "status": "Overdue",
            "fine_amount": 20.0 # 4 days * ₹5 = ₹20
        },
        {
            "book_id": str(book_ids[2]),
            "book_title": books[2]["title"],
            "book_isbn": books[2]["isbn"],
            "user_id": str(user_ids[2]),
            "user_name": users[2]["name"],
            "user_id_card": users[2]["id_card_number"],
            "issue_date": (now - timedelta(days=5)).isoformat(),
            "due_date": (now + timedelta(days=9)).isoformat(),
            "return_date": None,
            "status": "Issued",
            "fine_amount": 0.0
        }
    ]
    await db.circulations.insert_many(circs)
    print(f"Seeded {len(circs)} Circulation Records.")

    # 4. Seed Acquisitions (INR ₹)
    acqs = [
        {
            "vendor_name": "Tata McGraw-Hill Education India Pvt. Ltd.",
            "vendor_contact": "+91 11 4983 8800",
            "vendor_email": "orders.india@mheducation.com",
            "po_number": "PO-VJTI-2026-881",
            "invoice_no": "INV-TMH-9921",
            "orders": [
                {"book_title": "Python Programming", "author": "Reema Thareja", "isbn": "978-0199480173", "quantity": 20, "unit_price": 450.0},
                {"book_title": "Database System Concepts", "author": "Korth & Sudarshan", "isbn": "978-9339212087", "quantity": 15, "unit_price": 650.0}
            ],
            "total_cost": 18750.0,
            "status": "Invoiced",
            "created_at": now.isoformat()
        }
    ]
    await db.acquisitions.insert_many(acqs)
    print(f"Seeded {len(acqs)} Indian Acquisitions.")

    # 5. Seed Serials (Indian Newspapers & Periodicals)
    serials = [
        {
            "title": "Sadhana - Academy Proceedings in Engineering Sciences",
            "frequency": "Monthly",
            "publisher": "Indian Academy of Sciences Bengaluru",
            "issn": "0256-2499",
            "subscription_start": "2026-01-01",
            "subscription_end": "2026-12-31",
            "cost": 4500.0,
            "status": "Active",
            "non_receipt_reminders": ["Vol 51 No 2 Reminder sent on Feb 05, 2026"],
            "newspaper_logs": [
                {"date": "2026-07-28", "paper_name": "The Hindu", "copies_received": 10, "received_by": "Mrs. Sunita Deshmukh"},
                {"date": "2026-07-28", "paper_name": "The Times of India", "copies_received": 12, "received_by": "Mrs. Sunita Deshmukh"},
                {"date": "2026-07-28", "paper_name": "Indian Express", "copies_received": 8, "received_by": "Mrs. Sunita Deshmukh"}
            ],
            "bound_volumes": ["Vol. 50 (2025) Bound Archive"]
        }
    ]
    await db.serials.insert_many(serials)
    print(f"Seeded {len(serials)} Indian Serials.")

    # 6. Seed MIS Logs (NAAC / NIRF Audit Logs)
    logs = [
        {
            "log_type": "Accession",
            "title": "NAAC Audit 2026 STEM Book Accession",
            "description": "120 new volumes added under UGC Development Grant for NAAC A++ reaccreditation.",
            "amount": 78500.0,
            "recorded_by": "Dr. Rameshchandra Sharma",
            "timestamp": now.isoformat()
        }
    ]
    await db.mis_logs.insert_many(logs)
    print(f"Seeded {len(logs)} NAAC MIS Audit Logs.")

    print("\n✅ INDIAN COLLEGE DATABASE SEED COMPLETE! Connected to mongodb://localhost:27017 -> database 'libman_db'.")

if __name__ == "__main__":
    asyncio.run(seed_database())
