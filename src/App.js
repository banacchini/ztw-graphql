const { createYoga } = require('graphql-yoga');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const axios = require('axios');

// Sample data
const usersList = [
    { id: 1, name: "Jan Konieczny", email: "jan.konieczny@wonet.pl", login: "jkonieczny" },
    { id: 2, name: "Anna Wesołowska", email: "anna.w@sad.gov.pl", login: "anna.wesolowska" },
    { id: 3, name: "Piotr Waleczny", email: "piotr.waleczny@gp.pl", login: "p.waleczny" }
];

const todosList = [
    { id: 1, title: "Naprawić samochód", completed: false, user_id: 3 },
    { id: 2, title: "Posprzątać garaż", completed: true, user_id: 3 },
    { id: 3, title: "Napisać e-mail", completed: false, user_id: 3 },
    { id: 4, title: "Odebrać buty", completed: false, user_id: 2 },
    { id: 5, title: "Wysłać paczkę", completed: true, user_id: 2 },
    { id: 6, title: "Zamówic kuriera", completed: false, user_id: 3 },
];

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
        todos: () => todosList,
        todo: (parent, args, context, info) => todoById(parent, args, context, info),
        user: (parent, args, context, info) => userById(parent, args, context, info),
    },
    ToDoItem: {
        user: (parent, args, context, info) => usersList.find(user => user.id === parent.user_id)
    },
    User: {
        todos: (parent, args, context, info) => todosList.filter(todo => todo.user_id === parent.id),
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

function todoById(parent, args, context, info){
    return todosList.find(t => t.id == args.id);
}
function userById(parent, args, context, info){
    return usersList.find(u => u.id == args.id);
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