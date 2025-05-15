// migration.js - Script để thêm cột id_user vào bảng don_hang
require("dotenv").config();
const { pool } = require('./db');

async function addUserIdColumnToDonHang() {
  try {
    console.log('Bắt đầu migration...');
    
    // Chỉ thêm cột id_user, không thêm ràng buộc foreign key
    const addColumnQuery = `
      ALTER TABLE don_hang 
      ADD COLUMN id_user INT;
    `;
    
    console.log('Đang thực hiện câu lệnh SQL:', addColumnQuery);
    await pool.query(addColumnQuery);
    console.log('✅ Đã thêm cột id_user thành công!');

    // Cập nhật giá trị id_user cho các đơn hàng hiện có dựa trên email
    console.log('Đang cập nhật giá trị id_user cho các đơn hàng hiện có...');
    const [orders] = await pool.query('SELECT id_dh, email FROM don_hang');
    
    for (const order of orders) {
      if (order.email) {
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [order.email]);
        if (users.length > 0) {
          await pool.query(
            'UPDATE don_hang SET id_user = ? WHERE id_dh = ?',
            [users[0].id, order.id_dh]
          );
          console.log(`Đã cập nhật id_user cho đơn hàng ${order.id_dh} với email ${order.email}`);
        }
      }
    }
    
    console.log('✅ Hoàn tất migration!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi thực hiện migration:', err);
    process.exit(1);
  }
}

// Chạy migration
addUserIdColumnToDonHang();