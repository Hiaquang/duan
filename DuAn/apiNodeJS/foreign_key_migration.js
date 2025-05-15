// foreign_key_migration.js - Script để thêm ràng buộc khóa ngoại vào các bảng
require("dotenv").config();
const { pool } = require('./db');

async function addForeignKeyConstraints() {
  try {
    console.log('Bắt đầu migration...');
    
    // Danh sách các ràng buộc khóa ngoại cần thêm
    const foreignKeyQueries = [
      // Liên kết don_hang với users
      `ALTER TABLE don_hang 
       ADD CONSTRAINT fk_don_hang_users 
       FOREIGN KEY (id_user) REFERENCES users(id) 
       ON DELETE SET NULL ON UPDATE CASCADE;`,

      // Liên kết don_hang_chi_tiet với don_hang
      `ALTER TABLE don_hang_chi_tiet 
       ADD CONSTRAINT fk_dhct_don_hang 
       FOREIGN KEY (id_don_hang) REFERENCES don_hang(id_dh) 
       ON DELETE CASCADE ON UPDATE CASCADE;`,
      
      // Liên kết don_hang_chi_tiet với san_pham
      `ALTER TABLE don_hang_chi_tiet 
       ADD CONSTRAINT fk_dhct_san_pham 
       FOREIGN KEY (id_sp) REFERENCES san_pham(id_sp) 
       ON DELETE RESTRICT ON UPDATE CASCADE;`,
      
      // Liên kết san_pham với danh_muc
      `ALTER TABLE san_pham 
       ADD CONSTRAINT fk_san_pham_danh_muc 
       FOREIGN KEY (id_dm) REFERENCES danh_muc(id_dm) 
       ON DELETE RESTRICT ON UPDATE CASCADE;`,
      
      // Liên kết binh_luan với san_pham
      `ALTER TABLE binh_luan 
       ADD CONSTRAINT fk_binh_luan_san_pham 
       FOREIGN KEY (id_sp) REFERENCES san_pham(id_sp) 
       ON DELETE CASCADE ON UPDATE CASCADE;`,
      
      // Liên kết binh_luan với users
      `ALTER TABLE binh_luan 
       ADD CONSTRAINT fk_binh_luan_users 
       FOREIGN KEY (id_user) REFERENCES users(id) 
       ON DELETE SET NULL ON UPDATE CASCADE;`
    ];
    
    // Thực thi từng câu lệnh SQL
    for (const query of foreignKeyQueries) {
      try {
        console.log('Đang thực hiện câu lệnh SQL:', query);
        await pool.query(query);
        console.log('✅ Thực hiện thành công!');
      } catch (error) {
        console.error(`❌ Lỗi khi thực hiện câu lệnh: ${error.message}`);
        console.log('Tiếp tục với các ràng buộc khác...');
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
addForeignKeyConstraints();