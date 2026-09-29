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

export const INITIAL_BOOKS = [];
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
