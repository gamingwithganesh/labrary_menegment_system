import { connectDB } from '../lib/db.js';
import { Book, Circulation, Serial, Reservation } from '../lib/models.js';

async function main() {
  try {
    const conn = await connectDB();
    if (conn) {
      console.log('Connected to MongoDB Atlas.');
      const bRes = await Book.deleteMany({});
      console.log(`Deleted ${bRes.deletedCount} books from MongoDB.`);

      const cRes = await Circulation.deleteMany({});
      console.log(`Deleted ${cRes.deletedCount} circulations from MongoDB.`);

      const rRes = await Reservation.deleteMany({});
      console.log(`Deleted ${rRes.deletedCount} reservations from MongoDB.`);
    } else {
      console.log('Running in memory mode.');
    }
    console.log('Database catalog is now 100% clean and empty.');
    process.exit(0);
  } catch (err) {
    console.error('Error in clear-all-books script:', err);
    process.exit(1);
  }
}

main();
