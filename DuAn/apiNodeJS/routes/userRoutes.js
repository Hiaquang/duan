const express = require('express');
const { getUsers, getAdminData } = require('../src/controllers/userController');
const { authorize } = require('../src/middleware/authMiddleware');

const router = express.Router();

// Route dành cho tất cả người dùng
router.get('/', authorize(0), getUsers);

// Route chỉ dành cho admin (role >= 1)
router.get('/admin', authorize(1), getAdminData);

module.exports = router;