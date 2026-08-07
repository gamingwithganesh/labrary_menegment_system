const SerialSubscription = require('../models/SerialSubscription');
const SerialIssue = require('../models/SerialIssue');
const NewspaperLog = require('../models/NewspaperLog');

const normalizeSubscription = (subscription) => ({
  id: subscription._id.toString(),
  title: subscription.title,
  publisher: subscription.publisher,
  issn: subscription.issn || '',
  frequency: subscription.frequency || 'Monthly',
  cost: subscription.cost || 0,
  subscription_start: subscription.startDate ? new Date(subscription.startDate).toISOString().slice(0, 10) : '',
  subscription_end: subscription.endDate ? new Date(subscription.endDate).toISOString().slice(0, 10) : '',
  status: subscription.status || 'Active',
  non_receipt_reminders: subscription.nonReceiptReminders || []
});

const normalizeNewspaperLog = (log) => ({
  id: log._id.toString(),
  date: log.date ? new Date(log.date).toISOString().slice(0, 10) : '',
  paper_name: log.paperName || log.paper_name || '',
  copies_received: log.copiesReceived || log.copies_received || 0,
  received_by: log.receivedBy || log.received_by || ''
});

const listSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await SerialSubscription.find().sort({ startDate: -1 }).lean();
    res.json(subscriptions.map(normalizeSubscription));
  } catch (error) {
    next(error);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      title: req.body.title,
      publisher: req.body.publisher,
      frequency: req.body.frequency || 'Monthly',
      issn: req.body.issn || '',
      startDate: req.body.subscription_start ? new Date(req.body.subscription_start) : new Date(),
      endDate: req.body.subscription_end ? new Date(req.body.subscription_end) : undefined,
      cost: req.body.cost || 0,
      status: req.body.status || 'Active',
      nonReceiptReminders: req.body.non_receipt_reminders || []
    };
    const subscription = new SerialSubscription(payload);
    await subscription.save();
    res.status(201).json(normalizeSubscription(subscription.toObject()));
  } catch (error) {
    next(error);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await SerialSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Serial subscription not found' });
    }
    await subscription.deleteOne();
    res.json({ status: 'deleted' });
  } catch (error) {
    next(error);
  }
};

const listIssues = async (req, res, next) => {
  try {
    const issues = await SerialIssue.find().populate('subscriptionId').sort({ issueDate: -1 }).lean();
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

const createIssue = async (req, res, next) => {
  try {
    const issue = new SerialIssue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
};

const listNewspaperLogs = async (req, res, next) => {
  try {
    const logs = await NewspaperLog.find().sort({ date: -1 }).lean();
    res.json(logs.map(normalizeNewspaperLog));
  } catch (error) {
    next(error);
  }
};

const createNewspaperLog = async (req, res, next) => {
  try {
    const payload = {
      date: req.body.date ? new Date(req.body.date) : new Date(),
      paperName: req.body.paper_name || req.body.paperName || '',
      copiesReceived: req.body.copies_received || req.body.copiesReceived || 0,
      receivedBy: req.body.received_by || req.body.receivedBy || ''
    };
    const log = new NewspaperLog(payload);
    await log.save();
    res.status(201).json(normalizeNewspaperLog(log.toObject()));
  } catch (error) {
    next(error);
  }
};

module.exports = { listSubscriptions, createSubscription, deleteSubscription, listIssues, createIssue, listNewspaperLogs, createNewspaperLog };