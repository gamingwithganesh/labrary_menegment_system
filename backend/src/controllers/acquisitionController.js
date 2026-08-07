const BookTitle = require('../models/BookTitle');
const BookCopy = require('../models/BookCopy');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const Acquisition = require('../models/Acquisition');

const listBookTitles = async (req, res, next) => {
  try {
    const titles = await BookTitle.find().sort({ createdAt: -1 }).lean();
    res.json(titles);
  } catch (error) {
    next(error);
  }
};

const createBookTitle = async (req, res, next) => {
  try {
    const bookTitle = new BookTitle(req.body);
    await bookTitle.save();
    res.status(201).json(bookTitle);
  } catch (error) {
    next(error);
  }
};

const listBookCopies = async (req, res, next) => {
  try {
    const copies = await BookCopy.find().populate('titleId vendor invoice').sort({ createdAt: -1 }).lean();
    res.json(copies);
  } catch (error) {
    next(error);
  }
};

const createBookCopy = async (req, res, next) => {
  try {
    const bookCopy = new BookCopy(req.body);
    await bookCopy.save();
    res.status(201).json(bookCopy);
  } catch (error) {
    next(error);
  }
};

const listVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 }).lean();
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

const listPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find().populate('vendor').sort({ orderDate: -1 }).lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const order = new PurchaseOrder(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const listInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().populate('vendor purchaseOrder').sort({ dueDate: -1 }).lean();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

const normalizeAcquisition = (acquisition) => ({
  id: acquisition._id.toString(),
  vendor_name: acquisition.vendorName || acquisition.vendor_name || '',
  vendor_contact: acquisition.vendorContact || acquisition.vendor_contact || '',
  vendor_email: acquisition.vendorEmail || acquisition.vendor_email || '',
  po_number: acquisition.poNumber || acquisition.po_number || '',
  invoice_no: acquisition.invoiceNo || acquisition.invoice_no || '',
  orders: (acquisition.orders || []).map((order) => ({
    book_title: order.bookTitle || order.book_title || '',
    author: order.author || '',
    isbn: order.isbn || '',
    quantity: order.quantity || 0,
    unit_price: order.unitPrice || order.unit_price || 0
  })),
  total_cost: acquisition.totalCost || acquisition.total_cost || 0,
  createdAt: acquisition.createdAt
});

const listAcquisitions = async (req, res, next) => {
  try {
    const acquisitions = await Acquisition.find().sort({ createdAt: -1 }).lean();
    res.json(acquisitions.map(normalizeAcquisition));
  } catch (error) {
    next(error);
  }
};

const createAcquisition = async (req, res, next) => {
  try {
    const payload = {
      vendorName: req.body.vendor_name || req.body.vendorName || '',
      vendorContact: req.body.vendor_contact || req.body.vendorContact || '',
      vendorEmail: req.body.vendor_email || req.body.vendorEmail || '',
      poNumber: req.body.po_number || req.body.poNumber || '',
      invoiceNo: req.body.invoice_no || req.body.invoiceNo || '',
      orders: (req.body.orders || []).map((order) => ({
        bookTitle: order.book_title || order.bookTitle || '',
        author: order.author || '',
        isbn: order.isbn || '',
        quantity: order.quantity || 0,
        unitPrice: order.unit_price || order.unitPrice || 0
      })),
      totalCost: req.body.total_cost || req.body.totalCost || 0
    };
    const acquisition = new Acquisition(payload);
    await acquisition.save();
    res.status(201).json(normalizeAcquisition(acquisition.toObject()));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBookTitles,
  createBookTitle,
  listBookCopies,
  createBookCopy,
  listVendors,
  createVendor,
  listPurchaseOrders,
  createPurchaseOrder,
  listInvoices,
  createInvoice,
  listAcquisitions,
  createAcquisition
};