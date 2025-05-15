const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {
    router.get('/:product_id', async (req, res) => {
        try {
            const product_id_param = parseInt(req.params.product_id);
            if (isNaN(product_id_param) || product_id_param <= 0) {
                return res.status(400).json({ thongbao: "ID sản phẩm không hợp lệ" });
            }

            const [product] = await pool.query(`SELECT id FROM san_pham WHERE id = ?`, [product_id_param]);
            if (product.length === 0) {
                return res.status(404).json({ thongbao: "Sản phẩm không tồn tại" });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [rows] = await pool.query(
                `SELECT 
                    c.id, 
                    c.user_id,
                    c.Comment_Text,
                    c.Rating,
                    c.created_at,
                    u.name as user_name,
                    u.hinh as user_avatar
                 FROM comment c
                 JOIN users u ON c.user_id = u.id
                 WHERE c.product_id = ? 
                 ORDER BY c.created_at DESC 
                 LIMIT ? OFFSET ?`,
                [product_id_param, limit, offset]
            );

            const [totalResult] = await pool.query(`SELECT COUNT(*) as total FROM comment WHERE product_id = ?`, [product_id_param]);
            const totalComments = totalResult[0].total;

            const [avgRatingResult] = await pool.query(`SELECT AVG(Rating) as average_rating FROM comment WHERE product_id = ?`, [product_id_param]);
            const averageRating = avgRatingResult[0].average_rating || 0;

            res.json({
                comments: rows,
                total: totalComments,
                page,
                limit,
                average_rating: averageRating
            });
        } catch (err) {
            console.error("Lỗi GET /comments:", err);
            console.error("Error stack (GET /comments):", err.stack);
            res.status(500).json({ thongbao: "Lỗi lấy danh sách bình luận", error: err.message });
        }
    });

    router.post('/', authenticateToken, async (req, res) => {
        try {
            const { content, rating, product_id } = req.body;

            const userId = req.user.userId;

            console.log('--- POST /comments (in router) Received ---');
            console.log('Body:', { content, rating, product_id });
            console.log('User ID from token:', userId);
            console.log('-----------------------------------------');

            if (!userId) {
                return res.status(403).json({ thongbao: "Lỗi xác thực người dùng (không tìm thấy userId trong token)." });
            }
            if (!product_id || isNaN(product_id)) {
                return res.status(400).json({ thongbao: "Thiếu hoặc sai ID sản phẩm", received: { product_id } });
            }
            const commentText = content ? content.trim() : '';
            if (commentText.length === 0 || commentText.length > 500) {
                return res.status(400).json({ thongbao: "Nội dung bình luận không hợp lệ (1-500 ký tự)", received: { content } });
            }
            const ratingValue = parseInt(rating);
            if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                return res.status(400).json({ thongbao: "Rating phải từ 1 đến 5", received: { rating } });
            }

            const [product] = await pool.query(`SELECT id FROM san_pham WHERE id = ?`, [product_id]);
            if (product.length === 0) {
                return res.status(404).json({ thongbao: "Sản phẩm không tồn tại" });
            }

            const [userRows] = await pool.query('SELECT name, hinh FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                return res.status(404).json({ thongbao: "Người dùng không tồn tại trong database." });
            }
            const userName = userRows[0].name;
            const userAvatar = userRows[0].hinh;

            const [existingComment] = await pool.query(
                `SELECT id FROM comment WHERE user_id = ? AND product_id = ?`,
                [userId, product_id]
            );
            if (existingComment.length > 0) {
                return res.status(400).json({ thongbao: "Bạn đã bình luận cho sản phẩm này rồi" });
            }

            const [result] = await pool.query(
                `INSERT INTO comment (user_id, product_id, Comment_Text, Rating, created_at) 
                 VALUES (?, ?, ?, ?, NOW())`,
                [userId, product_id, commentText, ratingValue]
            );

            const newComment = {
                id: result.insertId,
                user_id: userId,
                product_id: product_id,
                Comment_Text: commentText,
                Rating: ratingValue,
                created_at: new Date().toISOString(),
                user_name: userName,
                user_avatar: userAvatar
            };

            console.log("Added comment:", newComment);
            res.status(201).json(newComment);
        } catch (err) {
            console.error("Lỗi POST /comments:", err);
            console.error("Error stack (POST /comments):", err.stack);
            res.status(500).json({ thongbao: "Thêm bình luận thất bại", error: err.message });
        }
    });

    return router;
};