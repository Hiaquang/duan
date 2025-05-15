const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Lấy giỏ hàng theo user
router.get('/:id_user', (req, res) => {
  const { id_user } = req.params;
  pool.query(
    `SELECT gh.*, sp.ten_sp, sp.hinh, sp.gia, sp.gia_km 
     FROM gio_hang gh 
     JOIN san_pham sp ON gh.id_sp = sp.id 
     WHERE gh.id_user = ?`,
    [id_user],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// Thêm hoặc cập nhật số lượng sản phẩm trong giỏ
router.post('/', (req, res) => {
  const { id_user, id_sp, so_luong, gia, gia_km } = req.body;
  pool.query(
    'SELECT * FROM gio_hang WHERE id_user = ? AND id_sp = ?',
    [id_user, id_sp],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length > 0) {
        pool.query(
          'UPDATE gio_hang SET so_luong = so_luong + ? WHERE id_user = ? AND id_sp = ?',
          [so_luong, id_user, id_sp],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({ message: 'Cập nhật giỏ hàng thành công' });
          }
        );
      } else {
        pool.query(
          'INSERT INTO gio_hang (id_user, id_sp, so_luong, gia, gia_km) VALUES (?, ?, ?, ?, ?)',
          [id_user, id_sp, so_luong, gia, gia_km],
          (err3) => {
            if (err3) return res.status(500).json({ error: err3 });
            res.json({ message: 'Thêm vào giỏ hàng thành công' });
          }
        );
      }
    }
  );
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id_user/:id_sp', async (req, res) => {
  const { id_user, id_sp } = req.params;
  try {
    await pool.query('DELETE FROM gio_hang WHERE id_user = ? AND id_sp = ?', [id_user, id_sp]);
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (err) {
    console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', err);
    res.status(500).json({ error: err });
  }
});

// Xóa toàn bộ giỏ hàng của user
router.delete('/:id_user', async (req, res) => {
  const { id_user } = req.params;
  try {
    await pool.query('DELETE FROM gio_hang WHERE id_user = ?', [id_user]);
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (err) {
    console.error('Lỗi xóa toàn bộ giỏ hàng:', err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;