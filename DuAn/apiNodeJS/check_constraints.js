require("dotenv").config();
const { pool } = require('./db');

async function checkForeignKeys() {
  try {
    console.log('Kiểm tra tất cả các ràng buộc khóa ngoại...');
    
    // Get all foreign key constraints
    const [constraints] = await pool.query(`
      SELECT 
        TABLE_NAME AS 'Bảng', 
        COLUMN_NAME AS 'Cột', 
        CONSTRAINT_NAME AS 'Tên ràng buộc', 
        REFERENCED_TABLE_NAME AS 'Bảng tham chiếu', 
        REFERENCED_COLUMN_NAME AS 'Cột tham chiếu'
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'laptop_react' 
        AND REFERENCED_TABLE_SCHEMA IS NOT NULL
      ORDER BY TABLE_NAME
    `);
    
    console.log('=== Danh sách các ràng buộc khóa ngoại ===');
    console.table(constraints);
    
    // Verify each relationship in detail
    const tables = ['don_hang', 'don_hang_chi_tiet', 'san_pham', 'binh_luan'];
    console.log('\n=== Chi tiết cấu trúc bảng ===');
    
    for (const table of tables) {
      console.log(`\n--- ${table.toUpperCase()} ---`);
      const [createTable] = await pool.query(`SHOW CREATE TABLE ${table}`);
      console.log(createTable[0]['Create Table']);
    }
    
    console.log('\n✅ Hoàn tất kiểm tra ràng buộc khóa ngoại!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi kiểm tra ràng buộc khóa ngoại:', err);
    process.exit(1);
  }
}

// Run the check
checkForeignKeys();