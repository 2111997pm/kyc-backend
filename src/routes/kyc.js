const express = require('express');
const router = express.Router();
const { Kyc, User, Document } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// create new kyc record (draft)
router.post('/', authenticate, async (req, res) => {
  try {
    const { personal, address, identity, financial, progress, status } = req.body;
    const kyc = await Kyc.create({
      userId: req.user.id,
      personal: personal || null,
      address: address || null,
      identity: identity || null,
      financial: financial || null,
      progress: progress || 0,
      status: status || 'draft'
    });
    return res.status(201).json({ kyc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// update kyc (only owner or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const kyc = await Kyc.findByPk(id);
    if (!kyc) return res.status(404).json({ message: 'Not found' });

    if (kyc.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { personal, address, identity, financial, progress, status } = req.body;
    await kyc.update({
      personal: personal !== undefined ? personal : kyc.personal,
      address: address !== undefined ? address : kyc.address,
      identity: identity !== undefined ? identity : kyc.identity,
      financial: financial !== undefined ? financial : kyc.financial,
      progress: progress !== undefined ? progress : kyc.progress,
      status: status !== undefined ? status : kyc.status
    });

    return res.json({ kyc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// get single kyc (owner or admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const kyc = await Kyc.findByPk(req.params.id, { include: [{ model: Document, as: 'documents' }] });
    if (!kyc) return res.status(404).json({ message: 'Not found' });

    if (kyc.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ kyc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// list kycs with pagination, search, filter (admin sees all, user sees their own)
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const pageSize = Math.min(100, parseInt(req.query.pageSize || '10'));
    const q = req.query.q || '';
    const status = req.query.status || null;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { '$personal.name$': { [Op.like]: `%${q}%` } },
        { '$personal.email$': { [Op.like]: `%${q}%` } }
      ];
    }

    // if not admin, restrict to user's records
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const { count, rows } = await Kyc.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    return res.json({
      data: rows,
      meta: { total: count, page, pageSize, totalPages: Math.ceil(count / pageSize) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
