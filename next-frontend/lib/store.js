import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { 
  User, 
  Book, 
  Circulation, 
  Reservation, 
  Serial, 
  Vendor, 
  InventoryAudit, 
  Setting, 
  Notification, 
  College, 
  Broadcast, 
  AuditLog 
} from './models.js';
import { INITIAL_USERS, INITIAL_BOOKS, INITIAL_CIRCULATIONS, INITIAL_SERIALS, INITIAL_COLLEGES } from './seed.js';
import { hashPassword, comparePassword } from './auth.js';

// In-memory persistent state if MongoDB is not connected
let memoryStore = global._libmanMemoryStore;

if (!memoryStore) {
  memoryStore = global._libmanMemoryStore = {
    users: [],
    books: [],
    circulations: [],
    reservations: [],
    serials: [],
    vendors: [
      {
        id: 'VEN-001',
        name: 'Oxford University Press India',
        contactPerson: 'Rajesh Kumar',
        email: 'orders@oxfordpress.in',
        phone: '+91 98112 34567',
        address: 'YMCA Library Building, 1 Jai Singh Road, New Delhi',
        rating: 5,
        orders: [
          {
            orderNumber: 'PO-2026-081',
            orderDate: '2026-06-15',
            itemsCount: 25,
            totalAmount: 18500,
            invoiceNumber: 'INV-OUP-9812',
            status: 'Received',
            items: [{ title: 'Operating Systems Principles', author: 'Silberschatz', isbn: '978-0131873254', quantity: 10, unitPrice: 740 }]
          }
        ],
        collegeCode: 'APN-WARDHA'
      },
      {
        id: 'VEN-002',
        name: 'Pearson Higher Education Distribution',
        contactPerson: 'Meenakshi Iyer',
        email: 'distribution@pearson.edu.in',
        phone: '+91 98450 12345',
        address: 'Pearson Tower, Divyasree Technopolis, Bengaluru',
        rating: 5,
        orders: [],
        collegeCode: 'APN-WARDHA'
      }
    ],
    inventoryAudits: [],
    settings: {
      'APN-WARDHA': {
        collegeCode: 'APN-WARDHA',
        libraryName: 'Central Technical Knowledge Resource Center',
        finePerDay: 10,
        gracePeriodDays: 2,
        maxFinePerBook: 500,
        maxBorrowStudent: 5,
        maxBorrowFaculty: 10,
        issuePeriodDaysStudent: 14,
        issuePeriodDaysFaculty: 30,
        maxRenewals: 2,
        academicYear: '2026-27',
        workingHours: '8:00 AM - 8:00 PM',
        holidays: [
          { date: '2026-08-15', name: 'Independence Day' },
          { date: '2026-10-02', name: 'Gandhi Jayanti' }
        ],
        departments: ['Computer Science & Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Applied Science']
      }
    },
    notifications: [
      {
        id: 'notif-1',
        recipientId: 'ALL',
        title: 'Library Holiday Notice',
        message: 'The central library stack and reading room will remain closed on national holidays.',
        type: 'ANNOUNCEMENT',
        isRead: false,
        collegeCode: 'APN-WARDHA',
        createdAt: new Date().toISOString()
      }
    ],
    colleges: [],
    broadcasts: [],
    auditLogs: [],
    initialized: false
  };
}

async function initMemoryStore() {
  if (memoryStore.initialized) return;

  const hashedUsers = [];
  for (const u of INITIAL_USERS) {
    const passwordHash = await hashPassword(u.password);
    hashedUsers.push({
      id: `usr-${u.email.replace(/[^a-z0-9]/gi, '_')}`,
      ...u,
      role: u.role || 'Student',
      userType: u.role || 'Student',
      department: u.department || 'General',
      activeLoans: 0,
      fineAmount: 0,
      maxBorrowLimit: u.role === 'Faculty' ? 10 : 5,
      btCardNumber: u.role === 'Student' || u.role === 'Faculty' ? `BT-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      btCardIssueDate: '2026-10-05',
      btCardValidUntil: '2027-06-30',
      collegeCode: u.collegeCode || 'APN-WARDHA',
      collegeName: u.collegeName || 'Agnihotri Polytechnic Nagthana',
      passwordHash
    });
  }

  memoryStore.users = [...hashedUsers];
  
  memoryStore.books = INITIAL_BOOKS.map((b, i) => {
    const totalCopies = b.copies || 3;
    const copiesList = [];
    for (let c = 1; c <= totalCopies; c++) {
      const acc = `ACC-CS-${1000 + i * 10 + c}`;
      copiesList.push({
        accessionNumber: acc,
        barcode: acc,
        qrCode: `https://libman.edu/verify-book?acc=${acc}`,
        condition: 'Good',
        status: 'Available',
        purchaseDate: '2026-01-10',
        purchasePrice: b.price || 500,
        vendor: 'Oxford University Press India',
        location: b.location || 'Rack CS-01'
      });
    }

    return {
      id: String(i + 1),
      ...b,
      totalCopies,
      availableCopies: totalCopies,
      copiesList,
      rack: b.location ? b.location.split(' ')[0] : 'Rack CS-01',
      shelf: 'Shelf A',
      row: 'Row 1',
      collegeCode: 'APN-WARDHA',
      collegeName: 'Agnihotri Polytechnic Nagthana'
    };
  });

  memoryStore.circulations = INITIAL_CIRCULATIONS.map((c, i) => ({
    id: `CIRC-90${i + 1}`,
    ...c,
    accessionNumber: `ACC-CS-100${i + 1}`,
    barcode: `ACC-CS-100${i + 1}`,
    transactionId: `TXN-90${i + 1}`,
    fine: c.fine || 0,
    finePaid: false,
    renewedCount: 0,
    collegeCode: 'APN-WARDHA'
  }));

  memoryStore.serials = INITIAL_SERIALS.map((s, i) => ({
    id: `SER-${i + 1}`,
    ...s,
    collegeCode: 'APN-WARDHA'
  }));

  memoryStore.colleges = INITIAL_COLLEGES.map((c) => ({ ...c }));
  memoryStore.initialized = true;
}

export const dbStore = {
  // ==========================================
  // AUDIT LOGGING HELPER
  // ==========================================
  async logAudit({ action, userEmail = 'system', userRole = 'System', collegeCode = '', tenantId = '', entity = 'General', entityId = '', details = '', ip = '127.0.0.1' }) {
    try {
      const conn = await connectDB();
      if (conn) {
        await AuditLog.create({
          action,
          userEmail,
          userRole,
          collegeCode,
          tenantId,
          entity,
          entityId,
          details,
          ip
        });
        return;
      }
      await initMemoryStore();
      memoryStore.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        action,
        userEmail,
        userRole,
        collegeCode,
        tenantId,
        entity,
        entityId,
        details,
        ip,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to record audit log:', e.message);
    }
  },

  async getAuditLogs({ collegeCode = '', limit = 100 } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = collegeCode ? { collegeCode } : {};
      return await AuditLog.find(query).sort({ timestamp: -1 }).limit(limit).lean();
    }
    await initMemoryStore();
    let logs = [...memoryStore.auditLogs];
    if (collegeCode) logs = logs.filter(l => !l.collegeCode || l.collegeCode === collegeCode);
    return logs.slice(0, limit);
  },

  // ==========================================
  // AUTH & USERS
  // ==========================================
  async findUserByEmail(identifier) {
    const term = (identifier || '').toLowerCase().trim();
    if (!term) return null;

    const conn = await connectDB();
    if (conn) {
      const adminId = (process.env.SUPER_ADMIN_ID || 'admin').toLowerCase().trim();
      if (term === 'admin' || term === 'superadmin' || term === adminId || term === 'admin@zintech.in') {
        const superUser = await User.findOne({
          $or: [
            { email: adminId },
            { username: adminId },
            { email: 'admin' },
            { username: 'admin' },
            { role: 'Super Admin' }
          ]
        });
        if (superUser) return superUser;
      }
      return await User.findOne({
        $or: [
          { email: term },
          { username: term },
          { studentId: term },
          { btCardNumber: term }
        ]
      });
    }

    await initMemoryStore();
    return memoryStore.users.find(u => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uName = (u.username || '').toLowerCase().trim();
      const uStudentId = (u.studentId || '').toLowerCase().trim();
      const uBt = (u.btCardNumber || '').toLowerCase().trim();
      const adminId = (process.env.SUPER_ADMIN_ID || 'admin').toLowerCase().trim();
      if (term === 'admin' || term === 'superadmin' || term === adminId || term === 'admin@zintech.in') {
        return u.role === 'Super Admin' || uEmail === 'admin' || uEmail === adminId || uName === 'admin' || uName === adminId;
      }
      return uEmail === term || uName === term || uStudentId === term || uBt === term;
    }) || null;
  },

  async findUserById(id) {
    const conn = await connectDB();
    if (conn) {
      return await User.findById(id);
    }
    await initMemoryStore();
    return memoryStore.users.find(u => u.id === id || u._id === id || u._id?.toString() === id) || null;
  },

  async getAllUsers({ collegeCode = '', role = '', search = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = { isArchived: { $ne: true } };
      if (collegeCode) query.collegeCode = collegeCode;
      if (role && role !== 'All') query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { btCardNumber: { $regex: search, $options: 'i' } }
        ];
      }
      return await User.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    let users = [...memoryStore.users].filter(u => !u.isArchived);
    if (collegeCode) users = users.filter(u => !u.collegeCode || u.collegeCode === collegeCode);
    if (role && role !== 'All') users = users.filter(u => u.role === role);
    if (search) {
      const lower = search.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(lower)) ||
        (u.email && u.email.toLowerCase().includes(lower)) ||
        (u.department && u.department.toLowerCase().includes(lower)) ||
        (u.studentId && u.studentId.toLowerCase().includes(lower)) ||
        (u.btCardNumber && u.btCardNumber.toLowerCase().includes(lower))
      );
    }
    return users;
  },

  async createUser(userData) {
    const conn = await connectDB();
    if (conn) {
      const created = await User.create(userData);
      await this.logAudit({
        action: 'USER_CREATED',
        collegeCode: userData.collegeCode || '',
        entity: 'User',
        entityId: created._id.toString(),
        details: `Created user ${userData.name} (${userData.email}) with role ${userData.role}`
      });
      return created;
    }
    await initMemoryStore();
    const newUser = {
      id: `M-${100 + memoryStore.users.length + 1}`,
      activeLoans: 0,
      fineAmount: 0,
      maxBorrowLimit: userData.role === 'Faculty' ? 10 : 5,
      btCardNumber: `BT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      btCardIssueDate: userData.btCardIssueDate || new Date().toISOString().split('T')[0],
      btCardValidUntil: userData.btCardValidUntil || '2027-06-30',
      ...userData,
      createdAt: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    await this.logAudit({
      action: 'USER_CREATED',
      collegeCode: userData.collegeCode || '',
      entity: 'User',
      entityId: newUser.id,
      details: `Created user ${userData.name} (${userData.email}) with role ${userData.role}`
    });
    return newUser;
  },

  async updateUser(id, updateData) {
    const conn = await connectDB();
    if (conn) {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.users.findIndex(u => u.id === id || u._id === id || u._id?.toString() === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updateData };
      return memoryStore.users[idx];
    }
    return null;
  },

  async deleteUser(id) {
    const conn = await connectDB();
    if (conn) {
      // Soft-delete user
      return await User.findByIdAndUpdate(id, { isArchived: true, status: 'Archived' }, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.users.findIndex(u => u.id === id || u._id === id || u._id?.toString() === id);
    if (idx !== -1) {
      memoryStore.users[idx].isArchived = true;
      memoryStore.users[idx].status = 'Archived';
      return memoryStore.users[idx];
    }
    return null;
  },

  // ==========================================
  // BOOKS & CATALOGUING (Title vs Copy Model)
  // ==========================================
  async getBooks({ search = '', category = '', status = '', collegeCode = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = { isArchived: { $ne: true } };
      if (collegeCode) query.collegeCode = collegeCode;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { 'copiesList.accessionNumber': { $regex: search, $options: 'i' } },
          { 'copiesList.barcode': { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (status) {
        query.status = status;
      }
      return await Book.find(query).sort({ createdAt: -1 }).lean();
    }

    await initMemoryStore();
    let result = [...memoryStore.books].filter(b => !b.isArchived);
    if (collegeCode) {
      result = result.filter(b => !b.collegeCode || b.collegeCode === collegeCode);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(b =>
        (b.title && b.title.toLowerCase().includes(lower)) ||
        (b.author && b.author.toLowerCase().includes(lower)) ||
        (b.isbn && b.isbn.toLowerCase().includes(lower)) ||
        (b.category && b.category.toLowerCase().includes(lower)) ||
        (b.subject && b.subject.toLowerCase().includes(lower)) ||
        (b.copiesList && b.copiesList.some(c => 
          (c.accessionNumber && c.accessionNumber.toLowerCase().includes(lower)) ||
          (c.barcode && c.barcode.toLowerCase().includes(lower))
        ))
      );
    }
    if (category && category !== 'All') {
      result = result.filter(b => b.category === category);
    }
    if (status) {
      result = result.filter(b => b.status === status);
    }
    return result;
  },

  async getBookById(id) {
    const conn = await connectDB();
    if (conn) {
      return await Book.findById(id);
    }
    await initMemoryStore();
    return memoryStore.books.find(b => b.id === id || b._id === id || b._id?.toString() === id) || null;
  },

  async findBookByAccessionOrBarcode(identifier, collegeCode = '') {
    const term = (identifier || '').trim();
    if (!term) return null;

    const conn = await connectDB();
    if (conn) {
      const query = {
        $or: [
          { 'copiesList.accessionNumber': term },
          { 'copiesList.barcode': term },
          { isbn: term }
        ]
      };
      if (collegeCode) query.collegeCode = collegeCode;
      return await Book.findOne(query);
    }

    await initMemoryStore();
    return memoryStore.books.find(b => {
      if (collegeCode && b.collegeCode && b.collegeCode !== collegeCode) return false;
      if (b.isbn === term) return true;
      return b.copiesList && b.copiesList.some(c => c.accessionNumber === term || c.barcode === term);
    }) || null;
  },

  async createBook(bookData) {
    const copiesCount = Number(bookData.copies) || 1;
    const copiesList = [];
    for (let i = 1; i <= copiesCount; i++) {
      const acc = bookData.accessionCode 
        ? `${bookData.accessionCode}-C${String(i).padStart(2, '0')}`
        : `ACC-${Date.now().toString().slice(-4)}-${i}`;
      copiesList.push({
        accessionNumber: acc,
        barcode: acc,
        qrCode: `https://libman.edu/verify-book?acc=${acc}`,
        condition: 'New',
        status: 'Available',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: bookData.price || 450,
        vendor: bookData.vendor || 'Direct Publisher',
        location: bookData.location || 'Rack CS-01'
      });
    }

    const payload = {
      ...bookData,
      copies: copiesCount,
      availableCopies: copiesCount,
      copiesList: bookData.copiesList || copiesList
    };

    const conn = await connectDB();
    if (conn) {
      const created = await Book.create(payload);
      await this.logAudit({
        action: 'BOOK_CREATED',
        collegeCode: bookData.collegeCode || '',
        entity: 'Book',
        entityId: created._id.toString(),
        details: `Catalogued new title "${bookData.title}" with ${copiesCount} physical copies`
      });
      return created;
    }

    await initMemoryStore();
    const newBook = {
      id: String(Date.now()),
      ...payload,
      createdAt: new Date().toISOString()
    };
    memoryStore.books.unshift(newBook);
    await this.logAudit({
      action: 'BOOK_CREATED',
      collegeCode: bookData.collegeCode || '',
      entity: 'Book',
      entityId: newBook.id,
      details: `Catalogued new title "${bookData.title}" with ${copiesCount} physical copies`
    });
    return newBook;
  },

  async addCopiesToBook(bookId, count = 1, vendor = 'Academic Suppliers') {
    const book = await this.getBookById(bookId);
    if (!book) throw new Error('Book title not found');

    const newCopies = [];
    const currentCount = book.copiesList ? book.copiesList.length : 0;
    for (let i = 1; i <= count; i++) {
      const acc = `ACC-${book.isbn ? book.isbn.slice(-4) : 'BOOK'}-${currentCount + i}`;
      newCopies.push({
        accessionNumber: acc,
        barcode: acc,
        qrCode: `https://libman.edu/verify-book?acc=${acc}`,
        condition: 'New',
        status: 'Available',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: book.price || 450,
        vendor,
        location: book.location || 'Rack CS-01'
      });
    }

    const updatedCopies = [...(book.copiesList || []), ...newCopies];
    const totalCopies = (book.copies || 0) + count;
    const availableCopies = (book.availableCopies || 0) + count;

    return await this.updateBook(bookId, {
      copies: totalCopies,
      availableCopies,
      copiesList: updatedCopies
    });
  },

  async updateBook(id, updateData) {
    const conn = await connectDB();
    if (conn) {
      return await Book.findByIdAndUpdate(id, updateData, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.books.findIndex(b => b.id === id || b._id === id || b._id?.toString() === id);
    if (idx !== -1) {
      memoryStore.books[idx] = { ...memoryStore.books[idx], ...updateData };
      return memoryStore.books[idx];
    }
    return null;
  },

  async deleteBook(id) {
    const conn = await connectDB();
    if (conn) {
      // Soft delete book record
      return await Book.findByIdAndUpdate(id, { isArchived: true, status: 'Archived' }, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.books.findIndex(b => b.id === id || b._id === id || b._id?.toString() === id);
    if (idx !== -1) {
      memoryStore.books[idx].isArchived = true;
      memoryStore.books[idx].status = 'Archived';
      return memoryStore.books[idx];
    }
    return null;
  },

  // ==========================================
  // CIRCULATION & FINE ENGINE
  // ==========================================
  async getCirculations({ memberId = '', status = '', collegeCode = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = {};
      if (collegeCode) query.collegeCode = collegeCode;
      if (memberId) query.$or = [{ memberId }, { memberEmail: memberId }];
      if (status) query.status = status;
      return await Circulation.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    let result = [...memoryStore.circulations];
    if (collegeCode) result = result.filter(c => !c.collegeCode || c.collegeCode === collegeCode);
    if (memberId) {
      result = result.filter(c => c.memberId === memberId || c.memberEmail === memberId);
    }
    if (status) {
      result = result.filter(c => c.status === status);
    }
    return result;
  },

  async issueBook({ bookId, accessionNumber, memberId, memberName, memberEmail, memberRole = 'Student', collegeCode = '' }) {
    let book = null;
    if (accessionNumber) {
      book = await this.findBookByAccessionOrBarcode(accessionNumber, collegeCode);
    }
    if (!book && bookId) {
      book = await this.getBookById(bookId);
      if (!book) {
        const allBooks = await this.getBooks({ collegeCode });
        book = allBooks.find(b => 
          b.id === bookId || 
          b._id === bookId || 
          b._id?.toString() === bookId || 
          b.title?.toLowerCase() === bookId.toLowerCase()
        );
      }
    }
    if (!book) throw new Error('Book not found in library catalog');

    if ((book.availableCopies === undefined || book.availableCopies <= 0) && (book.copies || 0) <= 0) {
      throw new Error('All copies of this title are currently issued');
    }

    // Verify User Active & Borrow Limits
    const borrower = await this.findUserByEmail(memberEmail || memberId);
    if (borrower && borrower.status === 'Suspended') {
      throw new Error(`Cannot issue book: Member account (${borrower.name}) is currently Suspended.`);
    }

    // Determine Physical Copy Accession
    let targetCopy = null;
    if (book.copiesList && book.copiesList.length > 0) {
      if (accessionNumber) {
        targetCopy = book.copiesList.find(c => c.accessionNumber === accessionNumber || c.barcode === accessionNumber);
      }
      if (!targetCopy) {
        targetCopy = book.copiesList.find(c => c.status === 'Available');
      }
    }

    const assignedAccession = targetCopy ? targetCopy.accessionNumber : `ACC-${Date.now().toString().slice(-4)}`;
    const assignedBarcode = targetCopy ? targetCopy.barcode : assignedAccession;

    // Calculate Due Date based on Role & Policy (14 days student, 30 days faculty)
    const issueDays = memberRole === 'Faculty' ? 30 : 14;
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + issueDays);

    const issueDateStr = now.toISOString().split('T')[0];
    const dueDateStr = due.toISOString().split('T')[0];
    const txnId = `TXN-${Date.now().toString().slice(-6)}`;

    // Create Circulation Transaction
    const circData = {
      bookId: book.id || book._id?.toString(),
      bookTitle: book.title,
      accessionNumber: assignedAccession,
      barcode: assignedBarcode,
      memberId: memberId || borrower?.id || 'M-101',
      memberName: memberName || borrower?.name || 'Student Borrower',
      memberEmail: memberEmail || borrower?.email || '',
      memberRole,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      status: 'Active',
      fine: 0,
      finePaid: false,
      renewedCount: 0,
      transactionId: txnId,
      collegeCode: collegeCode || book.collegeCode || ''
    };

    // Update book copy status and available count
    const nextAvailable = Math.max(0, (book.availableCopies || 1) - 1);
    let updatedCopiesList = book.copiesList || [];
    if (targetCopy) {
      updatedCopiesList = updatedCopiesList.map(c => 
        c.accessionNumber === assignedAccession ? { ...c, status: 'Issued' } : c
      );
    }

    await this.updateBook(book.id || book._id?.toString(), {
      availableCopies: nextAvailable,
      status: nextAvailable === 0 ? 'Issued' : 'Available',
      copiesList: updatedCopiesList
    });

    // Update borrower active loans count
    if (borrower) {
      await this.updateUser(borrower.id || borrower._id?.toString(), {
        activeLoans: (borrower.activeLoans || 0) + 1
      });
    }

    const conn = await connectDB();
    let savedCirc;
    if (conn) {
      savedCirc = await Circulation.create(circData);
    } else {
      await initMemoryStore();
      savedCirc = {
        id: `CIRC-${Date.now().toString().slice(-6)}`,
        ...circData,
        createdAt: new Date().toISOString()
      };
      memoryStore.circulations.unshift(savedCirc);
    }

    await this.logAudit({
      action: 'BOOK_ISSUED',
      collegeCode: collegeCode || book.collegeCode || '',
      entity: 'Circulation',
      entityId: txnId,
      details: `Issued "${book.title}" (Copy: ${assignedAccession}) to ${circData.memberName} (${circData.memberEmail}). Due on ${dueDateStr}.`
    });

    return savedCirc;
  },

  async returnBook(args) {
    const params = typeof args === 'string' ? { circulationId: args } : (args || {});
    const { circulationId, accessionNumber, condition = 'Good', waiveFine = false, waivedBy = '' } = params;
    let circ = null;
    const conn = await connectDB();

    if (conn) {
      if (circulationId) {
        circ = await Circulation.findById(circulationId);
      }
      if (!circ && accessionNumber) {
        circ = await Circulation.findOne({
          $or: [{ accessionNumber }, { barcode: accessionNumber }],
          status: 'Active'
        });
      }
    } else {
      await initMemoryStore();
      if (circulationId) {
        circ = memoryStore.circulations.find(c => c.id === circulationId || c._id === circulationId || c._id?.toString() === circulationId);
      }
      if (!circ && accessionNumber) {
        circ = memoryStore.circulations.find(c => (c.accessionNumber === accessionNumber || c.barcode === accessionNumber) && c.status === 'Active');
      }
    }

    if (!circ) throw new Error('Active circulation record not found for this return');

    const returnDate = new Date();
    const returnDateStr = returnDate.toISOString().split('T')[0];
    const dueDate = new Date(circ.dueDate);
    
    // Overdue Calculation (₹10/day after 2 days grace period)
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const gracePeriod = 2;
    const chargeableDays = Math.max(0, overdueDays - gracePeriod);
    const calculatedFine = waiveFine ? 0 : chargeableDays * 10;

    const updatePayload = {
      returnDate: returnDateStr,
      status: 'Returned',
      fine: calculatedFine,
      finePaid: calculatedFine === 0 || waiveFine,
      conditionOnReturn: condition,
      waivedAmount: waiveFine ? chargeableDays * 10 : 0,
      waivedBy: waiveFine ? (waivedBy || 'Librarian') : ''
    };

    let updatedCirc;
    if (conn) {
      updatedCirc = await Circulation.findByIdAndUpdate(circ._id, updatePayload, { new: true });
    } else {
      const idx = memoryStore.circulations.findIndex(c => c.id === circ.id || c._id === circ._id);
      memoryStore.circulations[idx] = { ...memoryStore.circulations[idx], ...updatePayload };
      updatedCirc = memoryStore.circulations[idx];
    }

    // Restore Book copy availability
    const book = await this.getBookById(circ.bookId);
    if (book) {
      let updatedCopiesList = book.copiesList || [];
      if (circ.accessionNumber) {
        updatedCopiesList = updatedCopiesList.map(c => 
          c.accessionNumber === circ.accessionNumber 
            ? { ...c, status: condition === 'Damaged' ? 'Damaged' : 'Available', condition } 
            : c
        );
      }
      const newAvailable = Math.min(book.copies || 1, (book.availableCopies || 0) + 1);
      await this.updateBook(book.id || book._id?.toString(), {
        availableCopies: newAvailable,
        status: 'Available',
        copiesList: updatedCopiesList
      });
    }

    // Update borrower active loans count
    const borrower = await this.findUserByEmail(circ.memberEmail || circ.memberId);
    if (borrower) {
      await this.updateUser(borrower.id || borrower._id?.toString(), {
        activeLoans: Math.max(0, (borrower.activeLoans || 1) - 1),
        fineAmount: (borrower.fineAmount || 0) + (waiveFine ? 0 : calculatedFine)
      });
    }

    await this.logAudit({
      action: 'BOOK_RETURNED',
      collegeCode: circ.collegeCode || '',
      entity: 'Circulation',
      entityId: circ.transactionId || String(circ._id || circ.id),
      details: `Returned "${circ.bookTitle}" from ${circ.memberName}. Overdue: ${overdueDays} days. Fine: ₹${calculatedFine}. Condition: ${condition}.`
    });

    return updatedCirc;
  },

  async renewBook(args) {
    const params = typeof args === 'string' ? { circulationId: args } : (args || {});
    const { circulationId } = params;
    const conn = await connectDB();
    let circ = null;

    if (conn) {
      circ = await Circulation.findById(circulationId);
    } else {
      await initMemoryStore();
      circ = memoryStore.circulations.find(c => c.id === circulationId || c._id === circulationId || c._id?.toString() === circulationId);
    }

    if (!circ || circ.status !== 'Active') throw new Error('Active loan record not found for renewal');

    if ((circ.renewedCount || 0) >= 2) {
      throw new Error('Maximum renewal limit (2 times) reached for this loan. Please return the book.');
    }

    // Extend due date by 14 days
    const currentDue = new Date(circ.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    if (conn) {
      return await Circulation.findByIdAndUpdate(
        circ._id, 
        { dueDate: newDueDateStr, renewedCount: (circ.renewedCount || 0) + 1 }, 
        { new: true }
      );
    }

    const idx = memoryStore.circulations.findIndex(c => c.id === circ.id || c._id === circ._id);
    memoryStore.circulations[idx].dueDate = newDueDateStr;
    memoryStore.circulations[idx].renewedCount = (circ.renewedCount || 0) + 1;
    return memoryStore.circulations[idx];
  },

  async deleteCirculation(circulationId) {
    const conn = await connectDB();
    if (conn) {
      return await Circulation.findByIdAndDelete(circulationId);
    }
    await initMemoryStore();
    const idx = memoryStore.circulations.findIndex(c => c.id === circulationId || c._id === circulationId || c._id?.toString() === circulationId);
    if (idx !== -1) {
      const removed = memoryStore.circulations.splice(idx, 1);
      return removed[0];
    }
    return null;
  },

  async clearCirculations(collegeCode = '') {
    const conn = await connectDB();
    if (conn) {
      const query = collegeCode ? { collegeCode } : {};
      return await Circulation.deleteMany(query);
    }
    await initMemoryStore();
    if (collegeCode) {
      memoryStore.circulations = memoryStore.circulations.filter(c => c.collegeCode && c.collegeCode !== collegeCode);
    } else {
      memoryStore.circulations = [];
    }
    return { acknowledged: true };
  },

  // ==========================================
  // RESERVATIONS / HOLDS & SMART ISSUE REQUESTS
  // ==========================================
  async getReservations({ collegeCode = '', memberEmail = '', status = '', bookId = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = {};
      if (collegeCode) query.collegeCode = collegeCode;
      if (memberEmail) query.$or = [{ memberEmail }, { memberId: memberEmail }];
      if (status && status !== 'All') query.status = status;
      if (bookId) query.bookId = bookId;
      return await Reservation.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    let result = [...memoryStore.reservations];
    if (collegeCode) result = result.filter(r => !r.collegeCode || r.collegeCode === collegeCode);
    if (memberEmail) result = result.filter(r => r.memberEmail === memberEmail || r.memberId === memberEmail);
    if (status && status !== 'All') result = result.filter(r => r.status === status);
    if (bookId) result = result.filter(r => r.bookId === bookId);
    return result;
  },

  async createReservation({ bookId, memberId, memberName, memberEmail, studentId = '', department = '', collegeCode = '' }) {
    const book = await this.getBookById(bookId);
    if (!book) throw new Error('Book not found in library catalog');

    const borrower = await this.findUserByEmail(memberEmail || memberId);
    if (borrower && borrower.status === 'Suspended') {
      throw new Error(`Cannot place hold: Member account (${borrower.name}) is currently Paused/Suspended.`);
    }

    const effectiveCollegeCode = collegeCode || book.collegeCode || borrower?.collegeCode || '';
    const bId = book.id || book._id?.toString();

    // Check existing active queue for this book
    let queuePosition = 1;
    let daysUntilEarliestDue = 7;
    const conn = await connectDB();

    if (conn) {
      const pendingCount = await Reservation.countDocuments({
        bookId: bId,
        status: { $in: ['Pending', 'Ready for Pickup'] }
      });
      queuePosition = pendingCount + 1;

      // Check active circulation loan due dates for this book
      const activeCirc = await Circulation.find({
        bookId: bId,
        status: 'Active'
      }).sort({ dueDate: 1 }).limit(1).lean();

      if (activeCirc && activeCirc.length > 0 && activeCirc[0].dueDate) {
        const dueTime = new Date(activeCirc[0].dueDate).getTime();
        const now = Date.now();
        const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        daysUntilEarliestDue = Math.max(1, diffDays);
      }
    } else {
      await initMemoryStore();
      const pendingCount = memoryStore.reservations.filter(
        r => r.bookId === bId && (r.status === 'Pending' || r.status === 'Ready for Pickup')
      ).length;
      queuePosition = pendingCount + 1;
    }

    const isAvailableNow = (book.availableCopies || 0) > 0;
    let requestType = isAvailableNow ? 'Issue Request' : 'Waitlist Hold';
    let status = isAvailableNow ? 'Ready for Pickup' : 'Pending';
    let estimatedWaitDays = isAvailableNow ? 0 : (daysUntilEarliestDue + (queuePosition - 1) * 7);
    
    const today = new Date();
    const expectedDateObj = new Date(today.getTime() + estimatedWaitDays * 24 * 60 * 60 * 1000);
    const expectedAvailableDate = expectedDateObj.toISOString().split('T')[0];
    const expiryDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pickupDeadline = isAvailableNow ? new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';

    const resData = {
      bookId: bId,
      bookTitle: book.title,
      bookAuthor: book.author || '',
      bookCategory: book.category || 'General',
      rackLocation: book.location || book.rack || 'Main Stack',
      memberId: memberId || borrower?.id || borrower?._id?.toString() || 'M-101',
      memberName: memberName || borrower?.name || 'Student Borrower',
      memberEmail: memberEmail || borrower?.email || '',
      studentId: studentId || borrower?.studentId || borrower?.employeeId || '',
      department: department || borrower?.department || book.department || 'General',
      reservationDate: today.toISOString().split('T')[0],
      expiryDate,
      expectedAvailableDate,
      estimatedWaitDays,
      queuePosition,
      requestType,
      status,
      priority: queuePosition,
      pickupDeadline,
      collegeCode: effectiveCollegeCode
    };

    if (conn) {
      const created = await Reservation.create(resData);
      await this.logAudit({
        action: 'BOOK_RESERVED',
        collegeCode: effectiveCollegeCode,
        entity: 'Reservation',
        entityId: created._id.toString(),
        details: `${requestType} placed for "${book.title}" by ${resData.memberName} (Status: ${status})`
      });
      return created;
    }

    await initMemoryStore();
    const newRes = {
      id: `RES-${Date.now()}`,
      ...resData,
      createdAt: new Date().toISOString()
    };
    memoryStore.reservations.unshift(newRes);
    await this.logAudit({
      action: 'BOOK_RESERVED',
      collegeCode: effectiveCollegeCode,
      entity: 'Reservation',
      entityId: newRes.id,
      details: `${requestType} placed for "${book.title}" by ${resData.memberName} (Status: ${status})`
    });
    return newRes;
  },

  async updateReservation(id, updateData) {
    const conn = await connectDB();
    if (conn) {
      return await Reservation.findByIdAndUpdate(id, updateData, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.reservations.findIndex(r => r.id === id || r._id === id || r._id?.toString() === id);
    if (idx !== -1) {
      memoryStore.reservations[idx] = { ...memoryStore.reservations[idx], ...updateData };
      return memoryStore.reservations[idx];
    }
    return null;
  },

  async cancelReservation(id) {
    return await this.updateReservation(id, { status: 'Cancelled' });
  },

  // ==========================================
  // INVENTORY STOCK VERIFICATION AUDIT
  // ==========================================
  async runInventoryAudit({ scannedBarcodes = [], auditedBy = 'Librarian', collegeCode = 'APN-WARDHA' }) {
    const books = await this.getBooks({ collegeCode });
    const allExpectedCopies = [];
    
    books.forEach(b => {
      if (b.copiesList && b.copiesList.length > 0) {
        b.copiesList.forEach(c => {
          allExpectedCopies.push({
            accessionNumber: c.accessionNumber,
            barcode: c.barcode,
            title: b.title,
            currentStatus: c.status
          });
        });
      } else {
        allExpectedCopies.push({
          accessionNumber: b.isbn,
          barcode: b.isbn,
          title: b.title,
          currentStatus: b.status
        });
      }
    });

    const scannedSet = new Set(scannedBarcodes.map(s => String(s).trim().toUpperCase()));
    const expectedSet = new Set(allExpectedCopies.map(e => e.barcode.toUpperCase()));

    const discrepancies = [];
    let foundCount = 0;
    let missingCount = 0;
    let extraCount = 0;

    // Check Expected vs Scanned
    allExpectedCopies.forEach(copy => {
      const isScanned = scannedSet.has(copy.barcode.toUpperCase()) || scannedSet.has(copy.accessionNumber.toUpperCase());
      if (isScanned) {
        foundCount++;
        discrepancies.push({
          barcode: copy.barcode,
          accessionNumber: copy.accessionNumber,
          title: copy.title,
          status: 'Found',
          notes: 'Present in stack'
        });
      } else if (copy.currentStatus === 'Issued') {
        discrepancies.push({
          barcode: copy.barcode,
          accessionNumber: copy.accessionNumber,
          title: copy.title,
          status: 'Found',
          notes: 'Currently issued on loan'
        });
      } else {
        missingCount++;
        discrepancies.push({
          barcode: copy.barcode,
          accessionNumber: copy.accessionNumber,
          title: copy.title,
          status: 'Missing',
          notes: 'Expected in stack but not scanned'
        });
      }
    });

    // Check Extra Scanned Items
    scannedBarcodes.forEach(scanned => {
      const code = String(scanned).trim().toUpperCase();
      if (!expectedSet.has(code)) {
        extraCount++;
        discrepancies.push({
          barcode: code,
          accessionNumber: code,
          title: 'Uncatalogued Item',
          status: 'Extra',
          notes: 'Scanned barcode not in catalog'
        });
      }
    });

    const auditRecord = {
      auditId: `AUDIT-${Date.now().toString().slice(-6)}`,
      auditedBy,
      date: new Date().toISOString().split('T')[0],
      totalExpected: allExpectedCopies.length,
      totalScanned: scannedBarcodes.length,
      foundCount,
      missingCount,
      extraCount,
      discrepancies,
      collegeCode
    };

    const conn = await connectDB();
    if (conn) {
      await InventoryAudit.create(auditRecord);
    } else {
      await initMemoryStore();
      memoryStore.inventoryAudits.unshift(auditRecord);
    }

    await this.logAudit({
      action: 'INVENTORY_AUDIT',
      collegeCode,
      entity: 'InventoryAudit',
      entityId: auditRecord.auditId,
      details: `Stock verification completed: ${foundCount} Found, ${missingCount} Missing, ${extraCount} Extra.`
    });

    return auditRecord;
  },

  async getInventoryAudits({ collegeCode = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = collegeCode ? { collegeCode } : {};
      return await InventoryAudit.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    return memoryStore.inventoryAudits;
  },

  // ==========================================
  // VENDORS & PROCUREMENT
  // ==========================================
  async getVendors({ collegeCode = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = collegeCode ? { collegeCode } : {};
      return await Vendor.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    return memoryStore.vendors;
  },

  async createVendor(vendorData) {
    const conn = await connectDB();
    if (conn) {
      return await Vendor.create(vendorData);
    }
    await initMemoryStore();
    const newVen = {
      id: `VEN-${Date.now().toString().slice(-4)}`,
      orders: [],
      ...vendorData,
      createdAt: new Date().toISOString()
    };
    memoryStore.vendors.unshift(newVen);
    return newVen;
  },

  async createPurchaseOrder(vendorId, orderData) {
    const order = {
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Ordered',
      ...orderData
    };

    const conn = await connectDB();
    if (conn) {
      return await Vendor.findByIdAndUpdate(
        vendorId,
        { $push: { orders: order } },
        { new: true }
      );
    }

    await initMemoryStore();
    const idx = memoryStore.vendors.findIndex(v => v.id === vendorId || v._id === vendorId);
    if (idx !== -1) {
      memoryStore.vendors[idx].orders.unshift(order);
      return memoryStore.vendors[idx];
    }
    return null;
  },

  // ==========================================
  // INSTITUTIONAL SETTINGS & POLICIES
  // ==========================================
  async getSettings(collegeCode = 'APN-WARDHA') {
    const conn = await connectDB();
    if (conn) {
      const found = await Setting.findOne({ collegeCode }).lean();
      if (found) return found;
    }
    await initMemoryStore();
    return memoryStore.settings[collegeCode] || {
      collegeCode,
      libraryName: 'Central Technical Knowledge Resource Center',
      finePerDay: 10,
      gracePeriodDays: 2,
      maxFinePerBook: 500,
      maxBorrowStudent: 5,
      maxBorrowFaculty: 10,
      issuePeriodDaysStudent: 14,
      issuePeriodDaysFaculty: 30,
      maxRenewals: 2,
      academicYear: '2026-27',
      workingHours: '8:00 AM - 8:00 PM',
      holidays: [],
      departments: ['Computer Science & Engineering', 'Civil Engineering', 'Mechanical Engineering']
    };
  },

  async updateSettings(collegeCode, updateData) {
    const conn = await connectDB();
    if (conn) {
      return await Setting.findOneAndUpdate(
        { collegeCode },
        { ...updateData, collegeCode },
        { upsert: true, new: true }
      );
    }
    await initMemoryStore();
    memoryStore.settings[collegeCode] = {
      ...(memoryStore.settings[collegeCode] || {}),
      ...updateData,
      collegeCode
    };
    return memoryStore.settings[collegeCode];
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications({ collegeCode = '', recipientEmail = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = {
        $or: [
          { recipientId: 'ALL' },
          { recipientEmail },
          { collegeCode }
        ]
      };
      return await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
    }
    await initMemoryStore();
    return memoryStore.notifications;
  },

  async createNotification(notifData) {
    const conn = await connectDB();
    if (conn) {
      return await Notification.create(notifData);
    }
    await initMemoryStore();
    const newN = {
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notifData
    };
    memoryStore.notifications.unshift(newN);
    return newN;
  },

  // ==========================================
  // PERIODICALS & SERIALS
  // ==========================================
  async getSerials({ collegeCode = '' } = {}) {
    const conn = await connectDB();
    if (conn) {
      const query = collegeCode ? { collegeCode } : {};
      return await Serial.find(query).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    let result = [...memoryStore.serials];
    if (collegeCode) result = result.filter(s => !s.collegeCode || s.collegeCode === collegeCode);
    return result;
  },

  async createSerial(serialData) {
    const conn = await connectDB();
    if (conn) {
      return await Serial.create(serialData);
    }
    await initMemoryStore();
    const newSerial = {
      id: `SER-${Date.now()}`,
      ...serialData,
      createdAt: new Date().toISOString()
    };
    memoryStore.serials.unshift(newSerial);
    return newSerial;
  },

  // ==========================================
  // SUPER ADMIN SAAS COLLEGES
  // ==========================================
  async getColleges() {
    const conn = await connectDB();
    if (conn) {
      return await College.find({}).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    return [...memoryStore.colleges];
  },

  async createCollege(collegeData) {
    const conn = await connectDB();
    if (conn) {
      const college = await College.create(collegeData);
      // Auto-create Admin user for this college
      const passwordHash = await hashPassword(collegeData.adminPassword || 'admin123');
      await User.create({
        name: collegeData.adminName,
        email: collegeData.adminEmail,
        passwordHash,
        role: 'Admin',
        userType: 'Admin',
        institution: collegeData.name,
        collegeName: collegeData.name,
        collegeCode: collegeData.code,
        collegeId: college._id.toString()
      });
      return college;
    }
    await initMemoryStore();
    const newCollege = {
      id: `clg-${Date.now()}`,
      ...collegeData,
      createdAt: new Date().toISOString()
    };
    memoryStore.colleges.unshift(newCollege);

    const passwordHash = await hashPassword(collegeData.adminPassword || 'admin123');
    memoryStore.users.push({
      id: `usr-${collegeData.adminEmail.replace(/[^a-z0-9]/gi, '_')}`,
      name: collegeData.adminName,
      email: collegeData.adminEmail,
      passwordHash,
      role: 'Admin',
      userType: 'Admin',
      institution: collegeData.name,
      collegeName: collegeData.name,
      collegeCode: collegeData.code,
      collegeId: newCollege.id,
      createdAt: new Date().toISOString()
    });
    return newCollege;
  },

  async updateCollege(id, updateData) {
    const conn = await connectDB();
    if (conn) {
      return await College.findByIdAndUpdate(id, updateData, { new: true });
    }
    await initMemoryStore();
    const idx = memoryStore.colleges.findIndex(c => c.id === id || c._id === id || c.code === id);
    if (idx !== -1) {
      memoryStore.colleges[idx] = { ...memoryStore.colleges[idx], ...updateData };
      return memoryStore.colleges[idx];
    }
    return null;
  },

  async deleteCollege(id) {
    const conn = await connectDB();
    if (conn) {
      return await College.findByIdAndDelete(id);
    }
    await initMemoryStore();
    const idx = memoryStore.colleges.findIndex(c => c.id === id || c._id === id || c.code === id);
    if (idx !== -1) {
      const removed = memoryStore.colleges.splice(idx, 1);
      return removed[0];
    }
    return null;
  },

  // ==========================================
  // BROADCASTS
  // ==========================================
  async getBroadcasts() {
    const conn = await connectDB();
    if (conn) {
      return await Broadcast.find({}).sort({ createdAt: -1 }).lean();
    }
    await initMemoryStore();
    return [...memoryStore.broadcasts];
  },

  async createBroadcast(data) {
    const conn = await connectDB();
    if (conn) {
      return await Broadcast.create(data);
    }
    await initMemoryStore();
    const newBroadcast = {
      id: `bc-${Date.now()}`,
      ...data,
      time: new Date().toLocaleTimeString()
    };
    memoryStore.broadcasts.unshift(newBroadcast);
    return newBroadcast;
  }
};
