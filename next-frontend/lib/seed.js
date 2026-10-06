import { hashPassword } from './auth.js';
import { User, Book, Circulation, Serial, College, Broadcast } from './models.js';

export const INITIAL_USERS = [
  {
    name: 'Super Admin',
    email: 'admin',
    username: 'admin',
    password: 'admin.zintech.in',
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

let seedingPromise = null;

export async function seedDatabase() {
  if (seedingPromise) return seedingPromise;
  
  seedingPromise = (async () => {
    try {
      const adminPassword = (process.env.SUPER_ADMIN_PASSWORD || 'admin.zintech.in').trim();
      const adminId = (process.env.SUPER_ADMIN_ID || 'admin').trim();
      const passwordHash = await hashPassword(adminPassword);

      // Fast check if Super Admin exists
      const existing = await User.findOne({
        $or: [
          { email: new RegExp(`^${adminId}$`, 'i') },
          { username: new RegExp(`^${adminId}$`, 'i') },
          { role: 'Super Admin' }
        ]
      });

      if (!existing) {
        await User.create({
          name: 'Super Admin',
          email: adminId.toLowerCase(),
          username: adminId.toLowerCase(),
          passwordHash,
          role: 'Super Admin',
          department: 'Executive Management',
          institution: 'LIB-MAN Central Cloud',
          status: 'Active',
          activeLoans: 0,
          fineAmount: 0
        });
      }
    } catch (err) {
      console.warn('Seeding check completed:', err.message);
    }
  })();

  return seedingPromise;
}

