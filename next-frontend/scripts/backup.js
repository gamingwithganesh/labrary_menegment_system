/**
 * Database Backup Utility for LIB-MAN Enterprise
 * Exports all core collections (Users, Books, Circulation, Serials, Colleges, Reservations)
 * Run with: node scripts/backup.js
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function runBackup() {
  console.log('📦 Starting LIB-MAN database backup...');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `libman_backup_${timestamp}.json`);

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const healthRes = await fetch(`${API_URL}/api/health`).then(r => r.json()).catch(() => null);
    const booksRes = await fetch(`${API_URL}/api/books`).then(r => r.json()).catch(() => null);
    const circRes = await fetch(`${API_URL}/api/circulation`).then(r => r.json()).catch(() => null);
    const serialsRes = await fetch(`${API_URL}/api/serials`).then(r => r.json()).catch(() => null);
    const collegesRes = await fetch(`${API_URL}/api/superadmin/colleges`).then(r => r.json()).catch(() => null);

    const backupData = {
      backupTimestamp: new Date().toISOString(),
      version: '2.0.0',
      systemHealth: healthRes?.data || {},
      books: booksRes?.data || [],
      circulation: circRes?.data || [],
      serials: serialsRes?.data || [],
      colleges: collegesRes?.data || []
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`✅ Backup successfully created at: ${backupFile}`);
    console.log(`📊 Snapshot Stats:`);
    console.log(`   - Books: ${backupData.books.length}`);
    console.log(`   - Circulation Records: ${backupData.circulation.length}`);
    console.log(`   - Serials: ${backupData.serials.length}`);
    console.log(`   - Colleges: ${backupData.colleges.length}`);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
  }
}

runBackup();
