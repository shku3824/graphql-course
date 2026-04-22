const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const UserService = require('./services/userService');
const OrderService = require('./services/orderService');
const orderLoader = require('./loaders/orderLoader');
const orderLoaderMap = require('./loaders/orderLoader');

const { typeDefs } = require('./schema/schema');

// 2. Resolvers (slightly updated)
const resolvers = {
  Query: {
    user: (_, { id }, context) => {
      return context.userService.getUserById(id);
    },
    users: (_, __, context) => {
      return context.userService.getAllUsers();
    },
    usersPaginated: (_, { limit, offset }, context) => {
      console.log('Inside index.js Resolver usersPaginated - Limit:', limit, 'Offset:', offset);
      return context.userService.getAllUsersWithLimitAndOffset(limit, offset);
    },
    usersPaginatedV2: (_, { limit, offset, filter, sort }, context) => {
      console.log('Inside index.js Resolver usersPaginatedAdvanced - Limit:', limit, 'Offset:', offset, 'Filter:', filter, 'Sort:', sort);
      return context.userService.getUsersWithPaginationAndFiltering(limit, offset, filter, sort);
    }
  },
    // You can add Mutation resolvers here if needed
  Mutation: {
    
    // Implement user creation logic here, e.g., call a method in UserService to create a new user in the database.
    createUser: (_, { input }, context) => {
      return context.userService.createUser(input.name, input.age, input.email);
    },

    // Implement user update logic here, e.g., call a method in UserService to update the user in the database.    
    updateUser: async (_, { id, input }, context) => {
      return await context.userService.updateUser(id, input);
    },
    
    // Implement user deletion logic here, e.g., call a method in UserService to delete the user from the database.
    deleteUser: async (_, {id}, context) => {
      return await context.userService.deleteUser(id);
    },

    // Implement user deletion logic here, e.g., call a method in UserService to delete the user from the database.
    deleteUserWithResponse: async (_, {id}, context) => {
      return await context.userService.deleteUser(id);
    }
  },

    User: {
      orders: (parent, _, context) => {
        return context.loaders.orderLoaderMap.load(parent.id); 
      } 
    }
};

// 3. Create server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  includeStacktraceInErrorResponses: false
});

// 4. Start server
startStandaloneServer(server, {
  context: async () => {
    return {
      userService: new UserService(),
      orderService: new OrderService(),
      loaders: {
        orderLoader,
        orderLoaderMap
      }
    };
  }
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
