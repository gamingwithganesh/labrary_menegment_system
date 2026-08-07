const AuditLog = require('../models/AuditLog');

const listAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const createAuditLog = async (req, res, next) => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

module.exports = { listAuditLogs, createAuditLog };