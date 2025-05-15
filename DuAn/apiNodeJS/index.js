require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const multer = require('multer');
const path = require('path');
const { pool } = require('./db'); // Require pool từ db.js

app.use(express.json());
app.use(cors());

const PRIVATE_KEY = fs.readFileSync("private-key.txt");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Không tìm thấy token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
      return res.status(401).json({ thongbao: "Token không tồn tại" });
  }
  jwt.verify(token, PRIVATE_KEY, { algorithms: ["RS256"] }, (err, user) => {
      if (err) {
          return res.status(403).json({ thongbao: "Token không hợp lệ hoặc đã hết hạn" });
      }
      req.user = user;
      next();
  });
};

const commentsRouter = require('./routes/comments')(pool, authenticateToken);
const cartRoutes = require('./routes/cart');
app.use('/comments', commentsRouter);
app.use('/cart', cartRoutes);

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

app.post('/profile/:userId/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
      const userId = parseInt(req.params.userId);
      if (req.user.userId !== userId) {
          return res.status(403).json({ message: "Bạn không có quyền cập nhật ảnh của user này" });
      }

      if (!req.file) {
          return res.status(400).json({ message: "Vui lòng chọn file ảnh" });
      }

      const fileName = req.file.filename;

      const [result] = await pool.query(
          `UPDATE users SET hinh = ? WHERE id = ?`,
          [fileName, userId]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Không tìm thấy user" });
      }

      const [updatedUser] = await pool.query(
          `SELECT id, name, email, dia_chi, dien_thoai, hinh FROM users WHERE id = ?`,
          [userId]
      );

      res.json(updatedUser[0]);
  } catch (err) {
      res.status(500).json({ message: "Lỗi upload ảnh", error: err.message });
  }
});

app.use('/uploads', express.static('uploads'));
// Lấy danh sách sản phẩm mới
app.get("/spmoi/:sosp?", async (req, res) => {
  try {
    let sosp = parseInt(req.params.sosp) || 12;
    if (sosp <= 1) sosp = 15;

    const [rows] = await pool.query(
      `SELECT sp.id, sp.id_loai, sp.ten_sp, sp.gia, sp.gia_km, sp.hinh, sp.ngay, sp.luot_xem, tt.ram, tt.dia_cung
       FROM san_pham sp
       LEFT JOIN thuoc_tinh tt ON sp.id = tt.id_sp
       WHERE sp.an_hien = 1
       ORDER BY sp.ngay DESC
       LIMIT ?`,
      [sosp]
    );

    const data = rows.map((sp) => {
      if (sp.gia && sp.gia_km) {
        sp.phan_tram_gg = Math.round(((sp.gia - sp.gia_km) / sp.gia) * 100);
      } else {
        sp.phan_tram_gg = 0;
      }
      return sp;
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách sản phẩm", error: err.message });
  }
});

// Lấy sản phẩm hot
app.get("/sphot", async (req, res) => {
  try {
    const spxn = parseInt(req.query.spxn || 10); // Sửa: Lấy từ query thay vì params
    const limit = spxn <= 1 ? 9 : spxn;

    const [rows] = await pool.query(
      `SELECT * FROM san_pham WHERE luot_xem > 900 LIMIT ?`,
      [limit]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy thông tin sản phẩm hot", error: err.message });
  }
});

// Lấy tất cả sản phẩm
app.get("/sp", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM san_pham`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy chi tiết sản phẩm", error: err.message });
  }
});

// API tìm kiếm sản phẩm
app.get("/sp/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ thongbao: "Thiếu từ khóa tìm kiếm" });
    }

    // Tìm kiếm sản phẩm với từ khóa linh hoạt (sử dụng LIKE với % và các từ khóa riêng biệt)
    const searchTerms = query.split(' ').filter(term => term.trim() !== '');
    let sqlQuery = `
      SELECT sp.id, sp.id_loai, sp.ten_sp, sp.slug, sp.gia, sp.gia_km, sp.hinh, sp.ngay, sp.luot_xem, 
             tt.ram, tt.cpu, tt.dia_cung
      FROM san_pham sp
      LEFT JOIN thuoc_tinh tt ON sp.id = tt.id_sp
      WHERE `;

    // Tạo điều kiện OR cho mỗi từ khóa riêng biệt
    const conditions = [];
    const params = [];

    searchTerms.forEach(term => {
      conditions.push(`sp.ten_sp LIKE ?`);
      params.push(`%${term}%`);
    });

    sqlQuery += conditions.join(' OR ');
    sqlQuery += ` AND sp.an_hien = 1 ORDER BY sp.luot_xem DESC LIMIT 20`;

    const [rows] = await pool.query(sqlQuery, params);

    if (rows.length === 0) {
      return res.json([]);
    }

    // Thêm thông tin giảm giá nếu có
    const data = rows.map((sp) => {
      if (sp.gia && sp.gia_km) {
        sp.phan_tram_gg = Math.round(((sp.gia - sp.gia_km) / sp.gia) * 100);
      } else {
        sp.phan_tram_gg = 0;
      }
      return sp;
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi tìm kiếm sản phẩm", error: err.message });
  }
});

// Lấy chi tiết sản phẩm theo ID
app.get("/sanpham/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "Không biết sản phẩm", id });
    }

    const [rows] = await pool.query(
      `SELECT id, id_loai, ten_sp, slug, gia, gia_km, hinh, ngay, luot_xem 
       FROM san_pham 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy sản phẩm", id });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy chi tiết sản phẩm", error: err.message });
  }
});

// Lấy chi tiết sản phẩm theo ID và ID loại
app.get("/sp/:id/:id_loai", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const id_loai = parseInt(req.params.id_loai);
    if (isNaN(id) || id <= 0 || isNaN(id_loai) || id_loai <= 0) {
      return res.status(400).json({ thongbao: "Không biết sản phẩm hoặc loại sản phẩm", id, id_loai });
    }

    const [rows] = await pool.query(
      `SELECT sp.id, sp.id_loai, sp.ten_sp, sp.slug, sp.gia, sp.gia_km, sp.hinh, sp.ngay, sp.luot_xem, 
              tt.ram, tt.cpu, tt.dia_cung, tt.can_nang
       FROM san_pham sp
       LEFT JOIN thuoc_tinh tt ON sp.id = tt.id_sp
       LEFT JOIN loai l ON sp.id_loai = l.id
       WHERE sp.id = ? AND sp.id_loai = ?`,
      [id, id_loai]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy sản phẩm", id, id_loai });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy chi tiết sản phẩm", error: err.message });
  }
});

// Lấy sản phẩm theo loại
app.get("/sptrongloai/:idloai", async (req, res) => {
  try {
    const idloai = parseInt(req.params.idloai);
    if (isNaN(idloai) || idloai <= 0) {
      return res.status(400).json({ thongbao: "Không biết loại", id: idloai });
    }

    const [rows] = await pool.query(
      `SELECT id, id_loai, ten_sp, gia, gia_km, hinh, ngay, luot_xem 
       FROM san_pham 
       WHERE id_loai = ? AND an_hien = 1 
       ORDER BY id DESC`,
      [idloai]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy sản phẩm theo loại", error: err.message });
  }
});

// Lấy danh sách loại
app.get("/loai", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM loai`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách loại", error: err.message });
  }
});

// Lấy chi tiết loại
app.get("/loai/:id_loai", async (req, res) => {
  try {
    const id_loai = parseInt(req.params.id_loai);
    if (isNaN(id_loai) || id_loai <= 0) {
      return res.status(400).json({ thongbao: "Không biết loại", id: id_loai });
    }

    const [rows] = await pool.query(
      `SELECT id, ten_loai, img_loai FROM loai WHERE id = ?`,
      [id_loai]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy loại", id: id_loai });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy loại", error: err.message });
  }
});

// Lấy thông tin profile người dùng
app.get("/profile/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID không hợp lệ", receivedId: req.params.id });
    }

    if (req.user.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập profile này" });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, dia_chi, dien_thoai, hinh FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Cập nhật profile người dùng
app.put("/profile/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    if (req.user.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật profile này" });
    }

    const { name, email, dien_thoai, dia_chi } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET name = ?, email = ?, dien_thoai = ?, dia_chi = ? WHERE id = ?`,
      [name, email, dien_thoai, dia_chi, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ id, name, email, dien_thoai, dia_chi });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// API lưu đơn hàng
app.post("/completed", async (req, res) => {
  console.log("Body nhận được:", req.body);  // Debug: log body nhận được

  const { id_dh } = req.body;  // Lấy id_dh từ body

  if (!id_dh) {
    return res.status(400).json({ error: "id_dh is required" });
  }

  try {
    // Sửa câu SQL
    const sql = `UPDATE don_hang SET trang_thai = 'completed' WHERE id_dh = ?`;

    // Sử dụng giá trị id_dh thay vì 'id_dh'
    const values = [id_dh];
    const [result] = await pool.execute(sql, values);  // Thực thi câu SQL

    res.json({
      status: "success",  // Trả về status success
      id_dh: id_dh,      // Trả về id_dh để client có thể kiểm tra
      message: "Thanh toán thành công"
    });

  } catch (err) {
    console.error("Lỗi khi lưu đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lưu đơn hàng",
      details: err.message
    });
  }
});
app.post("/luudonhang", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { id_user, ho_ten, email, sdt, dia_chi, tong_tien, hinh_thuc_tt } = req.body;

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!ho_ten || !email) {
      return res.status(400).json({
        error: "Thiếu thông tin cần thiết"
      });
    }

    // Đảm bảo id_user là số nguyên
    const userId = id_user ? parseInt(id_user) : null;

    // Cập nhật SQL để đảm bảo đúng thứ tự và số lượng trường
    const sql = `INSERT INTO don_hang 
      (id_user, ho_ten, email, sdt, address, tongtien, thoi_diem_mua, trang_thai) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 'pending')`;

    const values = [
      userId, // Đảm bảo id_user là số nguyên
      ho_ten,
      email,
      sdt || null,
      dia_chi || null,
      parseFloat(tong_tien) || 0
    ];

    console.log("SQL values:", values);
    const [result] = await pool.execute(sql, values);

    console.log("Insert result:", result);
    res.json({
      id_dh: result.insertId,
      message: "Lưu đơn hàng thành công"
    });

  } catch (err) {
    console.error("Lỗi khi lưu đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lưu đơn hàng",
      details: err.message
    });
  }
});

// API lưu chi tiết đơn hàng
app.post("/luugiohang", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log

    const id_don_hang = req.body.id_don_hang; // Lấy id_don_hang từ request
    const { id_sp, so_luong } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!id_don_hang || !id_sp) {
      return res.status(400).json({
        error: "Thiếu thông tin bắt buộc",
        required: ["id_don_hang", "id_sp"],
        received: req.body
      });
    }

    // Ensure so_luong is a number
    const quantity = parseInt(so_luong) || 1;

    // Using a column list to match the exact table structure - use id_don_hang instead of id_dh
    const sql = `INSERT INTO don_hang_chi_tiet 
      (id_don_hang, id_sp, so_luong) 
      VALUES (?, ?, ?)`;

    const values = [
      id_don_hang, 
      id_sp, 
      quantity
    ];
    
    console.log("SQL values:", values); // Debug log

    const [result] = await pool.execute(sql, values);

    res.json({
      status: "success",
      message: "Lưu chi tiết đơn hàng thành công",
      id_ct: result.insertId
    });

  } catch (err) {
    console.error("Lỗi khi lưu chi tiết đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lưu chi tiết đơn hàng",
      details: err.message
    });
  }
});

// API lấy danh sách đơn hàng
app.get("/luudonhang", authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT dh.*, COUNT(dhct.id_ct) as so_sp 
      FROM don_hang dh
      LEFT JOIN don_hang_chi_tiet dhct ON dh.id_dh = dhct.id_don_hang
      GROUP BY dh.id_dh
      ORDER BY dh.thoi_diem_mua DESC
    `);

    // Thêm trạng thái đơn hàng mặc định là "pending" nếu chưa có
    const ordersWithStatus = orders.map(order => ({
      ...order,
      trang_thai: order.trang_thai || "pending"
    }));

    res.json(ordersWithStatus);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lấy danh sách đơn hàng",
      details: err.message
    });
  }
});

// API lấy chi tiết đơn hàng
app.get("/luudonhang/:id", authenticateToken, async (req, res) => {
  try {
    const id_dh = parseInt(req.params.id);
    if (isNaN(id_dh) || id_dh <= 0) {
      return res.status(400).json({
        error: "ID đơn hàng không hợp lệ"
      });
    }

    // Lấy thông tin đơn hàng
    const [orderInfo] = await pool.query(`
      SELECT * FROM don_hang WHERE id_dh = ?
    `, [id_dh]);

    // Nếu không tìm thấy đơn hàng
    if (orderInfo.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đơn hàng"
      });
    }

    // Lấy chi tiết các sản phẩm trong đơn hàng - sửa id_dh thành id_don_hang
    const [orderDetails] = await pool.query(`
      SELECT dhct.*, sp.ten_sp, sp.hinh, sp.gia, sp.gia_km
      FROM don_hang_chi_tiet dhct
      JOIN san_pham sp ON dhct.id_sp = sp.id
      WHERE dhct.id_don_hang = ?
    `, [id_dh]);

    res.json({
      order: orderInfo[0],
      details: orderDetails
    });
    
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lấy chi tiết đơn hàng",
      details: err.message
    });
  }
});

// API cập nhật trạng thái đơn hàng
app.put("/luudonhang/:id", async (req, res) => {
  try {
    const id_dh = parseInt(req.params.id);
    if (isNaN(id_dh) || id_dh <= 0) {
      return res.status(400).json({
        error: "ID đơn hàng không hợp lệ"
      });
    }

    const { trang_thai } = req.body;
    if (!trang_thai) {
      return res.status(400).json({
        error: "Thiếu thông tin trạng thái đơn hàng"
      });
    }

    // Kiểm tra trạng thái hợp lệ - cập nhật để hỗ trợ 7 trạng thái
    const validStatuses = ["pending", "confirmed", "processing", "shipping", "delivered", "completed", "cancelled"];
    if (!validStatuses.includes(trang_thai)) {
      return res.status(400).json({
        error: "Trạng thái không hợp lệ",
        valid_statuses: validStatuses
      });
    }

    // Cập nhật trạng thái đơn hàng
    await pool.query(`
      UPDATE don_hang SET trang_thai = ? WHERE id_dh = ?
    `, [trang_thai, id_dh]);

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      id_dh,
      trang_thai
    });
    
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi cập nhật trạng thái đơn hàng",
      details: err.message
    });
  }
});

// API lấy lịch sử đơn hàng của người dùng (đã được cập nhật)
app.get("/orders/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (req.user.userId !== userId) {
      return res.status(403).json({
        error: "Bạn không có quyền xem đơn hàng của người dùng khác"
      });
    }

    const [orders] = await pool.query(`
      SELECT dh.*, COUNT(dhct.id_ct) as so_sp 
      FROM don_hang dh
      LEFT JOIN don_hang_chi_tiet dhct ON dh.id_dh = dhct.id_don_hang
      WHERE dh.id_user = ?
      GROUP BY dh.id_dh
      ORDER BY dh.thoi_diem_mua DESC
    `, [userId]);

    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng của người dùng:", err);
    res.status(500).json({
      error: "Lỗi khi lấy danh sách đơn hàng",
      details: err.message
    });
  }
});

// API lấy chi tiết đơn hàng của người dùng
app.get("/orders/user/:userId/:orderId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(userId) || userId <= 0 || isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // Lấy thông tin đơn hàng
    const [orders] = await pool.query(`
      SELECT * FROM don_hang WHERE id_dh = ? AND id_user = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Lấy chi tiết sản phẩm trong đơn hàng - sửa id_dh thành id_don_hang
    const [orderDetails] = await pool.query(`
      SELECT dhct.*, sp.ten_sp, sp.hinh, sp.gia, sp.gia_km
      FROM don_hang_chi_tiet dhct
      JOIN san_pham sp ON dhct.id_sp = sp.id
      WHERE dhct.id_don_hang = ?
    `, [orderId]);

    res.json({
      order: orders[0],
      details: orderDetails
    });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lấy chi tiết đơn hàng",
      details: err.message
    });
  }
});

// API cập nhật trạng thái đơn hàng từ phía người dùng
app.put("/orders/user/:userId/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const orderId = parseInt(req.params.orderId);
    const { trang_thai } = req.body;
    
    if (isNaN(userId) || userId <= 0 || isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    // Kiểm tra xem đơn hàng tồn tại và thuộc về người dùng này
    const [orders] = await pool.query(`
      SELECT * FROM don_hang WHERE id_dh = ? AND id_user = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra xem trạng thái hiện tại có cho phép hủy không
    const currentStatus = orders[0].trang_thai;
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return res.status(400).json({ 
        error: "Không thể hủy đơn hàng này",
        details: "Đơn hàng đã được hoàn thành hoặc đã bị hủy"
      });
    }

    // Cập nhật trạng thái đơn hàng
    await pool.query(`
      UPDATE don_hang SET trang_thai = ? WHERE id_dh = ?
    `, [trang_thai, orderId]);

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công"
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi cập nhật trạng thái đơn hàng",
      details: err.message
    });
  }
});

// API cập nhật trạng thái đơn hàng (chỉ admin mới được sử dụng)
app.put("/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;
    
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: "Bạn không có quyền cập nhật trạng thái đơn hàng"
      });
    }

    // Danh sách trạng thái hợp lệ
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Trạng thái đơn hàng không hợp lệ",
        validStatuses
      });
    }

    // Cập nhật trạng thái đơn hàng
    await pool.query(`
      UPDATE don_hang SET trang_thai = ? WHERE id_dh = ?
    `, [status, orderId]);

    // Lấy thông tin đơn hàng sau khi cập nhật
    const [orderRows] = await pool.query(`
      SELECT * FROM don_hang WHERE id_dh = ?
    `, [orderId]);

    if (orderRows.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order: orderRows[0]
    });
    
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi cập nhật trạng thái đơn hàng",
      details: err.message
    });
  }
});

// API cập nhật trạng thái đơn hàng (chỉ admin mới có quyền)
app.put("/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { trang_thai } = req.body;
    
    // Kiểm tra quyền admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: "Bạn không có quyền cập nhật trạng thái đơn hàng"
      });
    }

    // Các trạng thái hợp lệ
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    
    if (!validStatuses.includes(trang_thai)) {
      return res.status(400).json({
        error: "Trạng thái đơn hàng không hợp lệ",
        validStatuses
      });
    }

    // Cập nhật trạng thái đơn hàng
    await pool.query(`
      UPDATE don_hang 
      SET trang_thai = ?, updated_at = CURRENT_TIMESTAMP()
      WHERE id_dh = ?
    `, [trang_thai, orderId]);

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành ${trang_thai}`,
      orderId,
      trang_thai
    });
    
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi cập nhật trạng thái đơn hàng",
      details: err.message
    });
  }
});

// API hủy đơn hàng (cho người dùng)
app.put("/orders/:orderId/cancel", authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user.id;
    
    // Kiểm tra xem đơn hàng có tồn tại và thuộc về người dùng này không
    const [orders] = await pool.query(`
      SELECT * FROM don_hang WHERE id_dh = ? 
    `, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đơn hàng"
      });
    }
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng này không
    // Lưu ý: Nếu có cột userId trong bảng don_hang, hãy thay thế điều kiện này
    // Ví dụ: if (orders[0].id_user !== userId) { ... }
    
    // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được khi đơn hàng đang ở trạng thái chờ xác nhận)
    if (orders[0].trang_thai && orders[0].trang_thai !== 'pending') {
      return res.status(400).json({
        error: "Không thể hủy đơn hàng ở trạng thái này"
      });
    }
    
    // Cập nhật trạng thái đơn hàng thành 'cancelled'
    await pool.query(`
      UPDATE don_hang 
      SET trang_thai = 'cancelled', updated_at = CURRENT_TIMESTAMP()
      WHERE id_dh = ?
    `, [orderId]);
    
    res.json({
      success: true,
      message: "Đơn hàng đã được hủy thành công",
      orderId
    });
    
  } catch (err) {
    console.error("Lỗi khi hủy đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi hủy đơn hàng",
      details: err.message
    });
  }
});

// API xóa đơn hàng
app.delete("/luudonhang/:id", async (req, res) => {
  try {
    const id_dh = parseInt(req.params.id);
    if (isNaN(id_dh) || id_dh <= 0) {
      return res.status(400).json({
        error: "ID đơn hàng không hợp lệ"
      });
    }

    // Xóa các chi tiết đơn hàng trước
    await pool.query(`DELETE FROM don_hang_chi_tiet WHERE id_dh = ?`, [id_dh]);
    
    // Sau đó xóa đơn hàng
    const [result] = await pool.query(`DELETE FROM don_hang WHERE id_dh = ?`, [id_dh]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Không tìm thấy đơn hàng"
      });
    }

    res.json({
      message: "Xóa đơn hàng thành công",
      id_dh
    });
    
  } catch (err) {
    console.error("Lỗi khi xóa đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi xóa đơn hàng",
      details: err.message
    });
  }
});

// So sánh sản phẩm
app.post("/so-sanh", authenticateToken, async (req, res) => {
  try {
    const { id_user, id_sp } = req.body;

    if (req.user.userId !== id_user) {
      return res.status(403).json({ message: "Bạn không có quyền thêm sản phẩm so sánh cho user này" });
    }

    const [count] = await pool.query(
      `SELECT COUNT(*) AS total FROM so_sanh WHERE id_user = ?`,
      [id_user]
    );

    if (count[0].total >= 4) {
      return res.status(400).json({ message: "Chỉ có thể so sánh tối đa 4 sản phẩm" });
    }

    await pool.query(
      `INSERT INTO so_sanh (id_user, id_sp) VALUES (?, ?)`,
      [id_user, id_sp]
    );

    res.json({ message: "Đã thêm sản phẩm vào so sánh" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi thêm sản phẩm vào so sánh", error: err.message });
  }
});

app.get("/so-sanh/:id_user", authenticateToken, async (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    if (req.user.userId !== id_user) {
      return res.status(403).json({ message: "Bạn không có quyền xem danh sách so sánh của user này" });
    }

    const [rows] = await pool.query(
      `SELECT sp.id, sp.ten_sp, sp.gia, sp.gia_km, sp.hinh, tt.ram, tt.cpu, tt.dia_cung, tt.can_nang 
       FROM so_sanh ss
       JOIN san_pham sp ON ss.id_sp = sp.id
       LEFT JOIN thuoc_tinh tt ON sp.id = tt.id_sp
       WHERE ss.id_user = ?`,
      [id_user]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách so sánh", error: err.message });
  }
});

app.delete("/so-sanh/:id_user/:id_sp", authenticateToken, async (req, res) => {
  try {
    const id_user = parseInt(req.params.id_user);
    const id_sp = parseInt(req.params.id_sp);

    if (req.user.userId !== id_user) {
      return res.status(403).json({ message: "Bạn không có quyền xóa sản phẩm so sánh của user này" });
    }

    await pool.query(
      `DELETE FROM so_sanh WHERE id_user = ? AND id_sp = ?`,
      [id_user, id_sp]
    );

    res.json({ message: "Đã xóa sản phẩm khỏi danh sách so sánh" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm khỏi so sánh", error: err.message });
  }
});

// Admin: Lấy danh sách sản phẩm
app.get("/admin/sp", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.id, sp.id_loai, sp.ten_sp, sp.slug, sp.gia, sp.gia_km, sp.hinh, sp.ngay, sp.luot_xem, 
              tt.ram, tt.cpu, tt.dia_cung, tt.mau_sac, tt.can_nang,
              l.ten_loai
       FROM san_pham sp
       LEFT JOIN thuoc_tinh tt ON sp.id = tt.id_sp
       LEFT JOIN loai l ON sp.id_loai = l.id
       ORDER BY sp.id DESC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách sản phẩm", error: err.message });
  }
});

// Admin: Lấy chi tiết sản phẩm
app.get("/admin/sp/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID sản phẩm không hợp lệ", id });
    }

    const [rows] = await pool.query(
      `SELECT sp.id, sp.id_loai, sp.ten_sp, sp.slug, sp.gia, sp.gia_km, sp.hinh, sp.ngay, sp.luot_xem, 
              tt.ram, tt.cpu, tt.dia_cung, tt.mau_sac, tt.can_nang,
              l.ten_loai
       FROM san_pham sp
       INNER JOIN thuoc_tinh tt ON sp.id = tt.id_sp
       INNER JOIN loai l ON sp.id_loai = l.id
       WHERE sp.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy sản phẩm", id });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy chi tiết sản phẩm", error: err.message });
  }
});

// Admin: Thêm sản phẩm
app.post("/admin/sp", async (req, res) => {
  try {
    const san_pham = {
      id_loai: req.body.id_loai,
      ten_sp: req.body.ten_sp,
      slug: req.body.slug,
      gia: req.body.gia,
      gia_km: req.body.gia_km,
      hinh: req.body.hinh,
      ngay: req.body.ngay,
      luot_xem: req.body.luot_xem,
    };

    const thuoc_tinh = {
      ram: req.body.ram,
      cpu: req.body.cpu,
      dia_cung: req.body.dia_cung,
      mau_sac: req.body.mau_sac,
      can_nang: req.body.can_nang,
    };

    const [result] = await pool.query(`INSERT INTO san_pham SET ?`, [san_pham]);
    const newIdSP = result.insertId;

    const thuoc_tinhIDSP = { ...thuoc_tinh, id_sp: newIdSP };
    await pool.query(`INSERT INTO thuoc_tinh SET ?`, [thuoc_tinhIDSP]);

    res.json({ thongbao: "Đã chèn 1 sản phẩm và thuộc tính", id: newIdSP });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi chèn sản phẩm", error: err.message });
  }
});

// Admin: Cập nhật sản phẩm
app.put("/admin/sp/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const san_pham = {
      id_loai: req.body.id_loai || null,
      ten_sp: req.body.ten_sp || null,
      slug: req.body.slug || null,
      gia: req.body.gia || null,
      gia_km: req.body.gia_km || null,
      hinh: req.body.hinh || null,
      ngay: req.body.ngay || null,
      luot_xem: req.body.luot_xem || null,
    };

    const thuoc_tinh = {
      ram: req.body.ram || null,
      cpu: req.body.cpu || null,
      dia_cung: req.body.dia_cung || null,
      mau_sac: req.body.mau_sac || null,
      can_nang: req.body.can_nang || null,
    };

    await pool.query(`UPDATE san_pham SET ? WHERE id = ?`, [san_pham, id]);
    await pool.query(`UPDATE thuoc_tinh SET ? WHERE id_sp = ?`, [thuoc_tinh, id]);

    res.json({ thongbao: "Đã cập nhật sản phẩm và thuộc tính" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi cập nhật sản phẩm", error: err.message });
  }
});

// Admin: Xóa sản phẩm
app.delete("/admin/sp/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    await pool.query(`DELETE FROM san_pham WHERE id = ?`, [id]);
    await pool.query(`DELETE FROM thuoc_tinh WHERE id_sp = ?`, [id]);

    res.json({ thongbao: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi khi xóa sản phẩm", error: err.message });
  }
});

// Admin: Lấy danh sách người dùng
app.get("/admin/users", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM users ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy thông tin tài khoản", error: err.message });
  }
});

// Admin: Lấy chi tiết người dùng
// Admin: Lấy chi tiết người dùng
app.get("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy tài khoản" });
    }

    res.json(rows[0]);
  } catch (err) {
}});

// Admin: Thêm người dùng
app.post("/admin/users", async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ thongbao: "Thiếu email hoặc mật khẩu" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const [result] = await pool.query(`INSERT INTO users SET ?`, [data]);
    res.json({ thongbao: "Đã chèn 1 tài khoản", id: result.insertId });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi chèn tài khoản", error: err.message });
  }
});

// Admin: Cập nhật người dùng
app.put("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const data = req.body;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await pool.query(`UPDATE users SET ? WHERE id = ?`, [data, id]);
    res.json({ thongbao: "Đã cập nhật tài khoản" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi cập nhật tài khoản", error: err.message });
  }
});

// Admin: Xóa người dùng
app.delete("/admin/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ thongbao: "Đã xóa tài khoản" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi khi xóa tài khoản", error: err.message });
  }
});

// Đăng nhập
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      const [users] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
      if (users.length === 0) {
          return res.status(401).json({ thongbao: "Email hoặc mật khẩu không đúng" });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ thongbao: "Email hoặc mật khẩu không đúng" });
      }

      const jwtBearToken = jwt.sign(
          { userId: user.id, email: user.email },
          PRIVATE_KEY,
          { algorithm: "RS256", expiresIn: "3600s", subject: user.id.toString() } // 1 giờ
      );

      res.status(200).json({
          token: jwtBearToken,
          expiresIn: 3600, // 1 giờ
          userInfo: {
              id: user.id,
              name: user.name,
              dia_chi: user.dia_chi,
              dien_thoai: user.dien_thoai,
              hinh: user.hinh,
              role: user.role,
          },
      });
  } catch (err) {
      res.status(500).json({ thongbao: "Lỗi khi đăng nhập", error: err.message });
  }
});

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Yêu cầu đổi mật khẩu
app.post("/request-change-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const [users] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    const userId = users[0].id;
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE id = ?`,
      [token, expireTime, userId]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận đổi mật khẩu",
      html: `<p>Nhập mã sau để xác nhận đổi mật khẩu:</p>
             <h2>${token}</h2>
             <p>Mã này có hiệu lực trong 15 phút.</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: "Lỗi gửi email", error });
      }
      res.json({ message: "Mã xác nhận đã được gửi tới email của bạn!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Xác minh token
app.post("/verify-token", async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const [users] = await pool.query(
      `SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expire > NOW()`,
      [email, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    res.json({ message: "Mã xác nhận hợp lệ. Bạn có thể đặt lại mật khẩu" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Đặt lại mật khẩu
app.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
    }

    const [users] = await pool.query(
      `SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expire > NOW()`,
      [email, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    const userId = users[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.json({ message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Quên mật khẩu
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email!" });
    }

    const [users] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    // Sửa đoạn này: sinh token 6 số thay vì chuỗi hex dài
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?`,
      [token, expireTime, email]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận yêu cầu đặt lại mật khẩu",
      html: `<p>Vui lòng nhập mã sau để xác nhận yêu cầu đặt lại mật khẩu:</p>
             <h2>${token}</h2>
             <p>Mã này có hiệu lực trong 15 phút.</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: "Lỗi gửi email", error });
      }
      res.json({ message: "Mã xác nhận đã được gửi tới email của bạn!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Đăng ký tài khoản
app.post("/dangky", async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ thongbao: "Thiếu email hoặc mật khẩu" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const [result] = await pool.query(`INSERT INTO users SET ?`, [data]);
    res.json({ thongbao: "Đã đăng ký tài khoản thành công!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi đăng ký tài khoản", error: err.message });
  }
});

// Admin: Quản lý danh mục
app.post("/admin/category", async (req, res) => {
  try {
    const data = req.body;
    const [result] = await pool.query(`INSERT INTO loai SET ?`, [data]);
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi thêm danh mục", error: err.message });
  }
});

app.get("/admin/category", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM loai ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách loại", error: err.message });
  }
});

app.get("/admin/category/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const [rows] = await pool.query(`SELECT * FROM loai WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy danh mục" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy thông tin danh mục", error: err.message });
  }
});

app.put("/admin/category/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const { ten_loai, img_loai, slug, thu_tu, an_hien } = req.body;
    await pool.query(
      `UPDATE loai SET ten_loai = ?, img_loai = ?, slug = ?, thu_tu = ?, an_hien = ? WHERE id = ?`,
      [ten_loai, img_loai, slug, thu_tu, an_hien, id]
    );

    res.json({ thongbao: "Đã cập nhật danh mục" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi cập nhật danh mục", error: err.message });
  }
});

app.delete("/admin/category/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    await pool.query(`DELETE FROM loai WHERE id = ?`, [id]);
    res.json({ thongbao: "Đã xóa danh mục" });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi khi xóa danh mục", error: err.message });
  }
});

// Admin: Lấy danh sách sản phẩm (gộp từ /admin/sanpham)
app.get("/admin/sanpham", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM san_pham ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách sản phẩm", error: err.message });
  }
});

// Admin: Lấy chi tiết sản phẩm (gộp từ /admin/sanpham/:id)
app.get("/admin/sanpham/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const [rows] = await pool.query(
      `SELECT id, id_loai, ten_sp, gia, gia_km, hinh, ngay, luot_xem FROM san_pham WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy sản phẩm" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy thông tin của 1 sản phẩm", error: err.message });
  }
});

// Admin: Thêm sản phẩm (gộp từ /admin/sanpham)
app.post("/admin/sanpham", async (req, res) => {
  try {
    const data = req.body;
    const [result] = await pool.query(`INSERT INTO san_pham SET ?`, [data]);
    res.json({ thongbao: "Đã thêm sản phẩm thành công!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi thêm sản phẩm", error: err.message });
  }
});

// Admin: Lấy danh sách danh mục (gộp từ /admin/danhmuc)
app.get("/admin/danhmuc", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM loai ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy danh sách danh mục", error: err.message });
  }
});

// Admin: Lấy chi tiết danh mục (gộp từ /admin/danhmuc/:id)
app.get("/admin/danhmuc/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ thongbao: "ID không hợp lệ" });
    }

    const [rows] = await pool.query(
      `SELECT id, ten_loai, img_loai FROM loai WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ thongbao: "Không tìm thấy danh mục" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi lấy thông tin của 1 danh mục", error: err.message });
  }
});

// Thống kê
app.get("/thongke/sp", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total_sanpham FROM san_pham`);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ thongbao: "Lỗi đếm số sản phẩm", error: err.message });
  }
});

// API lấy comments của sản phẩm
app.get('/comments/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('Fetching comments for product:', productId);

    // Kiểm tra productId có hợp lệ không
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ',
        received: { productId }
      });
    }

    const [comments] = await pool.query(`
      SELECT 
        bl.*, 
        u.name as user_name, 
        u.hinh as user_avatar 
      FROM binh_luan bl 
      JOIN users u ON bl.id_user = u.id 
      WHERE bl.id_sp = ?
      ORDER BY bl.ngay_gio DESC
    `, [productId]);

    console.log('Found comments:', comments);
    res.json(comments);

  } catch (error) {
    // Log lỗi chi tiết hơn
    console.error('Error fetching comments:', error); 
    console.error('Error stack:', error.stack); // Log stack trace
    res.status(500).json({ 
      message: 'Lỗi server khi lấy bình luận',
      error: error.message // Chỉ trả về message lỗi cho client
    });
  }
});

// API thêm comment mới
app.post('/comments', authenticateToken, async (req, res) => {
  try {
    // Log ngay lập tức khi nhận request
    console.log('--- POST /comments Received ---');
    console.log('Raw req.body:', req.body);
    console.log('req.user from token:', req.user);
    console.log('-----------------------------');

    const { product_id, content, rating } = req.body;
    // Kiểm tra xem userId có tồn tại trong req.user không
    if (!req.user || !req.user.userId) {
      console.error('Error: userId not found in req.user after authenticateToken');
      return res.status(403).json({ message: 'Lỗi xác thực người dùng.' });
    }
    const userId = req.user.userId;

    // Log request details (có thể giữ lại hoặc xóa nếu log trên đủ)
    // console.log('Request headers:', req.headers);
    // console.log('Parsed Body:', { product_id, content, rating });
    // console.log('User ID from token:', userId);

    // Validate input
    if (!product_id || isNaN(product_id)) {
      console.log('Invalid product_id:', product_id);
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ',
        received: { product_id }
      });
    }

    if (!content || content.trim().length === 0) {
      console.log('Empty content');
      return res.status(400).json({
        message: 'Nội dung bình luận không được để trống',
        received: { content }
      });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      console.log('Invalid rating:', rating);
      return res.status(400).json({
        message: 'Đánh giá phải từ 1 đến 5 sao',
        received: { rating }
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const [product] = await pool.query(
      'SELECT id FROM san_pham WHERE id = ?',
      [product_id]
    );

    if (product.length === 0) {
      console.log('Product not found:', product_id);
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm',
        product_id
      });
    }

    // Thêm comment
    const [result] = await pool.query(`
      INSERT INTO binh_luan 
      (id_user, id_sp, noi_dung, rating, ngay_gio) 
      VALUES (?, ?, ?, ?, NOW())
    `, [userId, product_id, content.trim(), rating]);

    console.log('Insert result:', result);

    // Lấy comment vừa thêm
    const [newComment] = await pool.query(`
      SELECT 
        bl.*, 
        u.name as user_name, 
        u.hinh as user_avatar 
      FROM binh_luan bl 
      JOIN users u ON bl.id_user = u.id 
      WHERE bl.id = ?
    `, [result.insertId]);

    console.log('Added comment:', newComment[0]);
    res.status(201).json(newComment[0]);

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi thêm bình luận',
      error: error.message 
    });
  }
});

// Lấy danh sách khuyến mãi
app.get("/khuyen-mai", async (req, res) => {
  try {
    // Lấy danh sách khuyến mãi đang active
    const [promotions] = await pool.query(
      `SELECT * FROM khuyen_mai 
       WHERE trang_thai = 'active' 
       AND ngay_bat_dau <= NOW() 
       AND ngay_ket_thuc >= NOW()`
    );

    // Lấy chi tiết sản phẩm cho từng khuyến mãi
    for (let promotion of promotions) {
      const [products] = await pool.query(
        `SELECT sp.*, ctk.gia_km
         FROM chi_tiet_km ctk
         JOIN san_pham sp ON ctk.id_sp = sp.id
         WHERE ctk.id_km = ?`,
        [promotion.id]
      );
      promotion.san_pham = products;
    }

    res.json(promotions);
  } catch (err) {
    console.error('Error fetching promotions:', err);
    res.status(500).json({ thongbao: "Lỗi lấy danh sách khuyến mãi", error: err.message });
  }
});

// Lấy giỏ hàng của user
app.get("/gio-hang/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xem giỏ hàng của user này" });
    }

    const [rows] = await pool.query(
      `SELECT gh.id_sp, gh.id_user, gh.so_luong, gh.gia, gh.gia_km, sp.ten_sp, sp.hinh 
       FROM gio_hang gh
       JOIN san_pham sp ON gh.id_sp = sp.id
       WHERE gh.id_user = ?`,
      [userId]
    );

    console.log('Cart data:', rows); // Debug log
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: err.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
app.post("/gio-hang", authenticateToken, async (req, res) => {
  try {
    const { id_sp, id_user, so_luong, gia, gia_km, ten_sp, hinh } = req.body;

    // Validate required fields
    if (!id_sp || !id_user || !so_luong) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }

    // Verify user authentication
    if (req.user.userId !== id_user) {
      return res.status(403).json({ message: "Bạn không có quyền thêm vào giỏ hàng của user này" });
    }

    // Check if product already exists in cart
    const [existingItems] = await pool.query(
      "SELECT * FROM gio_hang WHERE id_user = ? AND id_sp = ?",
      [id_user, id_sp]
    );

    if (existingItems.length > 0) {
      // Update quantity if product exists
      const newQuantity = Math.min(existingItems[0].so_luong + so_luong, 10);
      await pool.query(
        "UPDATE gio_hang SET so_luong = ?, gia = ?, gia_km = ? WHERE id_user = ? AND id_sp = ?",
        [newQuantity, gia, gia_km, id_user, id_sp]
      );
    } else {
      // Insert new item if product doesn't exist
      await pool.query(
        "INSERT INTO gio_hang (id_sp, id_user, so_luong, gia, gia_km) VALUES (?, ?, ?, ?, ?)",
        [id_sp, id_user, Math.min(so_luong, 10), gia, gia_km]
      );
    }

    // Return updated cart item
    const [cartItem] = await pool.query(
      `SELECT gh.*, sp.ten_sp, sp.hinh 
       FROM gio_hang gh
       JOIN san_pham sp ON gh.id_sp = sp.id
       WHERE gh.id_user = ? AND gh.id_sp = ?`,
      [id_user, id_sp]
    );

    res.json(cartItem[0]);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng", error: err.message });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng 
app.put("/gio-hang/:userId/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);
    const { so_luong, gia, gia_km } = req.body;

    console.log('Updating cart item:', { userId, productId, so_luong, gia, gia_km });

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật giỏ hàng của user này" });
    }

    if (!so_luong || so_luong < 1 || so_luong > 10) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }
    
    // First check if the item exists
    const [check] = await pool.query(
      `SELECT * FROM gio_hang WHERE id_user = ? AND id_sp = ?`,
      [userId, productId]
    );
    
    if (check.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    const [result] = await pool.query(
      "UPDATE gio_hang SET so_luong = ?, gia = ?, gia_km = ? WHERE id_user = ? AND id_sp = ?",
      [so_luong, gia, gia_km, userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Cập nhật giỏ hàng thất bại" });
    }

    // Get updated cart item
    const [updatedItem] = await pool.query(
      `SELECT gh.*, sp.ten_sp, sp.hinh 
       FROM gio_hang gh
       JOIN san_pham sp ON gh.id_sp = sp.id
       WHERE gh.id_user = ? AND gh.id_sp = ?`,
      [userId, productId]
    );

    if (updatedItem.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm sau khi cập nhật" });
    }

    res.json(updatedItem[0]);
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ message: "Lỗi cập nhật giỏ hàng", error: err.message });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
app.delete("/gio-hang/:userId/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa sản phẩm khỏi giỏ hàng của user này" });
    }

    // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không
    const [check] = await pool.query(
      `SELECT * FROM gio_hang WHERE id_user = ? AND id_sp = ?`,
      [userId, productId]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    const [result] = await pool.query(
      `DELETE FROM gio_hang WHERE id_user = ? AND id_sp = ?`,
      [userId, productId]
    );

    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: "Lỗi xóa sản phẩm khỏi giỏ hàng", error: err.message });
  }
});

// Xóa toàn bộ giỏ hàng
app.delete("/gio-hang/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa giỏ hàng của user này" });
    }

    const [result] = await pool.query(
      `DELETE FROM gio_hang WHERE id_user = ?`,
      [userId]
    );

    res.json({ message: "Xóa giỏ hàng thành công" });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: "Lỗi xóa giỏ hàng", error: err.message });
  }
});

// API endpoints for vouchers
app.get('/vouchers', async (req, res) => {
    try {
        const [vouchers] = await pool.query('SELECT * FROM khuyen_mai WHERE ngay_het_han >= CURDATE()');
        res.json(vouchers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API endpoints for gifts
app.get('/gifts', async (req, res) => {
    try {
        const [gifts] = await pool.query('SELECT * FROM qua_tang WHERE trang_thai = 1');
        res.json(gifts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API endpoints for policies
app.get('/policies', async (req, res) => {
    try {
        const [policies] = await pool.query('SELECT * FROM chinh_sach WHERE trang_thai = 1');
        res.json(policies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Admin: Lấy danh sách đơn hàng
app.get("/admin/luudonhang", async (req, res) => {
  try {
    // Simplified query that matches your exact database structure
    const [orders] = await pool.query(`
      SELECT dh.*, COUNT(dhct.id_ct) as so_sp 
      FROM don_hang dh
      LEFT JOIN don_hang_chi_tiet dhct ON dh.id_dh = dhct.id_dh
      GROUP BY dh.id_dh 
      ORDER BY dh.thoi_diem_mua DESC
    `);

    // Thêm trạng thái đơn hàng mặc định là "pending" nếu chưa có
    const ordersWithStatus = orders.map(order => ({
      ...order,
      trang_thai: order.trang_thai || "pending"
    }));

    res.json(ordersWithStatus);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({
      error: "Lỗi khi lấy danh sách đơn hàng",
      details: err.message
    });
  }
});

app.listen(3000, () => console.log('Ứng dụng đang chạy với port 3000'));