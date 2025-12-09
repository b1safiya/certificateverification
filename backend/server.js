require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const certRoutes = require('./routes/certRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/certs', certRoutes);
app.use('/api/auth', authRoutes);

// static uploads (for Excel or other assets)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log('Server running on port', PORT));
})
.catch(err => {
  console.error('DB connection error', err);
  process.exit(1);
});
