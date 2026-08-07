const BookTitle = require('../models/BookTitle');
const BookCopy = require('../models/BookCopy');

const mapBookCopy = (copy) => {
  const title = copy.titleId || {};
  return {
    id: copy._id.toString(),
    title: title.title || copy.title || '',
    authors: title.authors || copy.authors || [],
    subject: title.subject || copy.subject || '',
    isbn: title.isbn || copy.isbn || '',
    accession_no: copy.accessionNumber || copy.accession_no || '',
    shelf_location: copy.shelfLocation || copy.shelf_location || '',
    publisher: title.publisher || copy.publisher || '',
    publication_year: title.publicationYear || copy.publicationYear || copy.publication_year || null,
    copies_total: copy.copiesTotal || 1,
    copies_available: copy.copiesAvailable || (copy.status === 'available' ? 1 : 0),
    status: copy.status,
    barcode: copy.barcode || '',
    cost: copy.cost || 0,
    vendor: copy.vendor || null,
    invoice: copy.invoice || null,
    createdAt: copy.createdAt
  };
};

const getBooks = async (req, res, next) => {
  try {
    const { search = '', subject = '' } = req.query;
    const copies = await BookCopy.find().populate('titleId').lean();
    const filtered = copies.filter((copy) => {
      const title = copy.titleId || {};
      const combined = [
        title.title,
        (title.authors || []).join(' '),
        title.subject,
        title.isbn,
        copy.accessionNumber,
        copy.shelfLocation
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || combined.includes(search.toLowerCase());
      const matchesSubject = !subject || subject === 'All' || (title.subject || '').toLowerCase() === subject.toLowerCase();
      return matchesSearch && matchesSubject;
    });
    res.json(filtered.map(mapBookCopy));
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      title,
      authors,
      subject,
      isbn,
      accession_no,
      shelf_location,
      publisher,
      publication_year,
      copies_total = 1,
      copies_available = 1,
      cost = 0
    } = req.body;

    // ensure accession number exists (generate if missing) and is unique
    const accessionNo = accession_no || `ACC-${Date.now()}`;
    const existingCopy = await BookCopy.findOne({ accessionNumber: accessionNo });
    if (existingCopy) {
      return res.status(409).json({ error: 'Accession number already exists' });
    }

    const titleRecord = new BookTitle({
      title,
      authors: Array.isArray(authors) ? authors : String(authors || '').split(',').map((a) => a.trim()).filter(Boolean),
      subject,
      isbn,
      publisher,
      publicationYear: publication_year || undefined
    });
    await titleRecord.save();

    const bookCopy = new BookCopy({
      titleId: titleRecord._id,
      accessionNumber: accessionNo,
      shelfLocation: shelf_location,
      status: 'available',
      copiesTotal: Number(copies_total) || 1,
      copiesAvailable: Number(copies_available) || Number(copies_total) || 1,
      cost: Number(cost) || 0
    });

    await bookCopy.save();
    const result = await BookCopy.findById(bookCopy._id).populate('titleId').lean();
    res.status(201).json(mapBookCopy(result));
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const copy = await BookCopy.findById(id).populate('titleId');
    if (!copy) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const titleUpdates = {};
    if (body.title) titleUpdates.title = body.title;
    if (body.authors) titleUpdates.authors = Array.isArray(body.authors) ? body.authors : String(body.authors).split(',').map((a) => a.trim()).filter(Boolean);
    if (body.subject) titleUpdates.subject = body.subject;
    if (body.isbn) titleUpdates.isbn = body.isbn;
    if (body.publisher) titleUpdates.publisher = body.publisher;
    if (body.publication_year) titleUpdates.publicationYear = Number(body.publication_year);

    if (Object.keys(titleUpdates).length > 0) {
      const titleRecord = copy.titleId || new BookTitle({ title: body.title || 'Untitled' });
      Object.assign(titleRecord, titleUpdates);
      await titleRecord.save();
      copy.titleId = titleRecord._id;
    }

    const copyUpdates = {};
    if (body.accession_no) copyUpdates.accessionNumber = body.accession_no;
    if (body.shelf_location) copyUpdates.shelfLocation = body.shelf_location;
    if (body.copies_total !== undefined) copyUpdates.copiesTotal = Number(body.copies_total);
    if (body.copies_available !== undefined) copyUpdates.copiesAvailable = Number(body.copies_available);
    if (body.cost !== undefined) copyUpdates.cost = Number(body.cost);
    if (body.status) copyUpdates.status = body.status;

    Object.assign(copy, copyUpdates);
    await copy.save();

    const result = await BookCopy.findById(copy._id).populate('titleId').lean();
    res.json(mapBookCopy(result));
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const copy = await BookCopy.findById(id);
    if (!copy) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await copy.deleteOne();
    res.json({ status: 'deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook };
