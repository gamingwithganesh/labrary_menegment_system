import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, badRequestResponse, forbiddenResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    const books = await dbStore.getBooks({ search, category, status });
    return successResponse(books, 'Books retrieved successfully');
  } catch (error) {
    console.error('Error in GET /api/books:', error);
    return errorResponse('Failed to retrieve books');
  }
}

export async function POST(request) {
  try {
    const user = getAuthenticatedUser(request);
    // Allow demo or authenticated staff
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only library staff or administrators can catalog new books');
    }

    const body = await request.json().catch(() => ({}));
    const { title, author, isbn, category, location, edition, publisher, copies, price, year } = body;

    if (!title || !author) {
      return badRequestResponse('Book title and author are required fields');
    }

    const accessionCode = `ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedCopies = Number(copies) || 1;

    const newBook = await dbStore.createBook({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn ? isbn.trim() : `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: category || 'General',
      location: location || 'Rack CS-01',
      status: 'Available',
      edition: edition || '1st Ed',
      publisher: publisher || 'Academic Press',
      copies: parsedCopies,
      availableCopies: parsedCopies,
      price: Number(price) || 450,
      year: Number(year) || 2026,
      accessionCode
    });

    return successResponse(newBook, 'Book catalogued successfully', 201);
  } catch (error) {
    console.error('Error in POST /api/books:', error);
    return errorResponse('Failed to catalog book');
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      await dbStore.clearBooks();
      return successResponse(null, 'All books have been removed from the database');
    }

    return badRequestResponse('Please provide clearAll=true parameter');
  } catch (error) {
    console.error('Error in DELETE /api/books:', error);
    return errorResponse('Failed to clear books');
  }
}
