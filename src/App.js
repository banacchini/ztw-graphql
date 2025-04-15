const { createYoga } = require('graphql-yoga');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { readFileSync } = require('fs');
const { parse } = require('graphql');
const { GraphQLError } = require('graphql');
const { sequelize, User, ToDoItem } = require('./models');

// Load the schema from src/schema.graphql
const typeDefs = parse(readFileSync('./src/schema.graphql', 'utf-8'));

const resolvers = {
    Query: {
        users: async () => await User.findAll(),
        paginatedUsers: async (_, { limit, offset }) => {
            return await User.findAll({ limit, offset });
        },
        todos: async () => await ToDoItem.findAll(),
        paginatedToodos: async (_, { limit, offset }) => {
            return await ToDoItem.findAll({ limit, offset });
        }
        todo: async (parent, { id }) => await ToDoItem.findByPk(id),
        user: async (parent, { id }) => await User.findByPk(id),
    },

    Mutation: {
        createUser: async (_, { name, email, login }) => {
            return await User.create({ name, email, login });
        },
        updateUser: async (_, { id, ...updates }) => {
            const user = await User.findByPk(id);
            if (!user)
              throw new GraphQLError('User not found', {
                extensions: { code: 'NOT_FOUND' },
              });
            await user.update(updates);
            return user;
          },
        deleteUser: async (_, { id }) => {
            const user = await User.findByPk(id);
            if (!user) return false;
            await user.destroy();
            return true;
        },
    
        createToDo: async (_, { title, completed, userId }) => {
            const user = await User.findByPk(userId);
            if (!user)
              throw new GraphQLError('User not found', {
                extensions: { code: 'INVALID_INPUT' },
              });
            return await ToDoItem.create({ title, completed, userId });
        },
        updateToDo: async (_, { id, ...updates }) => {
            const todo = await ToDoItem.findByPk(id);
            if (!todo)
              throw new GraphQLError('ToDo not found', {
                extensions: { code: 'NOT_FOUND' },
              });
            await todo.update(updates);
            return todo;
        },
        deleteToDo: async (_, { id }) => {
            const todo = await ToDoItem.findByPk(id);
            if (!todo) return false;
            await todo.destroy();
            return true;
        },
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