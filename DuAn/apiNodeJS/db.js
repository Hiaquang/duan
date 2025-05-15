const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: "laptop_react",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log("Đã kết nối database");

module.exports = { pool };