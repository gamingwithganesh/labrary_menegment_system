import mongoose from 'mongoose';

// ==========================================
// 1. User Schema (Students, Faculty, Staff, Librarians, Admins)
// ==========================================
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['Super Admin', 'Admin', 'Librarian', 'Faculty', 'Student', 'Staff', 'Student/Faculty'], 
      default: 'Student',
      index: true
    },
    userType: { type: String, enum: ['Student', 'Faculty', 'Staff', 'Librarian', 'Admin', 'Super Admin'], default: 'Student' },
    studentId: { type: String, sparse: true, index: true },
    enrollmentNo: { type: String, sparse: true },
    employeeId: { type: String, sparse: true },
    department: { type: String, default: 'General', index: true },
    course: { type: String, default: 'General' },
    academicYear: { type: String, default: '2026-27' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    
    // Multi-tenant SaaS Context
    institution: { type: String, default: 'Central Campus' },
    collegeName: { type: String, default: '' },
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true },
    
    // Status & Borrowing Controls
    status: { type: String, enum: ['Active', 'Suspended', 'Pending', 'Archived'], default: 'Active', index: true },
    activeLoans: { type: Number, default: 0 },
    maxBorrowLimit: { type: Number, default: 5 },
    fineAmount: { type: Number, default: 0 },
    
    // Digital BT Pass Data
    btCardNumber: { type: String, sparse: true, index: true },
    btCardIssueDate: { type: String, default: '2026-10-05' },
    btCardValidUntil: { type: String, default: '2027-06-30' },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ==========================================
// 2. Physical Book Copy Sub-Schema
// ==========================================
const BookCopySchema = new mongoose.Schema({
  accessionNumber: { type: String, required: true, trim: true },
  barcode: { type: String, required: true, trim: true },
  qrCode: { type: String },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair', 'Damaged', 'Repair Required', 'Lost'], 
    default: 'Good' 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Issued', 'Reserved', 'Lost', 'Damaged', 'Under Repair', 'Removed'], 
    default: 'Available',
    index: true 
  },
  purchaseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  purchasePrice: { type: Number, default: 0 },
  vendor: { type: String, default: 'Academic Suppliers' },
  invoiceNumber: { type: String, default: '' },
  location: { type: String, default: 'Main Stack' }
});

// ==========================================
// 3. Book Title Master Schema
// ==========================================
const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    subtitle: { type: String, default: '' },
    author: { type: String, required: true, trim: true, index: true },
    coAuthor: { type: String, default: '' },
    isbn: { type: String, required: true, trim: true, index: true },
    isbn13: { type: String, default: '', trim: true },
    category: { type: String, required: true, trim: true, index: true },
    subject: { type: String, default: '', index: true },
    language: { type: String, default: 'English' },
    edition: { type: String, default: '1st Ed' },
    publisher: { type: String, default: 'Academic Press' },
    year: { type: Number, default: 2026 },
    pages: { type: Number, default: 450 },
    price: { type: Number, default: 450 },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    keywords: [{ type: String }],
    
    // Stack and Shelf Arrangement
    rack: { type: String, default: 'Rack CS-01' },
    shelf: { type: String, default: 'Shelf A' },
    row: { type: String, default: 'Row 1' },
    location: { type: String, default: 'Rack CS-01' },
    classificationCode: { type: String, default: '004.16' },
    accessionCode: { type: String, sparse: true },
    
    // Quantities & Physical Copies
    copies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    copiesList: [BookCopySchema],
    
    // Multi-tenant association
    collegeName: { type: String, default: '' },
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true },
    status: { type: String, enum: ['Available', 'Issued', 'Reserved', 'Maintenance', 'Archived'], default: 'Available', index: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ==========================================
// 4. Circulation & Loan Transaction Schema
// ==========================================
const CirculationSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    bookTitle: { type: String, required: true },
    accessionNumber: { type: String, default: '', index: true },
    barcode: { type: String, default: '', index: true },
    memberId: { type: String, required: true, index: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String, index: true },
    memberRole: { type: String, default: 'Student' },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true, index: true },
    returnDate: { type: String, default: null },
    status: { type: String, enum: ['Active', 'Overdue', 'Returned', 'Lost', 'Damaged'], default: 'Active', index: true },
    fine: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    waivedAmount: { type: Number, default: 0 },
    waivedBy: { type: String, default: '' },
    conditionOnReturn: { type: String, default: 'Good' },
    renewedCount: { type: Number, default: 0 },
    issuedBy: { type: String, default: 'Librarian Desk' },
    transactionId: { type: String, default: () => `TXN-${Date.now()}` },
    
    // Multi-tenant association
    collegeName: { type: String, default: '' },
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 5. Reservation / Hold Queue Schema
// ==========================================
const ReservationSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    bookTitle: { type: String, required: true },
    bookAuthor: { type: String, default: '' },
    bookCategory: { type: String, default: 'General' },
    rackLocation: { type: String, default: 'Main Stack' },
    
    // Member Details
    memberId: { type: String, required: true, index: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String, index: true },
    studentId: { type: String, default: '' },
    department: { type: String, default: 'General' },
    
    // Smart Queue & Timeline
    reservationDate: { type: String, required: true },
    expiryDate: { type: String, default: '' },
    expectedAvailableDate: { type: String, default: '' },
    estimatedWaitDays: { type: Number, default: 0 },
    queuePosition: { type: Number, default: 1 },
    requestType: { type: String, enum: ['Issue Request', 'Waitlist Hold'], default: 'Issue Request' },
    status: { 
      type: String, 
      enum: ['Pending', 'Ready for Pickup', 'Fulfilled', 'Cancelled', 'Expired'], 
      default: 'Pending', 
      index: true 
    },
    priority: { type: Number, default: 1 },
    pickupDeadline: { type: String, default: '' },
    
    // Multi-tenant association
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 6. Serial / Periodical Subscriptions
// ==========================================
const SerialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issn: { type: String, required: true, trim: true },
    frequency: { type: String, default: 'Monthly' },
    publisher: { type: String, default: 'Academic Press' },
    vendor: { type: String, default: 'Direct Publisher' },
    subscriptionStart: { type: String, default: () => new Date().toISOString().split('T')[0] },
    subscriptionEnd: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Renewal Pending', 'Expired'], default: 'Active' },
    lastReceivedIssue: { type: String, default: 'Vol 1 Issue 1' },
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 7. Vendors & Procurement Schema
// ==========================================
const VendorOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  orderDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  itemsCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  invoiceNumber: { type: String, default: '' },
  status: { type: String, enum: ['Ordered', 'Received', 'Partial', 'Cancelled'], default: 'Ordered' },
  items: [{
    title: String,
    author: String,
    isbn: String,
    quantity: Number,
    unitPrice: Number
  }]
});

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    rating: { type: Number, default: 5 },
    orders: [VendorOrderSchema],
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 8. Inventory Stock Verification & Audit Log
// ==========================================
const InventoryAuditSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, index: true },
    auditedBy: { type: String, default: 'Librarian' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    totalExpected: { type: Number, default: 0 },
    totalScanned: { type: Number, default: 0 },
    foundCount: { type: Number, default: 0 },
    missingCount: { type: Number, default: 0 },
    extraCount: { type: Number, default: 0 },
    discrepancies: [{
      barcode: String,
      accessionNumber: String,
      title: String,
      status: { type: String, enum: ['Found', 'Missing', 'Extra', 'Damaged'] },
      notes: String
    }],
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 9. Institutional Settings & Fine Policies
// ==========================================
const SettingSchema = new mongoose.Schema(
  {
    collegeCode: { type: String, required: true, unique: true, index: true },
    collegeId: { type: String, default: '', index: true },
    libraryName: { type: String, default: 'Central Technical Library' },
    finePerDay: { type: Number, default: 10 },
    gracePeriodDays: { type: Number, default: 2 },
    maxFinePerBook: { type: Number, default: 500 },
    maxBorrowStudent: { type: Number, default: 5 },
    maxBorrowFaculty: { type: Number, default: 10 },
    issuePeriodDaysStudent: { type: Number, default: 14 },
    issuePeriodDaysFaculty: { type: Number, default: 30 },
    maxRenewals: { type: Number, default: 2 },
    academicYear: { type: String, default: '2026-27' },
    workingHours: { type: String, default: '8:00 AM - 8:00 PM' },
    holidays: [{
      date: String,
      name: String
    }],
    departments: [{ type: String }]
  },
  { timestamps: true }
);

// ==========================================
// 10. Notification Schema
// ==========================================
const NotificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, default: 'ALL', index: true },
    recipientEmail: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['DUE_SOON', 'OVERDUE', 'RESERVATION_AVAILABLE', 'FINE_GENERATED', 'ANNOUNCEMENT', 'SYSTEM'], 
      default: 'SYSTEM',
      index: true
    },
    isRead: { type: Boolean, default: false },
    collegeCode: { type: String, default: '', index: true },
    collegeId: { type: String, default: '', index: true }
  },
  { timestamps: true }
);

// ==========================================
// 11. College / Multi-tenant SaaS Schema
// ==========================================
const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true, lowercase: true },
    adminPassword: { type: String, default: 'admin123' },
    location: { type: String, default: '' },
    libraryName: { type: String, default: 'Knowledge Resource Center' },
    tagline: { type: String, default: '' },
    plan: { type: String, default: 'Standard Institutional' },
    duration: { type: String, default: '12 Months' },
    price: { type: Number, default: 15000 },
    renewalDate: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Paused'], default: 'Active', index: true },
    studentsCount: { type: Number, default: 0 },
    lastPing: { type: String, default: 'Just now' },
    health: { type: String, default: 'Optimal' }
  },
  { timestamps: true }
);

// ==========================================
// 12. System Broadcast Schema
// ==========================================
const BroadcastSchema = new mongoose.Schema(
  {
    target: { type: String, default: 'All Colleges' },
    message: { type: String, required: true },
    severity: { type: String, default: 'Info Notice' },
    time: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

// ==========================================
// 13. Audit Log Schema
// ==========================================
const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    userEmail: { type: String, default: 'system', index: true },
    userRole: { type: String, default: 'System' },
    tenantId: { type: String, default: '' },
    collegeCode: { type: String, default: '', index: true },
    entity: { type: String, default: 'General' },
    entityId: { type: String, default: '' },
    details: { type: String },
    ip: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Export Mongoose Models with re-compilation prevention
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export const Circulation = mongoose.models.Circulation || mongoose.model('Circulation', CirculationSchema);
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
export const Serial = mongoose.models.Serial || mongoose.model('Serial', SerialSchema);
export const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
export const InventoryAudit = mongoose.models.InventoryAudit || mongoose.model('InventoryAudit', InventoryAuditSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const College = mongoose.models.College || mongoose.model('College', CollegeSchema);
export const Broadcast = mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
