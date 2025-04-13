const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Construct an absolute path for the database file
const databasePath = path.resolve(__dirname, '../data/database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databasePath, // Use the absolute path
});

// Define User model
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    login: { type: DataTypes.STRING, allowNull: false },
});

// Define ToDoItem model
const ToDoItem = sequelize.define('ToDoItem', {
    title: { type: DataTypes.STRING, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, allowNull: false },
});

// Define relationships
User.hasMany(ToDoItem, { foreignKey: 'userId' });
ToDoItem.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, ToDoItem };