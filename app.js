const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loan');

mongoose.connect('mongodb://localhost:27017/loanManagement', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('Failed to connect to MongoDB.', err));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', loanRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'An internal error occurred.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}.`));
