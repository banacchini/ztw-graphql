const { createYoga } = require('graphql-yoga');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { readFileSync } = require('fs');
const { parse } = require('graphql');
const { sequelize, User, ToDoItem } = require('./models');

// Load the schema from src/schema.graphql
const typeDefs = parse(readFileSync('./src/schema.graphql', 'utf-8'));

const resolvers = {
    Query: {
        users: async () => await User.findAll(),
        todos: async () => await ToDoItem.findAll(),
        todo: async (parent, { id }) => await ToDoItem.findByPk(id),
        user: async (parent, { id }) => await User.findByPk(id),
    },
    ToDoItem: {
        user: async (parent) => {
            if (!parent.userId) return null; // Handle null userId gracefully
            return await User.findByPk(parent.userId);
        },
    },
    User: {
        todos: async (parent) => await ToDoItem.findAll({ where: { userId: parent.id } }),
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

// Sync database and start the server
sequelize.sync().then(() => {
    server.listen(4000, () => {
        console.log('Server is running on http://localhost:4000');
    });
});