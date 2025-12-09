/**
 * Seed script: reads /uploads/students.xlsx and imports into MongoDB.
 * Run: node seed.js (from backend folder) after installing dependencies.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Certificate = require('./models/Certificate');
const path = require('path');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const file = path.join(__dirname, 'uploads', 'students.xlsx');
  console.log('Reading file', file);
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  const ops = data.map(row => ({
    updateOne: {
      filter: { certificateId: String(row.certificateId).trim() },
      update: {
        certificateId: String(row.certificateId).trim(),
        studentName: row.studentName || row['Student Name'] || '',
        internshipDomain: row.internshipDomain || row.Domain || '',
        startDate: row.startDate || row['Start Date'] || null,
        endDate: row.endDate || row['End Date'] || null,
        additionalInfo: row.additionalInfo || ''
      },
      upsert: true
    }
  }));
  if (ops.length) {
    const res = await Certificate.bulkWrite(ops);
    console.log('Imported', ops.length, 'rows');
  } else {
    console.log('No rows found in Excel');
  }
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });


// create a default admin user if not exists
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function ensureAdmin() {
  try {
    const adminEmail = 'admin@certs.local';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hash = await bcrypt.hash('Admin@123', 10);
      await User.create({ name: 'Administrator', email: adminEmail, password: hash, role: 'admin' });
      console.log('Default admin created:', adminEmail, 'password: Admin@123');
    } else {
      console.log('Default admin already exists:', adminEmail);
    }
  } catch (err) {
    console.error('Admin creation error', err);
  }
}

ensureAdmin();
