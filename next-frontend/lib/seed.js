import { hashPassword } from './auth.js';
import { User, Book, Circulation, Serial, College, Broadcast } from './models.js';

export const INITIAL_USERS = [
  {
    name: 'Super Admin',
    email: process.env.SUPER_ADMIN_ID || 'admin',
    username: process.env.SUPER_ADMIN_ID || 'admin',
    password: process.env.SUPER_ADMIN_PASSWORD || 'admin.zintech.in',
    role: 'Super Admin',
    department: 'Executive Management',
    institution: 'LIB-MAN Central Cloud',
    status: 'Active',
    activeLoans: 0,
    fineAmount: 0
  }
];

export const INITIAL_BOOKS = [
  {
    title: 'Introduction to Algorithms (CLRS)',
    subtitle: 'A Comprehensive Guide to Algorithms and Data Structures',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    isbn: '978-0262046305',
    isbn13: '978-0262046305',
    category: 'Computer Science',
    subject: 'Data Structures & Algorithms',
    language: 'English',
    edition: '4th Edition',
    publisher: 'MIT Press',
    year: 2022,
    pages: 1312,
    price: 1450,
    rack: 'Rack CS-01',
    shelf: 'Shelf A',
    row: 'Row 1',
    location: 'Rack CS-01 • Shelf A',
    classificationCode: '005.13',
    accessionCode: 'ACC-2026-1001',
    copies: 5,
    availableCopies: 5,
    copiesList: [
      { accessionNumber: 'ACC-2026-1001', barcode: 'BAR-2026-1001', condition: 'New', status: 'Available', location: 'Rack CS-01 • Shelf A' },
      { accessionNumber: 'ACC-2026-1002', barcode: 'BAR-2026-1002', condition: 'Good', status: 'Available', location: 'Rack CS-01 • Shelf A' },
      { accessionNumber: 'ACC-2026-1003', barcode: 'BAR-2026-1003', condition: 'Good', status: 'Available', location: 'Rack CS-01 • Shelf A' },
      { accessionNumber: 'ACC-2026-1004', barcode: 'BAR-2026-1004', condition: 'Good', status: 'Available', location: 'Rack CS-01 • Shelf A' },
      { accessionNumber: 'ACC-2026-1005', barcode: 'BAR-2026-1005', condition: 'New', status: 'Available', location: 'Rack CS-01 • Shelf A' }
    ],
    description: 'The leading comprehensive textbook on modern algorithms covering divide-and-conquer, dynamic programming, greedy algorithms, graph algorithms, and NP-completeness.',
    status: 'Available',
    isArchived: false
  },
  {
    title: 'University Physics with Modern Physics',
    subtitle: 'Foundations of Mechanics, Electromagnetism, and Quantum Concepts',
    author: 'Hugh D. Young, Roger A. Freedman',
    isbn: '978-0135159552',
    isbn13: '978-0135159552',
    category: 'Physics & Engineering',
    subject: 'Applied Physics',
    language: 'English',
    edition: '15th Edition',
    publisher: 'Pearson Education',
    year: 2023,
    pages: 1600,
    price: 1850,
    rack: 'Rack PHY-02',
    shelf: 'Shelf B',
    row: 'Row 2',
    location: 'Rack PHY-02 • Shelf B',
    classificationCode: '530.07',
    accessionCode: 'ACC-2026-2001',
    copies: 4,
    availableCopies: 4,
    copiesList: [
      { accessionNumber: 'ACC-2026-2001', barcode: 'BAR-2026-2001', condition: 'New', status: 'Available', location: 'Rack PHY-02 • Shelf B' },
      { accessionNumber: 'ACC-2026-2002', barcode: 'BAR-2026-2002', condition: 'Good', status: 'Available', location: 'Rack PHY-02 • Shelf B' },
      { accessionNumber: 'ACC-2026-2003', barcode: 'BAR-2026-2003', condition: 'Good', status: 'Available', location: 'Rack PHY-02 • Shelf B' },
      { accessionNumber: 'ACC-2026-2004', barcode: 'BAR-2026-2004', condition: 'Good', status: 'Available', location: 'Rack PHY-02 • Shelf B' }
    ],
    description: 'Internationally renowned for its emphasis on fundamental physics principles, rigorous problem solving, and modern applications in engineering and physical sciences.',
    status: 'Available',
    isArchived: false
  },
  {
    title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
    subtitle: 'Design Principles, Component Cohesion, and Boundary Management',
    author: 'Robert C. Martin (Uncle Bob)',
    isbn: '978-0134494166',
    isbn13: '978-0134494166',
    category: 'Software Engineering',
    subject: 'System Design & Software Patterns',
    language: 'English',
    edition: '1st Edition',
    publisher: 'Prentice Hall',
    year: 2021,
    pages: 432,
    price: 899,
    rack: 'Rack SE-03',
    shelf: 'Shelf C',
    row: 'Row 1',
    location: 'Rack SE-03 • Shelf C',
    classificationCode: '005.1',
    accessionCode: 'ACC-2026-3001',
    copies: 6,
    availableCopies: 6,
    copiesList: [
      { accessionNumber: 'ACC-2026-3001', barcode: 'BAR-2026-3001', condition: 'New', status: 'Available', location: 'Rack SE-03 • Shelf C' },
      { accessionNumber: 'ACC-2026-3002', barcode: 'BAR-2026-3002', condition: 'New', status: 'Available', location: 'Rack SE-03 • Shelf C' },
      { accessionNumber: 'ACC-2026-3003', barcode: 'BAR-2026-3003', condition: 'Good', status: 'Available', location: 'Rack SE-03 • Shelf C' },
      { accessionNumber: 'ACC-2026-3004', barcode: 'BAR-2026-3004', condition: 'Good', status: 'Available', location: 'Rack SE-03 • Shelf C' },
      { accessionNumber: 'ACC-2026-3005', barcode: 'BAR-2026-3005', condition: 'Good', status: 'Available', location: 'Rack SE-03 • Shelf C' },
      { accessionNumber: 'ACC-2026-3006', barcode: 'BAR-2026-3006', condition: 'Good', status: 'Available', location: 'Rack SE-03 • Shelf C' }
    ],
    description: 'Essential guide on designing resilient, decoupled, testable software architectures with SOLID principles and domain-driven component design.',
    status: 'Available',
    isArchived: false
  }
];
export const INITIAL_CIRCULATIONS = [];
export const INITIAL_SERIALS = [];
export const INITIAL_COLLEGES = [];

export async function seedDatabase() {
  try {
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin.zintech.in';
    const adminId = process.env.SUPER_ADMIN_ID || 'admin';
    const passwordHash = await hashPassword(adminPassword);

    // Upsert the Super Admin account in MongoDB Atlas
    await User.findOneAndUpdate(
      { $or: [{ email: adminId }, { username: adminId }, { role: 'Super Admin' }] },
      {
        name: 'Super Admin',
        email: adminId,
        username: adminId,
        passwordHash,
        role: 'Super Admin',
        department: 'Executive Management',
        institution: 'LIB-MAN Central Cloud',
        status: 'Active',
        activeLoans: 0,
        fineAmount: 0
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Clean up all legacy demo users from MongoDB Atlas
    await User.deleteMany({
      email: { $in: ['admin@libman.edu', 'librarian@libman.edu', 'student@libman.edu', 'meera@libman.edu', 'ananya@libman.edu', 'superadmin@libman.edu'] }
    });

    // Clean up any legacy seed demo books, circulations, serials, and colleges for clean minimalist state
    await Book.deleteMany({ accessionCode: { $in: ['ACC-2026-8849', 'ACC-2026-8850', 'ACC-2026-8851', 'ACC-2026-8852', 'ACC-2026-8853'] } });
    await Circulation.deleteMany({ bookId: { $in: ['seed-clrs', 'seed-physics', 'seed-cleancode'] } });
    await Serial.deleteMany({ issn: { $in: ['0098-5589', '0028-0836', '0360-0300'] } });
    await College.deleteMany({ code: { $in: ['IIT-PUNE', 'XAVIER-MUM', 'METRO-MED', 'APEX-DELHI'] } });
  } catch (err) {
    console.warn('Seeding check completed:', err.message);
  }
}
