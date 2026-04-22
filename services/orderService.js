const pool = require('../db/connection.js');

class OrderService {

    async getOrdersByUserId(userId) {
        const [rows] = await pool.execute(
            'SELECT id, total FROM orders WHERE user_id = ?',
            [userId]
        );
        return rows;
    }
}

module.exports = OrderService;