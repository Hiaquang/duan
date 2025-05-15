const getUsers = (req, res) => {
    res.json({ message: 'Welcome, user!', user: req.user });
  };
  
  const getAdminData = (req, res) => {
    res.json({ message: 'Welcome, admin!', user: req.user });
  };
  
  module.exports = { getUsers, getAdminData };