import { dbStore } from '@/lib/store';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const book = await dbStore.getBookById(id);
    if (!book) {
      return notFoundResponse('Book not found');
    }
    return successResponse(book, 'Book details retrieved');
  } catch (error) {
    console.error(`Error in GET /api/books/${params?.id}:`, error);
    return errorResponse('Failed to retrieve book');
  }
}

export async function PUT(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only library staff or administrators can update books');
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updated = await dbStore.updateBook(id, body);
    if (!updated) {
      return notFoundResponse('Book not found');
    }
    return successResponse(updated, 'Book updated successfully');
  } catch (error) {
    console.error(`Error in PUT /api/books/${params?.id}:`, error);
    return errorResponse('Failed to update book');
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getAuthenticatedUser(request);
    if (user && !['Admin', 'Super Admin', 'Librarian'].includes(user.role)) {
      return forbiddenResponse('Only library staff or administrators can delete books');
    }

    const { id } = await params;
    const deleted = await dbStore.deleteBook(id);
    if (!deleted) {
      return notFoundResponse('Book not found');
    }
    return successResponse(deleted, 'Book removed from catalog');
  } catch (error) {
    console.error(`Error in DELETE /api/books/${params?.id}:`, error);
    return errorResponse('Failed to delete book');
  }
}
