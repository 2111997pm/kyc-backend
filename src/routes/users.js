const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// list users - admin only
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const me = await User.findByPk(req.user.id, { attributes: ['id','name','email','role','createdAt'] });
    return res.json({ user: me });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
