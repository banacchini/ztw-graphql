const axios = require('axios');
const { sequelize, User, ToDoItem } = require('./models');

async function fetchAndSeed() {
    try {
        // Fetch data from the REST API
        const usersResponse = await axios.get('https://jsonplaceholder.typicode.com/users');
        const todosResponse = await axios.get('https://jsonplaceholder.typicode.com/todos');

        const users = usersResponse.data;
        const todos = todosResponse.data;

        // Sync the database (optional: use { force: true } to reset)
        await sequelize.sync({ force: true });

        // Insert users into the database
        const createdUsers = await User.bulkCreate(users.map(user => ({
            id: user.id, // Ensure the ID matches the API's user ID
            name: user.name,
            email: user.email,
            login: user.username || user.email.split('@')[0], // Use 'username' or generate a login
        })));

        // Insert todos into the database
        await ToDoItem.bulkCreate(todos.map(todo => ({
            title: todo.title,
            completed: todo.completed,
            userId: todo.userId, // Directly use the userId from the API
        })));

        console.log('Database successfully populated from the REST API!');
    } catch (error) {
        console.error('Error fetching or seeding data:', error);
    } finally {
        process.exit();
    }
}

fetchAndSeed();