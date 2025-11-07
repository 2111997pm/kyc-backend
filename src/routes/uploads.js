const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { Document, Kyc } = require('../models');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// upload one or many documents for a KYC record
router.post('/kyc/:kycId', authenticate, upload.array('documents', 5), async (req, res) => {
  try {
    const { kycId } = req.params;
    const kyc = await Kyc.findByPk(kycId);
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    if (kyc.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const created = [];
    for (const file of req.files) {
      const doc = await Document.create({
        kycId: kyc.id,
        originalName: file.originalname,
        path: file.filename,
        mimeType: file.mimetype,
        size: file.size
      });
      created.push(doc);
    }
    return res.status(201).json({ uploaded: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
