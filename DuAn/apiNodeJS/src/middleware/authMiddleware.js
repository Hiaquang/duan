const jwt = require('jsonwebtoken');
const pool = require('../../db');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            const userRole = rows[0].role;

            if (userRole < requiredRole) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });
            }

            req.userRole = userRole;
            next();
        } catch (err) {
            return res.status(500).json({ message: "Lỗi server khi kiểm tra quyền" });
        }
    };
};

const permissions = {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2
};

module.exports = {
    verifyToken,
    checkRole,
    permissions
};