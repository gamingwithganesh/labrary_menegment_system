const Loan = require('../models/Loan');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const BookCopy = require('../models/BookCopy');

const normalizeLoan = (loan) => {
  return {
    id: loan._id.toString(),
    copyId: loan.copyId?.toString() || null,
    memberId: loan.memberId?.toString() || null,
    user_id: loan.memberExternalId || loan.memberId?.toString() || '',
    user_name: loan.memberName || loan.user_name || '',
    user_id_card: loan.memberIdCard || loan.user_id_card || '',
    book_title: loan.bookTitle || loan.book_title || loan.copyTitle || '',
    book_isbn: loan.bookISBN || loan.book_isbn || '',
    book_accession_no: loan.bookAccessionNumber || loan.book_accession_no || '',
    issue_date: loan.issueDate,
    due_date: loan.dueDate,
    return_date: loan.returnDate,
    status: loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : 'Issued',
    fine_amount: loan.fineAmount || loan.fine_amount || 0,
    renewal_count: loan.renewalCount || loan.renewal_count || 0
  };
};

const listLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('copyId memberId').sort({ issueDate: -1 }).lean();
    res.json(loans.map(normalizeLoan));
  } catch (error) {
    next(error);
  }
};

const listCirculations = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('copyId memberId').sort({ issueDate: -1 }).lean();
    res.json(loans.map(normalizeLoan));
  } catch (error) {
    next(error);
  }
};

const issueLoan = async (req, res, next) => {
  try {
    const {
      copyId,
      memberId,
      dueDate,
      referenceType = 'regular',
      book_id,
      user_id,
      days_requested = 14,
      user_name,
      book_title,
      book_isbn
    } = req.body;

    let copy = null;
    if (copyId) {
      copy = await BookCopy.findById(copyId);
    } else if (book_id) {
      copy = await BookCopy.findById(book_id);
      if (!copy) {
        copy = await BookCopy.findOne({ accessionNumber: book_id });
      }
    }

    if (!copy) {
      return res.status(404).json({ error: 'Book copy not found' });
    }
    if (copy.status !== 'available') {
      return res.status(400).json({ error: 'Book copy is not available for issue' });
    }

    copy.status = 'issued';
    await copy.save();

    const issueDate = new Date();
    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(issueDate.getTime() + Number(days_requested || 14) * 24 * 60 * 60 * 1000);

    const loan = new Loan({
      copyId: copy._id,
      memberId: memberId || undefined,
      memberExternalId: user_id || undefined,
      memberName: user_name || req.body.member_name || '',
      memberIdCard: req.body.user_id_card || '',
      bookTitle: book_title || copy.title || '',
      bookISBN: book_isbn || copy.isbn || '',
      bookAccessionNumber: copy.accessionNumber,
      issueDate,
      dueDate: calculatedDueDate,
      referenceType,
      status: 'issued',
      fineAmount: 0
    });

    await loan.save();
    res.status(201).json(normalizeLoan(loan.toObject()));
  } catch (error) {
    next(error);
  }
};

const returnLoan = async (req, res, next) => {
  try {
    const { loanId, circulation_id } = req.body;
    const id = loanId || circulation_id;
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const copy = await BookCopy.findById(loan.copyId);
    if (copy) {
      copy.status = 'available';
      await copy.save();
    }

    loan.status = 'returned';
    loan.returnDate = new Date();
    await loan.save();

    res.json(normalizeLoan(loan.toObject()));
  } catch (error) {
    next(error);
  }
};

const renewLoan = async (req, res, next) => {
  try {
    const { loanId, extensionDays = 7 } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    loan.dueDate = new Date(new Date(loan.dueDate).getTime() + extensionDays * 24 * 60 * 60 * 1000);
    loan.renewalCount += 1;
    await loan.save();

    res.json(normalizeLoan(loan.toObject()));
  } catch (error) {
    next(error);
  }
};

const listReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().populate('memberId titleId copyId').sort({ reserveDate: -1 }).lean();
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: { $in: ['Library Staff', 'Student/Faculty Member', 'Administrator'] } }).lean();
    res.json(members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listLoans,
  listCirculations,
  issueLoan,
  returnLoan,
  renewLoan,
  listReservations,
  createReservation,
  listMembers
};