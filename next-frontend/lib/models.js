import mongoose from 'mongoose';

// ==========================================
// 1. User Schema
// ==========================================
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['Super Admin', 'Admin', 'Librarian', 'Faculty', 'Student', 'Student/Faculty'], 
      default: 'Student' 
    },
    department: { type: String, default: 'General' },
    institution: { type: String, default: 'Central Campus' },
    collegeName: { type: String, default: '' },
    collegeCode: { type: String, default: '' },
    collegeId: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
    activeLoans: { type: Number, default: 0 },
    fineAmount: { type: Number, default: 0 },
    studentId: { type: String, sparse: true }
  },
  { timestamps: true }
);

// ==========================================
// 2. Book Schema
// ==========================================
const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    location: { type: String, default: 'Rack CS-01' },
    status: { type: String, enum: ['Available', 'Issued', 'Reserved', 'Maintenance'], default: 'Available', index: true },
    edition: { type: String, default: '1st Ed' },
    publisher: { type: String, default: 'Academic Press' },
    copies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    year: { type: Number, default: 2026 },
    price: { type: Number, default: 450 },
    accessionCode: { type: String, sparse: true }
  },
  { timestamps: true }
);

// ==========================================
// 3. Circulation Schema
// ==========================================
const CirculationSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    bookTitle: { type: String, required: true },
    memberId: { type: String, required: true, index: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true, index: true },
    returnDate: { type: String, default: null },
    status: { type: String, enum: ['Active', 'Overdue', 'Returned'], default: 'Active', index: true },
    fine: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    renewedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ==========================================
// 4. Reservation Schema
// ==========================================
const ReservationSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    bookTitle: { type: String, required: true },
    memberId: { type: String, required: true, index: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String },
    reservationDate: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Fulfilled', 'Cancelled'], default: 'Pending', index: true },
    priority: { type: Number, default: 1 }
  },
  { timestamps: true }
);

// ==========================================
// 5. Serial / Periodical Schema
// ==========================================
const SerialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issn: { type: String, required: true, trim: true },
    frequency: { type: String, default: 'Monthly' },
    vendor: { type: String, default: 'Direct Publisher' },
    subscriptionEnd: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Renewal Pending', 'Expired'], default: 'Active' },
    lastReceivedIssue: { type: String, default: 'Vol 1 Issue 1' }
  },
  { timestamps: true }
);

// ==========================================
// 6. College / Multi-tenant SaaS Schema
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
    status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
    studentsCount: { type: Number, default: 0 },
    lastPing: { type: String, default: 'Just now' },
    health: { type: String, default: 'Optimal' }
  },
  { timestamps: true }
);

// ==========================================
// 7. System Broadcast Schema
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
// 8. Audit Log Schema
// ==========================================
const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    userEmail: { type: String, default: 'system' },
    userRole: { type: String, default: 'System' },
    details: { type: String },
    ip: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent re-compilation of models during Next.js hot-reloads
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export const Circulation = mongoose.models.Circulation || mongoose.model('Circulation', CirculationSchema);
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
export const Serial = mongoose.models.Serial || mongoose.model('Serial', SerialSchema);
export const College = mongoose.models.College || mongoose.model('College', CollegeSchema);
export const Broadcast = mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
