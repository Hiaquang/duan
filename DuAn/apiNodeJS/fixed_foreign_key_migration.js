// fixed_foreign_key_migration.js - Script để thêm ràng buộc khóa ngoại vào các bảng
require("dotenv").config();
const { pool } = require('./db');

async function addForeignKeyConstraints() {
  try {
    console.log('Bắt đầu migration...');
    
    // Kiểm tra cấu trúc bảng và thêm cột nếu cần
    console.log('Kiểm tra và cập nhật cấu trúc các bảng...');
    
    // 1. Kiểm tra cấu trúc bảng don_hang
    try {
      console.log('Kiểm tra cấu trúc bảng don_hang...');
      const [dhColumns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'don_hang'
      `);
      
      const dhColumnNames = dhColumns.map(col => col.COLUMN_NAME);
      console.log('Các cột trong bảng don_hang:', dhColumnNames);
      
      // Kiểm tra và thêm cột id_user vào bảng don_hang nếu chưa tồn tại
      if (!dhColumnNames.includes('id_user')) {
        console.log('Thêm cột id_user...');
        await pool.query(`
          ALTER TABLE don_hang 
          ADD COLUMN id_user INT NULL,
          ADD INDEX (id_user)
        `);
        console.log('✅ Đã thêm cột id_user vào bảng don_hang');
      } else {
        console.log('✅ Cột id_user đã tồn tại trong bảng don_hang');
        
        // Kiểm tra xem cột id_user đã có chỉ mục chưa
        const hasIndex = dhColumns.some(col => 
          col.COLUMN_NAME === 'id_user' && 
          (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
        );
        
        if (!hasIndex) {
          console.log('Thêm chỉ mục cho cột id_user...');
          await pool.query(`ALTER TABLE don_hang ADD INDEX (id_user)`);
          console.log('✅ Đã thêm chỉ mục cho cột id_user');
        }
      }
      
      // Kiểm tra tên cột chính trong don_hang để sử dụng cho khóa ngoại
      const idColumnName = dhColumnNames.includes('id_dh') ? 'id_dh' : 
                          (dhColumnNames.includes('id') ? 'id' : null);
      
      if (!idColumnName) {
        throw new Error('Không tìm thấy cột ID chính trong bảng don_hang');
      }
      console.log(`✅ Cột ID chính của bảng don_hang: ${idColumnName}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra cấu trúc bảng don_hang: ${error.message}`);
    }
    
    // 2. Kiểm tra cấu trúc bảng don_hang_chi_tiet
    try {
      console.log('Kiểm tra cấu trúc bảng don_hang_chi_tiet...');
      const [dhctColumns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'don_hang_chi_tiet'
      `);
      
      const dhctColumnNames = dhctColumns.map(col => col.COLUMN_NAME);
      console.log('Các cột trong bảng don_hang_chi_tiet:', dhctColumnNames);
      
      // Kiểm tra và đảm bảo rằng các cột id_don_hang và id_sp có chỉ mục
      if (!dhctColumnNames.includes('id_don_hang') && dhctColumnNames.includes('id_dh')) {
        console.log('Đổi tên cột id_dh thành id_don_hang...');
        await pool.query(`
          ALTER TABLE don_hang_chi_tiet
          CHANGE COLUMN id_dh id_don_hang INT,
          ADD INDEX (id_don_hang)
        `);
        console.log('✅ Đã đổi tên cột id_dh thành id_don_hang');
      } else if (!dhctColumnNames.includes('id_don_hang') && !dhctColumnNames.includes('id_dh')) {
        console.log('Thêm cột id_don_hang...');
        await pool.query(`
          ALTER TABLE don_hang_chi_tiet
          ADD COLUMN id_don_hang INT NOT NULL,
          ADD INDEX (id_don_hang)
        `);
        console.log('✅ Đã thêm cột id_don_hang');
      } else {
        // Đảm bảo cột id_don_hang có chỉ mục
        const hasIndex = dhctColumns.some(col => 
          col.COLUMN_NAME === 'id_don_hang' && 
          (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
        );
        
        if (!hasIndex) {
          console.log('Thêm chỉ mục cho cột id_don_hang...');
          await pool.query(`ALTER TABLE don_hang_chi_tiet ADD INDEX (id_don_hang)`);
          console.log('✅ Đã thêm chỉ mục cho cột id_don_hang');
        }
      }
      
      // Kiểm tra và thêm chỉ mục cho id_sp nếu cần
      if (dhctColumnNames.includes('id_sp')) {
        const hasIdSpIndex = dhctColumns.some(col => 
          col.COLUMN_NAME === 'id_sp' && 
          (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
        );
        
        if (!hasIdSpIndex) {
          console.log('Thêm chỉ mục cho cột id_sp...');
          await pool.query(`ALTER TABLE don_hang_chi_tiet ADD INDEX (id_sp)`);
          console.log('✅ Đã thêm chỉ mục cho cột id_sp');
        }
      } else {
        console.log('Thêm cột id_sp vào bảng don_hang_chi_tiet...');
        await pool.query(`
          ALTER TABLE don_hang_chi_tiet
          ADD COLUMN id_sp INT NOT NULL,
          ADD INDEX (id_sp)
        `);
        console.log('✅ Đã thêm cột id_sp vào bảng don_hang_chi_tiet');
      }
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra cấu trúc bảng don_hang_chi_tiet: ${error.message}`);
    }
    
    // 3. Kiểm tra cấu trúc bảng san_pham
    try {
      console.log('Kiểm tra cấu trúc bảng san_pham...');
      const [spColumns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'san_pham'
      `);
      
      const spColumnNames = spColumns.map(col => col.COLUMN_NAME);
      console.log('Các cột trong bảng san_pham:', spColumnNames);
      
      // Kiểm tra cột id_dm hoặc cột liên quan đến danh mục
      let dmColumnName = null;
      
      if (spColumnNames.includes('id_dm')) {
        dmColumnName = 'id_dm';
      } else {
        // Tìm cột có thể liên quan đến danh mục
        const possibleDmColumns = spColumnNames.filter(colName => 
          colName.includes('dm') || 
          colName.includes('danh_muc') || 
          colName.includes('category')
        );
        
        if (possibleDmColumns.length > 0) {
          dmColumnName = possibleDmColumns[0];
          console.log(`Sử dụng cột ${dmColumnName} cho liên kết danh mục`);
        } else {
          console.log('Thêm cột id_dm...');
          await pool.query(`
            ALTER TABLE san_pham
            ADD COLUMN id_dm INT NOT NULL DEFAULT 1,
            ADD INDEX (id_dm)
          `);
          dmColumnName = 'id_dm';
          console.log('✅ Đã thêm cột id_dm vào bảng san_pham');
        }
      }
      
      // Đảm bảo cột id_dm có chỉ mục
      const hasDmIndex = spColumns.some(col => 
        col.COLUMN_NAME === dmColumnName && 
        (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
      );
      
      if (!hasDmIndex) {
        console.log(`Thêm chỉ mục cho cột ${dmColumnName}...`);
        await pool.query(`ALTER TABLE san_pham ADD INDEX (${dmColumnName})`);
        console.log(`✅ Đã thêm chỉ mục cho cột ${dmColumnName}`);
      }
      
      // Xác định tên cột ID chính của bảng san_pham (thường là id_sp)
      const spIdColumnName = spColumnNames.includes('id_sp') ? 'id_sp' : 
                           (spColumnNames.includes('id') ? 'id' : null);
      
      if (!spIdColumnName) {
        throw new Error('Không tìm thấy cột ID chính trong bảng san_pham');
      }
      console.log(`✅ Cột ID chính của bảng san_pham: ${spIdColumnName}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra cấu trúc bảng san_pham: ${error.message}`);
    }
    
    // 4. Kiểm tra cấu trúc bảng users
    try {
      console.log('Kiểm tra cấu trúc bảng users...');
      const [userColumns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'users'
      `);
      
      const userColumnNames = userColumns.map(col => col.COLUMN_NAME);
      
      if (userColumnNames.length === 0) {
        throw new Error('Không tìm thấy bảng users trong cơ sở dữ liệu');
      }
      
      console.log('Các cột trong bảng users:', userColumnNames);
      
      // Xác định tên cột ID chính của bảng users
      const userIdColumnName = userColumnNames.includes('id') ? 'id' : 
                            (userColumnNames.includes('user_id') ? 'user_id' : null);
      
      if (!userIdColumnName) {
        throw new Error('Không tìm thấy cột ID chính trong bảng users');
      }
      console.log(`✅ Cột ID chính của bảng users: ${userIdColumnName}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra cấu trúc bảng users: ${error.message}`);
    }
    
    // 5. Kiểm tra và tạo bảng binh_luan nếu chưa tồn tại
    try {
      console.log('Kiểm tra bảng binh_luan...');
      const [tables] = await pool.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'binh_luan'
      `);
      
      if (tables.length === 0) {
        console.log('Bảng binh_luan không tồn tại. Tạo bảng mới...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS binh_luan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_sp INT NOT NULL,
            id_user INT,
            noi_dung TEXT,
            ngay_binh_luan DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (id_sp),
            INDEX (id_user)
          )
        `);
        console.log('✅ Đã tạo bảng binh_luan');
      } else {
        console.log('✅ Bảng binh_luan đã tồn tại');
        
        // Kiểm tra và thêm chỉ mục cho các cột nếu cần
        const [blColumns] = await pool.query(`
          SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'laptop_react' 
          AND TABLE_NAME = 'binh_luan'
        `);
        
        const blColumnNames = blColumns.map(col => col.COLUMN_NAME);
        
        // Thêm chỉ mục cho id_sp nếu cần
        const hasIdSpIndex = blColumns.some(col => 
          col.COLUMN_NAME === 'id_sp' && 
          (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
        );
        
        if (!hasIdSpIndex && blColumnNames.includes('id_sp')) {
          await pool.query(`ALTER TABLE binh_luan ADD INDEX (id_sp)`);
          console.log('✅ Đã thêm chỉ mục cho cột id_sp trong bảng binh_luan');
        }
        
        // Thêm chỉ mục cho id_user nếu cần
        const hasIdUserIndex = blColumns.some(col => 
          col.COLUMN_NAME === 'id_user' && 
          (col.COLUMN_KEY === 'PRI' || col.COLUMN_KEY === 'MUL')
        );
        
        if (!hasIdUserIndex && blColumnNames.includes('id_user')) {
          await pool.query(`ALTER TABLE binh_luan ADD INDEX (id_user)`);
          console.log('✅ Đã thêm chỉ mục cho cột id_user trong bảng binh_luan');
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra/tạo bảng binh_luan: ${error.message}`);
    }
    
    // 6. Kiểm tra cấu trúc bảng danh_muc
    try {
      console.log('Kiểm tra cấu trúc bảng danh_muc...');
      const [dmColumns] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_KEY, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'danh_muc'
      `);
      
      const dmColumnNames = dmColumns.map(col => col.COLUMN_NAME);
      
      if (dmColumnNames.length === 0) {
        throw new Error('Không tìm thấy bảng danh_muc trong cơ sở dữ liệu');
      }
      
      console.log('Các cột trong bảng danh_muc:', dmColumnNames);
      
      // Xác định tên cột ID chính của bảng danh_muc
      const dmIdColumnName = dmColumnNames.includes('id_dm') ? 'id_dm' : 
                           (dmColumnNames.includes('id') ? 'id' : null);
      
      if (!dmIdColumnName) {
        throw new Error('Không tìm thấy cột ID chính trong bảng danh_muc');
      }
      console.log(`✅ Cột ID chính của bảng danh_muc: ${dmIdColumnName}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra cấu trúc bảng danh_muc: ${error.message}`);
    }
    
    // Kiểm tra dữ liệu không hợp lệ trước khi tạo ràng buộc ngoại khóa
    console.log('\nKiểm tra dữ liệu không hợp lệ trước khi tạo ràng buộc ngoại khóa...');
    
    try {
      // 1. Kiểm tra id_user hợp lệ trong bảng don_hang
      console.log('Kiểm tra id_user hợp lệ trong bảng don_hang...');
      
      // Lấy primary key của bảng users
      const [userPK] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_KEY = 'PRI'
      `);
      const userIdColumn = userPK.length > 0 ? userPK[0].COLUMN_NAME : 'id';
      
      // Tìm các giá trị id_user trong don_hang mà không tồn tại trong users
      const [invalidUserIds] = await pool.query(`
        SELECT dh.id_user 
        FROM don_hang dh 
        LEFT JOIN users u ON dh.id_user = u.${userIdColumn}
        WHERE dh.id_user IS NOT NULL AND u.${userIdColumn} IS NULL
      `);
      
      if (invalidUserIds.length > 0) {
        console.log(`⚠️ Phát hiện ${invalidUserIds.length} đơn hàng có id_user không hợp lệ. Cập nhật về NULL...`);
        await pool.query(`UPDATE don_hang SET id_user = NULL WHERE id_user NOT IN (SELECT ${userIdColumn} FROM users)`);
        console.log('✅ Đã cập nhật các id_user không hợp lệ');
      } else {
        console.log('✅ Không phát hiện id_user không hợp lệ trong bảng don_hang');
      }
      
      // 2. Kiểm tra id_don_hang hợp lệ trong bảng don_hang_chi_tiet
      console.log('Kiểm tra id_don_hang hợp lệ trong bảng don_hang_chi_tiet...');
      
      // Lấy primary key của bảng don_hang
      const [dhPK] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'don_hang' 
        AND COLUMN_KEY = 'PRI'
      `);
      const dhIdColumn = dhPK.length > 0 ? dhPK[0].COLUMN_NAME : 'id_dh';
      
      // Tìm các giá trị id_don_hang trong don_hang_chi_tiet mà không tồn tại trong don_hang
      const [invalidDhIds] = await pool.query(`
        SELECT dhct.id_don_hang 
        FROM don_hang_chi_tiet dhct 
        LEFT JOIN don_hang dh ON dhct.id_don_hang = dh.${dhIdColumn}
        WHERE dh.${dhIdColumn} IS NULL
      `);
      
      if (invalidDhIds.length > 0) {
        console.log(`⚠️ Phát hiện ${invalidDhIds.length} chi tiết đơn hàng có id_don_hang không hợp lệ. Xóa các bản ghi này...`);
        await pool.query(`DELETE FROM don_hang_chi_tiet WHERE id_don_hang NOT IN (SELECT ${dhIdColumn} FROM don_hang)`);
        console.log('✅ Đã xóa các chi tiết đơn hàng không hợp lệ');
      } else {
        console.log('✅ Không phát hiện id_don_hang không hợp lệ trong bảng don_hang_chi_tiet');
      }
      
      // 3. Kiểm tra id_sp hợp lệ trong bảng don_hang_chi_tiet
      console.log('Kiểm tra id_sp hợp lệ trong bảng don_hang_chi_tiet...');
      
      // Lấy primary key của bảng san_pham
      const [spPK] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'san_pham' 
        AND COLUMN_KEY = 'PRI'
      `);
      const spIdColumn = spPK.length > 0 ? spPK[0].COLUMN_NAME : 'id_sp';
      
      // Tìm các giá trị id_sp trong don_hang_chi_tiet mà không tồn tại trong san_pham
      const [invalidSpIds] = await pool.query(`
        SELECT dhct.id_sp 
        FROM don_hang_chi_tiet dhct 
        LEFT JOIN san_pham sp ON dhct.id_sp = sp.${spIdColumn}
        WHERE sp.${spIdColumn} IS NULL
      `);
      
      if (invalidSpIds.length > 0) {
        console.log(`⚠️ Phát hiện ${invalidSpIds.length} chi tiết đơn hàng có id_sp không hợp lệ. Xóa các bản ghi này...`);
        await pool.query(`DELETE FROM don_hang_chi_tiet WHERE id_sp NOT IN (SELECT ${spIdColumn} FROM san_pham)`);
        console.log('✅ Đã xóa các chi tiết đơn hàng có id_sp không hợp lệ');
      } else {
        console.log('✅ Không phát hiện id_sp không hợp lệ trong bảng don_hang_chi_tiet');
      }
      
      // 4. Kiểm tra id_dm hợp lệ trong bảng san_pham
      console.log('Kiểm tra id_dm hợp lệ trong bảng san_pham...');
      
      // Lấy primary key của bảng danh_muc
      const [dmPK] = await pool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'danh_muc' 
        AND COLUMN_KEY = 'PRI'
      `);
      const dmIdColumn = dmPK.length > 0 ? dmPK[0].COLUMN_NAME : 'id_dm';
      
      // Tìm các giá trị id_dm trong san_pham mà không tồn tại trong danh_muc
      const [invalidDmIds] = await pool.query(`
        SELECT sp.id_dm 
        FROM san_pham sp 
        LEFT JOIN danh_muc dm ON sp.id_dm = dm.${dmIdColumn}
        WHERE dm.${dmIdColumn} IS NULL
      `);
      
      if (invalidDmIds.length > 0) {
        console.log(`⚠️ Phát hiện ${invalidDmIds.length} sản phẩm có id_dm không hợp lệ.`);
        
        // Kiểm tra xem có danh mục mặc định không (id_dm = 1)
        const [defaultDm] = await pool.query(`SELECT * FROM danh_muc WHERE ${dmIdColumn} = 1`);
        
        if (defaultDm.length === 0) {
          console.log('Tạo danh mục mặc định...');
          await pool.query(`INSERT INTO danh_muc (${dmIdColumn}, ten_dm) VALUES (1, 'Danh mục mặc định')`);
          console.log('✅ Đã tạo danh mục mặc định');
        }
        
        await pool.query(`UPDATE san_pham SET id_dm = 1 WHERE id_dm NOT IN (SELECT ${dmIdColumn} FROM danh_muc)`);
        console.log('✅ Đã cập nhật id_dm không hợp lệ thành danh mục mặc định');
      } else {
        console.log('✅ Không phát hiện id_dm không hợp lệ trong bảng san_pham');
      }
      
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra dữ liệu không hợp lệ: ${error.message}`);
    }
    
    // Truy vấn thông tin cho việc tạo ràng buộc
    console.log('\nLấy thông tin cấu trúc bảng để tạo ràng buộc khóa ngoại...');
    
    // Lấy thông tin về các cột chính trong bảng
    const [userTable] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_KEY = 'PRI'
    `);
    const userIdColumn = userTable.length > 0 ? userTable[0].COLUMN_NAME : 'id';
    
    const [dhTable] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'don_hang' 
      AND COLUMN_KEY = 'PRI'
    `);
    const dhIdColumn = dhTable.length > 0 ? dhTable[0].COLUMN_NAME : 'id_dh';
    
    const [spTable] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'san_pham' 
      AND COLUMN_KEY = 'PRI'
    `);
    const spIdColumn = spTable.length > 0 ? spTable[0].COLUMN_NAME : 'id_sp';
    
    const [dmTable] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'laptop_react' 
      AND TABLE_NAME = 'danh_muc' 
      AND COLUMN_KEY = 'PRI'
    `);
    const dmIdColumn = dmTable.length > 0 ? dmTable[0].COLUMN_NAME : 'id_dm';
    
    // Kiểm tra và xóa các ràng buộc khóa ngoại hiện có nếu cần
    console.log('\nKiểm tra và xóa các ràng buộc khóa ngoại hiện có nếu cần...');
    
    try {
      const [constraints] = await pool.query(`
        SELECT CONSTRAINT_NAME, TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND TABLE_SCHEMA = 'laptop_react'
        AND (
          TABLE_NAME = 'don_hang'
          OR TABLE_NAME = 'don_hang_chi_tiet'
          OR TABLE_NAME = 'san_pham'
          OR TABLE_NAME = 'binh_luan'
        )
      `);
      
      if (constraints.length > 0) {
        console.log(`Tìm thấy ${constraints.length} ràng buộc khóa ngoại hiện có.`);
        
        for (const constraint of constraints) {
          try {
            console.log(`Xóa ràng buộc ${constraint.CONSTRAINT_NAME} trên bảng ${constraint.TABLE_NAME}...`);
            await pool.query(`ALTER TABLE ${constraint.TABLE_NAME} DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
            console.log(`✅ Đã xóa ràng buộc ${constraint.CONSTRAINT_NAME}`);
          } catch (error) {
            console.error(`❌ Lỗi khi xóa ràng buộc ${constraint.CONSTRAINT_NAME}: ${error.message}`);
          }
        }
      } else {
        console.log('Không tìm thấy ràng buộc khóa ngoại hiện có.');
      }
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra ràng buộc hiện có: ${error.message}`);
    }
    
    // Danh sách các ràng buộc khóa ngoại cần thêm (đã sửa tên cột theo cấu trúc thực tế)
    console.log('\nThêm các ràng buộc khóa ngoại...');
    
    // Đồng bộ kiểu dữ liệu giữa các cột khóa chính và khóa ngoại
    try {
      console.log('Đồng bộ kiểu dữ liệu giữa các cột khóa chính và khóa ngoại...');
      
      // 1. Đồng bộ kiểu dữ liệu giữa users.id và don_hang.id_user
      const [userIdType] = await pool.query(`
        SELECT DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = '${userIdColumn}'
      `);
      
      if (userIdType.length > 0) {
        await pool.query(`
          ALTER TABLE don_hang 
          MODIFY COLUMN id_user ${userIdType[0].COLUMN_TYPE}
        `);
        console.log('✅ Đã đồng bộ kiểu dữ liệu giữa users.id và don_hang.id_user');
      }
      
      // 2. Đồng bộ kiểu dữ liệu giữa don_hang.id_dh và don_hang_chi_tiet.id_don_hang
      const [dhIdType] = await pool.query(`
        SELECT DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'don_hang' 
        AND COLUMN_NAME = '${dhIdColumn}'
      `);
      
      if (dhIdType.length > 0) {
        await pool.query(`
          ALTER TABLE don_hang_chi_tiet 
          MODIFY COLUMN id_don_hang ${dhIdType[0].COLUMN_TYPE} NOT NULL
        `);
        console.log('✅ Đã đồng bộ kiểu dữ liệu giữa don_hang.id_dh và don_hang_chi_tiet.id_don_hang');
      }
      
      // 3. Đồng bộ kiểu dữ liệu giữa san_pham.id_sp và don_hang_chi_tiet.id_sp
      const [spIdType] = await pool.query(`
        SELECT DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'san_pham' 
        AND COLUMN_NAME = '${spIdColumn}'
      `);
      
      if (spIdType.length > 0) {
        await pool.query(`
          ALTER TABLE don_hang_chi_tiet 
          MODIFY COLUMN id_sp ${spIdType[0].COLUMN_TYPE} NOT NULL
        `);
        console.log('✅ Đã đồng bộ kiểu dữ liệu giữa san_pham.id_sp và don_hang_chi_tiet.id_sp');
      }
      
      // 4. Đồng bộ kiểu dữ liệu giữa danh_muc.id_dm và san_pham.id_dm
      const [dmIdType] = await pool.query(`
        SELECT DATA_TYPE, COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'laptop_react' 
        AND TABLE_NAME = 'danh_muc' 
        AND COLUMN_NAME = '${dmIdColumn}'
      `);
      
      if (dmIdType.length > 0) {
        await pool.query(`
          ALTER TABLE san_pham 
          MODIFY COLUMN id_dm ${dmIdType[0].COLUMN_TYPE} NOT NULL
        `);
        console.log('✅ Đã đồng bộ kiểu dữ liệu giữa danh_muc.id_dm và san_pham.id_dm');
      }
      
    } catch (error) {
      console.error(`❌ Lỗi khi đồng bộ kiểu dữ liệu: ${error.message}`);
    }
    
    // Thêm các ràng buộc khóa ngoại
    const foreignKeyQueries = [
      // 1. Liên kết don_hang với users
      {
        query: `ALTER TABLE don_hang 
                ADD CONSTRAINT fk_don_hang_users 
                FOREIGN KEY (id_user) REFERENCES users(${userIdColumn}) 
                ON DELETE SET NULL ON UPDATE CASCADE;`,
        description: "liên kết don_hang với users"
      },

      // 2. Liên kết don_hang_chi_tiet với don_hang
      {
        query: `ALTER TABLE don_hang_chi_tiet 
                ADD CONSTRAINT fk_dhct_don_hang 
                FOREIGN KEY (id_don_hang) REFERENCES don_hang(${dhIdColumn}) 
                ON DELETE CASCADE ON UPDATE CASCADE;`,
        description: "liên kết don_hang_chi_tiet với don_hang"
      },
      
      // 3. Liên kết don_hang_chi_tiet với san_pham
      {
        query: `ALTER TABLE don_hang_chi_tiet 
                ADD CONSTRAINT fk_dhct_san_pham 
                FOREIGN KEY (id_sp) REFERENCES san_pham(${spIdColumn}) 
                ON DELETE RESTRICT ON UPDATE CASCADE;`,
        description: "liên kết don_hang_chi_tiet với san_pham"
      },
      
      // 4. Liên kết san_pham với danh_muc
      {
        query: `ALTER TABLE san_pham 
                ADD CONSTRAINT fk_san_pham_danh_muc 
                FOREIGN KEY (id_dm) REFERENCES danh_muc(${dmIdColumn}) 
                ON DELETE RESTRICT ON UPDATE CASCADE;`,
        description: "liên kết san_pham với danh_muc"
      },
      
      // 5. Liên kết binh_luan với san_pham
      {
        query: `ALTER TABLE binh_luan 
                ADD CONSTRAINT fk_binh_luan_san_pham 
                FOREIGN KEY (id_sp) REFERENCES san_pham(${spIdColumn}) 
                ON DELETE CASCADE ON UPDATE CASCADE;`,
        description: "liên kết binh_luan với san_pham"
      },
      
      // 6. Liên kết binh_luan với users
      {
        query: `ALTER TABLE binh_luan 
                ADD CONSTRAINT fk_binh_luan_users 
                FOREIGN KEY (id_user) REFERENCES users(${userIdColumn}) 
                ON DELETE SET NULL ON UPDATE CASCADE;`,
        description: "liên kết binh_luan với users"
      }
    ];
    
    // Thực thi từng câu lệnh SQL
    for (const item of foreignKeyQueries) {
      try {
        console.log(`Đang thực hiện ${item.description}...`);
        await pool.query(item.query);
        console.log(`✅ ${item.description.charAt(0).toUpperCase() + item.description.slice(1)} thành công!`);
      } catch (error) {
        console.error(`❌ Lỗi khi ${item.description}: ${error.message}`);
        
        // Nếu lỗi liên quan đến ràng buộc đã tồn tại, không phải lỗi nghiêm trọng
        if (error.message.includes('Duplicate key name') || 
            error.message.includes('already exists')) {
          console.log(`ℹ️ Ràng buộc này có thể đã tồn tại.`);
        } else if (error.message.includes('Cannot add or update a child row')) {
          console.log(`❗ Có dữ liệu không hợp lệ trong bảng. Đang thử xử lý...`);
          
          if (item.description.includes('don_hang với users')) {
            await pool.query(`UPDATE don_hang SET id_user = NULL WHERE id_user IS NOT NULL AND id_user NOT IN (SELECT ${userIdColumn} FROM users)`);
            
            // Thử lại sau khi sửa dữ liệu
            try {
              await pool.query(item.query);
              console.log(`✅ ${item.description.charAt(0).toUpperCase() + item.description.slice(1)} thành công sau khi sửa dữ liệu!`);
            } catch (retryError) {
              console.error(`❌ Vẫn không thể tạo ràng buộc: ${retryError.message}`);
            }
          } else if (item.description.includes('don_hang_chi_tiet với don_hang')) {
            await pool.query(`DELETE FROM don_hang_chi_tiet WHERE id_don_hang NOT IN (SELECT ${dhIdColumn} FROM don_hang)`);
            
            // Thử lại sau khi sửa dữ liệu
            try {
              await pool.query(item.query);
              console.log(`✅ ${item.description.charAt(0).toUpperCase() + item.description.slice(1)} thành công sau khi sửa dữ liệu!`);
            } catch (retryError) {
              console.error(`❌ Vẫn không thể tạo ràng buộc: ${retryError.message}`);
            }
          } else if (item.description.includes('don_hang_chi_tiet với san_pham')) {
            await pool.query(`DELETE FROM don_hang_chi_tiet WHERE id_sp NOT IN (SELECT ${spIdColumn} FROM san_pham)`);
            
            // Thử lại sau khi sửa dữ liệu
            try {
              await pool.query(item.query);
              console.log(`✅ ${item.description.charAt(0).toUpperCase() + item.description.slice(1)} thành công sau khi sửa dữ liệu!`);
            } catch (retryError) {
              console.error(`❌ Vẫn không thể tạo ràng buộc: ${retryError.message}`);
            }
          } else if (item.description.includes('san_pham với danh_muc')) {
            // Kiểm tra xem có danh mục mặc định không (id_dm = 1)
            const [defaultDm] = await pool.query(`SELECT * FROM danh_muc WHERE ${dmIdColumn} = 1`);
            
            if (defaultDm.length === 0) {
              await pool.query(`INSERT INTO danh_muc (${dmIdColumn}, ten_dm) VALUES (1, 'Danh mục mặc định')`);
            }
            
            await pool.query(`UPDATE san_pham SET id_dm = 1 WHERE id_dm NOT IN (SELECT ${dmIdColumn} FROM danh_muc)`);
            
            // Thử lại sau khi sửa dữ liệu
            try {
              await pool.query(item.query);
              console.log(`✅ ${item.description.charAt(0).toUpperCase() + item.description.slice(1)} thành công sau khi sửa dữ liệu!`);
            } catch (retryError) {
              console.error(`❌ Vẫn không thể tạo ràng buộc: ${retryError.message}`);
            }
          }
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
addForeignKeyConstraints();