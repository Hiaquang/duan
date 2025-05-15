require("dotenv").config();
const { pool } = require('./db');

async function fixBinhLuanUsersRelationship() {
  try {
    console.log('Bắt đầu sửa lỗi quan hệ giữa bình luận và người dùng...');
    
    // 1. Kiểm tra cấu trúc cả hai bảng
    console.log('Kiểm tra cấu trúc bảng binh_luan và users...');
    
    // Kiểm tra cột id trong users
    const [usersColumn] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_KEY = 'PRI'
    `);
    
    if (usersColumn.length === 0) {
      throw new Error('Không tìm thấy khóa chính trong bảng users');
    }
    
    const userIdColumn = usersColumn[0].COLUMN_NAME;
    const userIdType = usersColumn[0].COLUMN_TYPE;
    const userIdDataType = usersColumn[0].DATA_TYPE;
    
    console.log(`Cột khóa chính của bảng users: ${userIdColumn} (${userIdType})`);
    
    // Kiểm tra cột id_user trong binh_luan
    const [blColumns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'binh_luan' 
      AND COLUMN_NAME = 'id_user'
    `);
    
    if (blColumns.length === 0) {
      console.log('Cột id_user không tồn tại trong bảng binh_luan. Sẽ thêm cột mới...');
      await pool.query(`ALTER TABLE binh_luan ADD COLUMN id_user ${userIdType} NULL, ADD INDEX (id_user)`);
      console.log('✅ Đã thêm cột id_user vào bảng binh_luan');
    } else {
      const blIdUserType = blColumns[0].COLUMN_TYPE;
      const blIdUserDataType = blColumns[0].DATA_TYPE;
      
      console.log(`Cột id_user của bảng binh_luan: ${blIdUserType}`);
      
      // Nếu kiểu dữ liệu không khớp, cập nhật cột id_user trong binh_luan
      if (userIdDataType !== blIdUserDataType) {
        console.log(`Kiểu dữ liệu không khớp. Đang cập nhật cột id_user từ ${blIdUserType} thành ${userIdType}...`);
        await pool.query(`ALTER TABLE binh_luan MODIFY COLUMN id_user ${userIdType} NULL`);
        console.log('✅ Đã cập nhật kiểu dữ liệu của cột id_user');
      }
    }
    
    // 2. Kiểm tra dữ liệu không hợp lệ
    console.log('Kiểm tra dữ liệu id_user không hợp lệ trong bảng binh_luan...');
    const [invalidIds] = await pool.query(`
      SELECT bl.id_user 
      FROM binh_luan bl 
      LEFT JOIN users u ON bl.id_user = u.${userIdColumn}
      WHERE bl.id_user IS NOT NULL AND u.${userIdColumn} IS NULL
    `);
    
    if (invalidIds.length > 0) {
      console.log(`⚠️ Phát hiện ${invalidIds.length} bình luận có id_user không hợp lệ. Đang cập nhật về NULL...`);
      await pool.query(`UPDATE binh_luan SET id_user = NULL WHERE id_user IS NOT NULL AND id_user NOT IN (SELECT ${userIdColumn} FROM users)`);
      console.log('✅ Đã cập nhật các id_user không hợp lệ thành NULL');
    } else {
      console.log('✅ Không phát hiện id_user không hợp lệ trong bảng binh_luan');
    }
    
    // 3. Xóa khóa ngoại cũ nếu có
    console.log('Kiểm tra và xóa khóa ngoại cũ nếu có...');
    const [constraints] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'binh_luan' 
      AND CONSTRAINT_TYPE = 'FOREIGN KEY' 
      AND CONSTRAINT_NAME = 'fk_binh_luan_users'
    `);
    
    if (constraints.length > 0) {
      console.log(`Đang xóa khóa ngoại cũ: ${constraints[0].CONSTRAINT_NAME}...`);
      await pool.query(`ALTER TABLE binh_luan DROP FOREIGN KEY ${constraints[0].CONSTRAINT_NAME}`);
      console.log('✅ Đã xóa khóa ngoại cũ');
    }
    
    // 4. Thêm khóa ngoại mới
    console.log('Thêm khóa ngoại mới từ binh_luan.id_user đến users.id...');
    await pool.query(`
      ALTER TABLE binh_luan 
      ADD CONSTRAINT fk_binh_luan_users 
      FOREIGN KEY (id_user) REFERENCES users(${userIdColumn}) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('✅ Đã thêm khóa ngoại thành công!');
    
    // 5. Xác nhận khóa ngoại đã được tạo
    const [newConstraints] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'binh_luan' 
      AND CONSTRAINT_TYPE = 'FOREIGN KEY' 
      AND CONSTRAINT_NAME = 'fk_binh_luan_users'
    `);
    
    if (newConstraints.length > 0) {
      console.log(`✅ Xác nhận khóa ngoại ${newConstraints[0].CONSTRAINT_NAME} đã được tạo thành công!`);
    } else {
      console.log('❌ Không thể xác nhận khóa ngoại đã được tạo');
    }
    
    console.log('✅ Hoàn tất sửa lỗi quan hệ giữa bình luận và người dùng!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi sửa quan hệ bình luận và người dùng:', err);
    process.exit(1);
  }
}

// Chạy hàm sửa lỗi
fixBinhLuanUsersRelationship();