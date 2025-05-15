require("dotenv").config();
const { pool } = require('./db');

async function createDanhMucTable() {
  try {
    console.log('Bắt đầu tạo bảng danh_mục...');
    
    // Kiểm tra xem bảng danh_muc đã tồn tại chưa
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'danh_muc'
    `);
    
    if (tables.length > 0) {
      console.log('Bảng danh_muc đã tồn tại, không cần tạo lại.');
    } else {
      // Tạo bảng danh_muc
      console.log('Đang tạo bảng danh_muc...');
      await pool.query(`
        CREATE TABLE danh_muc (
          id_dm INT AUTO_INCREMENT PRIMARY KEY,
          ten_dm VARCHAR(100) NOT NULL,
          slug VARCHAR(120),
          mo_ta TEXT,
          hinh VARCHAR(255),
          an_hien TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Đã tạo bảng danh_muc thành công!');
      
      // Thêm danh mục mặc định
      console.log('Thêm danh mục mặc định...');
      await pool.query(`
        INSERT INTO danh_muc (id_dm, ten_dm, slug, mo_ta)
        VALUES 
        (1, 'Laptop', 'laptop', 'Các sản phẩm laptop'),
        (2, 'Máy tính bảng', 'may-tinh-bang', 'Các sản phẩm máy tính bảng'),
        (3, 'Điện thoại', 'dien-thoai', 'Các sản phẩm điện thoại'),
        (4, 'Phụ kiện', 'phu-kien', 'Phụ kiện điện tử')
      `);
      console.log('✅ Đã thêm danh mục mặc định!');
    }
    
    // Kiểm tra mối quan hệ giữa san_pham và danh mục
    console.log('Kiểm tra mối quan hệ giữa san_pham và danh_muc...');
    
    // Check if id_dm exists in san_pham
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'san_pham' 
      AND COLUMN_NAME = 'id_dm'
    `);
    
    // If id_dm doesn't exist, we need to add it
    if (columns.length === 0) {
      console.log('Thêm cột id_dm vào bảng san_pham...');
      await pool.query(`ALTER TABLE san_pham ADD COLUMN id_dm INT NOT NULL DEFAULT 1`);
      console.log('✅ Đã thêm cột id_dm vào bảng san_pham!');
    }
    
    // Update san_pham.id_dm based on id_loai if possible
    console.log('Cập nhật giá trị id_dm cho sản phẩm dựa trên id_loai...');
    await pool.query(`UPDATE san_pham SET id_dm = id_loai WHERE id_loai BETWEEN 1 AND 4`);
    await pool.query(`UPDATE san_pham SET id_dm = 1 WHERE id_dm = 0 OR id_dm > 4`);
    console.log('✅ Đã cập nhật giá trị id_dm cho sản phẩm!');
    
    console.log('✅ Hoàn tất tạo và thiết lập bảng danh_mục!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi tạo bảng danh_mục:', err);
    process.exit(1);
  }
}

// Chạy tạo bảng danh_mục
createDanhMucTable();