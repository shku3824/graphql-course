const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'shreyk',
  password: '135Apt@109',
  database: 'graphql_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;