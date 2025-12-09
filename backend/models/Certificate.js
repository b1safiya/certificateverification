const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  internshipDomain: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  additionalInfo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
