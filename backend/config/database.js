const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 20000,
    idleTimeout: 60000
});

pool.on('error', (err) => {
  console.error('MySQL Pool Error:', err.message || err);
});

// Export a wrapper that mimics the single connection interface but uses the pool
const db = {
  query: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    return pool.query(sql, params, callback);
  },
  beginTransaction: (callback) => {
    if (typeof callback === 'function') callback(null);
    return Promise.resolve();
  },
  commit: (callback) => {
    if (typeof callback === 'function') callback(null);
    return Promise.resolve();
  },
  rollback: (callback) => {
    if (typeof callback === 'function') callback();
    return Promise.resolve();
  },
  connect: (callback) => {
    if (typeof callback === 'function') callback(null);
  }
};

module.exports = db;