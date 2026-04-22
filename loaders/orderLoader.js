const DataLoader = require('dataloader');
const pool = require('../db/connection.js');

/*const orderLoader = new DataLoader(async (userIds) => {

  console.log('Batching orders for user IDs:', userIds); // Log the batch of user IDs being loaded
  const [rows] = await pool.execute(
    `SELECT id, total, user_id FROM orders WHERE user_id IN (?)`,
    [userIds]       
  );
  
const ordersMap = {};

  userIds.forEach(id => {
    ordersMap[id] = [];
  });

  rows.forEach(order => {
    if (!ordersMap[order.user_id]) {
      ordersMap[order.user_id] = [];
    }
    ordersMap[order.user_id].push(order);
  });

  return userIds.map(id => ordersMap[id]);
});
*/

const orderLoaderMap = new DataLoader(async(userIds) => {
  const [rows] = await pool.execute(
    `SELECT id, total, user_id FROM orders WHERE USER_ID IN (?)`,
    [userIds]
  );

  const ordersMap = new Map();

  userIds.forEach(id => {
    ordersMap.set(id, []);
  }
);

  rows.forEach(order => {
    if (!ordersMap.has(order.user_id)) {
      ordersMap.set(order.user_id, []);
    }
    ordersMap.get(order.user_id).push(order); 
  });

  return userIds.map(id => ordersMap.get(id));
})

//module.exports = orderLoader;
module.exports = orderLoaderMap;