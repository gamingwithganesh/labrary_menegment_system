# 🗄️ LIB-MAN Enterprise: Database Schema & Collections

## 1. Primary Collections

### `users`
- `name`, `email` (unique index), `username`, `passwordHash`, `role` (`Super Admin`, `Admin`, `Librarian`, `Faculty`, `Student`, `Staff`), `studentId`, `department`, `collegeCode`, `collegeId`, `btCardNumber`, `activeLoans`, `fineAmount`, `status`, `isArchived`.

### `books`
- `title`, `author`, `isbn` (indexed), `category`, `publisher`, `year`, `rack`, `shelf`, `row`, `copies`, `availableCopies`, `copiesList`: `[{ accessionNumber, barcode, qrCode, condition, status, purchaseDate, purchasePrice, vendor, location }]`, `collegeCode`, `isArchived`.

### `circulations`
- `bookId`, `bookTitle`, `accessionNumber`, `barcode`, `memberId`, `memberName`, `memberEmail`, `issueDate`, `dueDate`, `returnDate`, `status` (`Active`, `Returned`, `Overdue`, `Lost`, `Damaged`), `fine`, `finePaid`, `waivedAmount`, `waivedBy`, `conditionOnReturn`, `renewedCount`, `transactionId`, `collegeCode`.

### `inventoryaudits`
- `auditId`, `auditedBy`, `date`, `totalExpected`, `totalScanned`, `foundCount`, `missingCount`, `extraCount`, `discrepancies`, `collegeCode`.

### `vendors`
- `name`, `contactPerson`, `email`, `phone`, `orders`: `[{ orderNumber, orderDate, items, totalAmount, status }]`, `collegeCode`.

### `settings`
- `collegeCode` (unique index), `libraryName`, `finePerDay`, `gracePeriodDays`, `maxBorrowStudent`, `maxBorrowFaculty`, `academicYear`, `holidays`, `departments`.

### `auditlogs`
- `action`, `userEmail`, `userRole`, `collegeCode`, `entity`, `entityId`, `details`, `ip`, `timestamp` (indexed).
