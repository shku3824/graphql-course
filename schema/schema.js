// 1. Schema (same as before)
const typeDefs = `
  type Query {
    user(id: ID!): User
    users: [User]
    usersPaginated(limit: Int!, offset: Int!): UserPage
    
    usersPaginatedV2(
    limit: Int!, 
    offset: Int!,
    filter: UserFilterInput,
    sort: UserSortInput
    ): UserPage
  }

  input UserFilterInput {
    name: String
    minAge: Int
    maxAge: Int
  }

  input UserSortInput {
    field: UserSortField!
    order: SortOrder!
  }

  enum UserSortField {
    NAME
    AGE
    EMAIL
  }
    
  enum SortOrder {
    ASC
    DESC
  }

  type UserPage {
    data: [User]
    totalCount: Int
  }

  type User {
      id: ID
      name: String
      age: Int
      email: String
      orders: [Order]
    }

  type Order {
      id: ID
      total: Float
  }

  type Mutation {
      createUser(input: CreateUserInput): User
    }

  input CreateUserInput {
      name: String!
      age: Int!
      email: String
    }
    
  type Mutation {
      updateUser(id: ID!, input: UpdateUserInput): User
    }

  input UpdateUserInput {
      name: String
      age: Int
      email: String
    }

  type Mutation {
      deleteUser(id: ID!): Boolean
  }

  type Mutation {
      deleteUserWithResponse(id: ID!): DeleteUserResponse
  }

  type DeleteUserResponse {
      success: Boolean!
      message: String
      code: String
  }
  `;

exports.typeDefs = typeDefs;