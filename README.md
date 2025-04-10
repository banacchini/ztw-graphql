# GraphQL API with REST Integration

This project is a GraphQL API server built using `graphql-yoga` and `@graphql-tools/schema`. It integrates with a REST API (`https://jsonplaceholder.typicode.com`) to fetch data for users and todos.

## Features

- **GraphQL API**: Provides a GraphQL interface for querying users and todos.
- **REST Integration**: Fetches data from the JSONPlaceholder REST API.
- **Resolvers**: Implements resolvers for `Query`, `User`, and `ToDoItem` types.
- **Dynamic Data Fetching**: Fetches users and todos dynamically from the REST API.

## Requirements

- Node.js (>= 10)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
2. Install dependencies:
   ```bash
   npm install

## Usage

1. Start the server:
   ```bash
   npm start
2. Open your browser and navigate to:
  http://localhost:4000
3. Use the GraphQL Playground to run queries and mutations.
