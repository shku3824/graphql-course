const pool = require('../db/connection.js');
const {GraphQLError} = require('graphql');

class UserService {


  async getUserById(id) {
      const [rows] = await pool.execute(
        'SELECT id, name, age, email FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    }

  async getAllUsers() {
      const [rows] = await pool.execute(
        'SELECT id, name, age, email FROM users;'
      );
      return rows;
    }

  async getAllUsersWithLimitAndOffset(limit, offset) {

    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    if (limitNum <= 0 || offsetNum < 0) {
      throw new Error("Invalid pagination parameters");
    }

    const query = `
      SELECT id, name, age, email 
      FROM users 
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const [rows] = await pool.query(query);

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as totalCount FROM users'
    );

    return {
      data: rows,
      totalCount: countRows[0].totalCount
    };
  }

  async getUsersWithPaginationAndFiltering(limit, offset, filter, sort) {

    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    if (limitNum <= 0 || offsetNum < 0) {
      throw new Error("Invalid pagination parameters");
    }

    let query = 'SELECT id, name, age, email FROM users WHERE ';

    if(filter) {
      const conditions = [];
      if(filter.name) {
        conditions.push(`name LIKE '%${filter.name}%'`);
      }
      if(filter.minAge !== undefined) {
        conditions.push(`age >= ${filter.minAge}`);
      }
      if(filter.maxAge !== undefined) {
        conditions.push(`age <= ${filter.maxAge}`);
      }

      query += conditions.join(' AND ');
    }

    // Apply sorting if provided
    if (sort) {
      const { field, order } = sort;
      const validFields = ['NAME', 'AGE', 'EMAIL'];
      const validOrders = ['ASC', 'DESC'];

      if (validFields.includes(field) && validOrders.includes(order)) {
        query += ` ORDER BY ${field} ${order}`;
      } 
      else {
        query += ` ORDER BY ID ASC`; // Default sorting
      }
    }

    query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const [rows] = await pool.query(query);
      
    const countQuery = filter ? query.replace('SELECT id, name, age, email', 'SELECT COUNT(*) as totalCount').replace(/ORDER BY .+/, '') : 'SELECT COUNT(*) as totalCount FROM users';
    const [countRows] = await pool.query(countQuery);

    return {
      data: rows,
      totalCount: countRows[0].totalCount
    };

  }


  async createUser(name, age, email) {

  if(!name || name.trim() === '') {
      throw new Error('Invalid input: Name must be a non-empty string.');
    }

    //Validations.
    if(!age || age <= 0) {
      //throw new Error('Invalid input: Age must be a positive integer.');
      throw new GraphQLError('Invalid input: Age must be a positive integer.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: ['age']
        }
      });
    }

    if(!email || email.trim() === '') {
      throw new Error('Invalid input: Email must be a non-empty string.');
    }

      // Insert the new user into the database
      const [result] = await pool.execute(
        'INSERT INTO users (name, age, email) VALUES (?, ?,?)',
        [name, age, email]
      );
      return {
        id: result.insertId,
        name,
        age,
        email
      };
    }

  async updateUser(id, input) {
    const { name, age, email } = input;

    // Build the update query dynamically based on provided fields
    let query = 'UPDATE users SET ';
    
    const params = [];
    const fields = [];

    const existingUser = await this.getUserById(id);
      
    if (!existingUser) {
      //throw new Error(`Existing User with ID ${id} not found.`);

      throw new GraphQLError('Existing user with id ${id} not found.', {
        extensions: {
          code: 'USER_NOT_FOUND',
          invalidArgs: ['id']
        }
      });
    }

    if (!name && !age && !email) {
      throw new Error('At least one field (name, age, or email) must be provided for update.');
    }
    

    if(age !== undefined && (age < 0)) {
      throw new GraphQLError('Invalid input: Age must be a positive integer.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: ['age']
        }
      });
    }

    if(name && name.trim() === '') {
      throw new GraphQLError('Invalid input: Name must be a non-empty string.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: ['name']
        }
      });
    }

    if(name && name.length < 2) {
      throw new GraphQLError('Invalid input: Name must be at least 2 characters long.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: ['name']
        }
      });
    }

    if (name) {
      fields.push("name = ?");
      params.push(name);
    }

    if (age !== undefined) {
      fields.push("age = ?");
      params.push(age);
    }

    if (email) {
      fields.push("email = ?");
      params.push(email);
    }
    
    query += fields.join(', ') + ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    return existingUser;
  }

  async deleteUser(id) {

    const existingUser = await this.getUserById(id);

    let code = '';

    if(!existingUser) {
      code = 'USER_NOT_FOUND';
      /*throw new GraphQLError('User with id ${id} not found.', {
        extensions: {
          code: 'USER_NOT_FOUND',
          invalidArgs: ['id']
        }
      });*/
    }

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    //Number of rows deleted. If it's greater than 0, it means the user was successfully deleted.
    //return result.affectedRows > 0;

    return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'User deleted successfully.' : 'Failed to delete user.',
        code: result.affectedRows > 0 ? 'USER_DELETED' : code

    };
        
  }

}
module.exports = UserService;

 // Below methods are for testing without DB connection. 
 // You can replace the above methods with these if you want to test without setting up a database. 
 /*
    getUserById(id) {

    const users = [
    {
        id: "1",
        name: "Shrey",
        age: 30,
        salary: 10000.00,
        email: "shrey@example.com"
    },
    {id: "2",
      name: "Alice",
      age: 26,
      salary: 10000.00,
      email: "alice@example.com"
    }
  ];
        return users.find(user => user.id === id);
    }

    getAllUsers(){
        const users = [
    {
        id: "1",
        name: "Shrey",
        age: 30,
        salary: 10000.00,
        email: "shrey@example.com"
    },
    {id: "2",
      name: "Alice",
      age: 26,
      salary: 10000.00,
      email: "alice@example.com"
    }
  ];
        return users;
    }
*/