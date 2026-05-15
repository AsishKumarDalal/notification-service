require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const notificationRoutes = require('./routes/notification.routes');
require('./workers/notification.worker');

const app = express();
app.use(express.json());

app.use('/v1/notifications', notificationRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync({ force:false })
  .then(() => {
    console.log('Database connected & synced');
    app.listen(PORT, () => {
      console.log(` Notification Service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
