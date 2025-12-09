const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');

// simple search by certificateId
router.get('/search/:id', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate PDF server-side and stream it
router.get('/download/:id', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${cert.certificateId}.pdf"`);

    doc.pipe(res);

    // Simple styled certificate
    doc.fontSize(20).text('Internship Certificate', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(12).text(`Certificate ID: ${cert.certificateId}`, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`This is to certify that`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).text(cert.studentName || '---', { align: 'center', underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`has successfully completed an internship in the domain of ${cert.internshipDomain || 'N/A'}.`, { align: 'center' });
    doc.moveDown(1);
    const start = cert.startDate ? new Date(cert.startDate).toLocaleDateString() : 'N/A';
    const end = cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'N/A';
    doc.fontSize(12).text(`Internship Period: ${start} — ${end}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12).text('Authorized Signatory', { align: 'right' });
    doc.moveDown(0.5);
    doc.text('__________________', { align: 'right' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Admin-only list endpoint
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const all = await Certificate.find().sort({ createdAt: -1 }).limit(1000);
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// upload Excel (admins)
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
router.post('/upload-excel', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    // expected columns: certificateId, studentName, internshipDomain, startDate, endDate
    const bulk = data.map(row => ({
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
    if (bulk.length) {
      await Certificate.bulkWrite(bulk);
    }
    res.json({ message: 'Excel data imported', count: bulk.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
