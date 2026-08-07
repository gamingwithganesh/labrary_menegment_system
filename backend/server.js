require('dotenv').config();
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(`LIB-MAN backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
};

startServer();
