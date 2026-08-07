const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDatabase } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const acquisitionRoutes = require('./routes/acquisition');
const circulationRoutes = require('./routes/circulation');
const opacRoutes = require('./routes/opac');
const serialRoutes = require('./routes/serials');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const createApp = async () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  await connectDatabase();

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LIB-MAN backend' });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/acquisition', acquisitionRoutes);
  app.use('/api/v1/acquisitions', acquisitionRoutes);
  app.use('/api/v1/books', require('./routes/books'));
  app.use('/api/v1/circulation', circulationRoutes);
  app.use('/api/v1/opac', opacRoutes);
  app.use('/api/v1/serials', serialRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use(errorHandler);

  return app;
};

module.exports = { createApp };