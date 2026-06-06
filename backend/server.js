const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`B2C backend running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
