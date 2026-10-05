import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import { Circulation, Book, User } from '../lib/models.js';

async function main() {
  try {
    const conn = await connectDB();
    if (conn) {
      console.log('Connected to MongoDB.');
      const delResult = await Circulation.deleteMany({});
      console.log(`Deleted ${delResult.deletedCount} circulation records.`);

      // Reset active loans on users
      const userUpdate = await User.updateMany({}, { activeLoans: 0 });
      console.log(`Updated ${userUpdate.modifiedCount} users to 0 active loans.`);

      // Reset books available copies
      const books = await Book.find({});
      for (const b of books) {
        let modified = false;
        if (b.copiesList && b.copiesList.length > 0) {
          b.copiesList = b.copiesList.map(c => ({ ...c.toObject(), status: 'Available' }));
          modified = true;
        }
        b.availableCopies = b.copies || 1;
        b.status = 'Available';
        await b.save();
      }
      console.log(`Reset all ${books.length} books to Available status.`);
    } else {
      console.log('Running in In-Memory mode, memoryStore will reset on restart.');
    }
    console.log('Successfully cleared all circulation data.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing circulations:', err);
    process.exit(1);
  }
}

main();
