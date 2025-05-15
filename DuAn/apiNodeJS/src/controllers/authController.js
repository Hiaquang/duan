const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { email, password } = req.body;

  // Giả sử bạn đã xác thực email và password
  const user = { id: 1, email, role: 1 }; // role: 1 là admin, 0 là user

  const token = jwt.sign(user, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token });
};

module.exports = { login };