const bcrypt = require('bcrypt');
try {
    const hash = bcrypt.hashSync('trung2712', 10);
    console.log('Hashed password:', hash);
} catch (err) {
    console.error('Lỗi:', err);
}