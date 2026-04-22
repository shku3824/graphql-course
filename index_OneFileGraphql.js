const { graphql, buildSchema } = require('graphql');
const UserService = require('./services/userService');

const createContext = () => {
  return {
      userService: new UserService(),
      requestID: Math.random().toString(36).substring(2, 15) // Generate a random request ID
  };
};

// 1. Define schema
const schema = buildSchema(`
  type Query {
    user(id: ID!): User
    users: [User]
  }

  type User {
    id: ID!
    name: String!
    age: Int
    salary: Float
    email: String
  }
`);

// 2. Define resolver
//const userService = new UserService();

const root = {
  user: ({ id }, context) => {
    console.log(context.requestID); // Log the request ID for debugging
    console.log(`Fetching user with ID: ${id}`); // Log the ID being fetched
    return context.userService.getUserById(id);
  }, 
  users: (_, context ) => {
    console.log(context.requestID); // Log the request ID for debugging
    console.log('Fetching all users'); // Log the operation
    return context.userService.getAllUsers();
  }
};

// 3. Execute query manually
const query = `
query{
user(id:"999"){
  name
  age
  salary
  email
} 
users{
  name
  }
}`;
//Explanation of below invocation: -  
// graphql() = GraphQL execution engine
//   = Takes schema + query + resolvers+ [context] as input
//   = Returns result (Promise)
graphql({
  schema,
  source: query,
  rootValue: root,
  contextValue: createContext()
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});
