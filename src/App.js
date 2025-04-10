const { createYoga } = require('graphql-yoga');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const axios = require('axios');

// Define the schema and resolvers
const typeDefs = /* GraphQL */ `
    type Query {
        users: [User!]
        todos: [ToDoItem!]
        todo(id: ID!): ToDoItem
        user(id: ID!): User
    }

    type ToDoItem {
        id: ID!
        title: String!
        completed: Boolean!
        user: User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        login: String!
        todos: [ToDoItem!]!
    }
`;

const resolvers = {
    Query: {
        users: async() => await getRestUsersList(),
        todos: async() => getRestTodosList,
        todo: (parent, args, context, info) => todoById(parent, args, context, info),
        user: (parent, args, context, info) => userById(parent, args, context, info),
    },
    ToDoItem: {
        user: async(parent, args, context, info) => await userById(null, {id: parent.userId}, context, info),
    },
    User: {
        todos: async (parent, args, context, info) => {
            const todos = await getRestTodosList();
            return todos.filter(todo => todo.userId === parent.id);
        },
    },

};

// Create the executable schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

// Create the Yoga server
const yoga = createYoga({
    schema,
});

// Create an HTTP server and pass the Yoga instance
const server = createServer(yoga);

// Start the server
server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

async function todoById(parent, args, context, info) {
    try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${args.id}`);
        const { id, title, completed, userId } = response.data;
        return {
            id: id,
            title: title,
            completed: completed,
            userId: userId,
        };
    } catch (error) {
        console.error("Error fetching todo:", error);
        return null;
    }
}

async function userById(parent, args, context, info){
    try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${args.id}`);
        const {id, name, email, username} = response.data;
        return {
            id: id,
            name: name,
            email: email,
            login: username,
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null
    }
}

async function getRestUsersList(){
    try {
        const users = await axios.get("https://jsonplaceholder.typicode.com/users")
        console.log(users);
        return users.data.map(({ id, name, email, username }) => ({
            id: id,
            name: name,
            email: email,
            login: username,
        }))
    } catch (error) {
        throw error
        }
}

async function getRestTodosList() {
    try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/todos");
        return response.data.map(({ id, title, completed, userId }) => ({
            id: id,
            title: title,
            completed: completed,
            userId: userId,
        }));
    } catch (error) {
        console.error("Error fetching todos:", error);
        throw error;
    }
}