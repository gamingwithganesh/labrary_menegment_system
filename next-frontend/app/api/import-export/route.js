import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/store';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user || (user.role !== 'Admin' && user.role !== 'Librarian' && user.role !== 'Super Admin')) {
      return errorResponse('Staff privileges required for bulk data operations', 403);
    }

    const body = await request.json();
    const { type, records } = body; // type: 'users' | 'books'

    if (!Array.isArray(records) || records.length === 0) {
      return errorResponse('records must be a non-empty array of objects', 400);
    }

    const collegeCode = user.collegeCode || 'APN-WARDHA';
    let successful = 0;
    let failed = 0;
    const errors = [];

    if (type === 'users') {
      for (const row of records) {
        try {
          if (!row.name || !row.email) {
            failed++;
            errors.push(`Row missing name or email: ${JSON.stringify(row)}`);
            continue;
          }
          const passwordHash = await hashPassword(row.password || 'libman123');
          await dbStore.createUser({
            name: row.name,
            email: row.email.toLowerCase().trim(),
            role: row.role || 'Student',
            department: row.department || 'General',
            studentId: row.studentId || row.enrollmentNo || '',
            collegeCode,
            collegeName: user.collegeName || '',
            passwordHash
          });
          successful++;
        } catch (e) {
          failed++;
          errors.push(`Error creating user ${row.email}: ${e.message}`);
        }
      }
    } else if (type === 'books') {
      for (const row of records) {
        try {
          if (!row.title || !row.author) {
            failed++;
            errors.push(`Row missing title or author: ${JSON.stringify(row)}`);
            continue;
          }
          await dbStore.createBook({
            title: row.title,
            author: row.author,
            isbn: row.isbn || `ISBN-${Date.now().toString().slice(-6)}`,
            category: row.category || 'General',
            copies: Number(row.copies) || 1,
            price: Number(row.price) || 450,
            location: row.location || 'Rack CS-01',
            collegeCode,
            collegeName: user.collegeName || ''
          });
          successful++;
        } catch (e) {
          failed++;
          errors.push(`Error creating book ${row.title}: ${e.message}`);
        }
      }
    } else {
      return errorResponse('Invalid import type. Use "users" or "books".', 400);
    }

    return successResponse({
      total: records.length,
      successful,
      failed,
      errors
    }, `Bulk import summary: ${successful} imported successfully, ${failed} failed.`, 201);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
