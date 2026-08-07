const BookTitle = require('../models/BookTitle');
const BookCopy = require('../models/BookCopy');

const search = async (req, res, next) => {
  try {
    const {
      q = '',
      title,
      author,
      isbn,
      accessionNumber,
      subject,
      publisher,
      year,
      language,
      documentType,
      keywords
    } = req.query;

    const filter = { $and: [] };

    if (q) {
      filter.$and.push({ $text: { $search: q } });
    }

    if (title) {
      filter.$and.push({ title: new RegExp(title, 'i') });
    }
    if (author) {
      filter.$and.push({ authors: new RegExp(author, 'i') });
    }
    if (isbn) {
      filter.$and.push({ isbn: isbn.trim() });
    }
    if (subject) {
      filter.$and.push({ subject: new RegExp(subject, 'i') });
    }
    if (publisher) {
      filter.$and.push({ publisher: new RegExp(publisher, 'i') });
    }
    if (year) {
      filter.$and.push({ publicationYear: Number(year) });
    }
    if (language) {
      filter.$and.push({ language: new RegExp(language, 'i') });
    }
    if (documentType) {
      filter.$and.push({ documentType: documentType });
    }
    if (keywords) {
      filter.$and.push({ keywords: new RegExp(keywords, 'i') });
    }
    if (accessionNumber) {
      filter.$and.push({ accessionNumber: accessionNumber });
    }

    const criteria = filter.$and.length ? filter : {};
    const titles = await BookTitle.find(criteria).lean();

    const results = await Promise.all(
      titles.map(async (titleDoc) => {
        const copies = await BookCopy.find({ titleId: titleDoc._id, status: { $ne: 'withdrawn' } }).lean();
        return { ...titleDoc, copies };
      })
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
};

const getTitle = async (req, res, next) => {
  try {
    const title = await BookTitle.findById(req.params.id).lean();
    if (!title) {
      return res.status(404).json({ error: 'Title not found' });
    }
    const copies = await BookCopy.find({ titleId: title._id }).lean();
    res.json({ title, copies });
  } catch (error) {
    next(error);
  }
};

module.exports = { search, getTitle };