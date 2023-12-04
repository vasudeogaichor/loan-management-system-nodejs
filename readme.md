# <Your Project Name>

## Introduction
This is a Node.js project for a Credit Approval System that utilizes Sequelize as the ORM (Object-Relational Mapping) for database operations. Follow the instructions below to set up and run the project.

## Prerequisites
- Node.js: Make sure you have Node.js installed. You can download it [here](https://nodejs.org/).
- npm: npm is the package manager for Node.js. It comes bundled with Node.js.

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/vasudeogaichor/loan-management-system-nodejs.git
    cd loan-management-system-nodejs
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Install Sequelize CLI globally:
    ```bash
    npm install -g sequelize-cli
    ```
4. Start the database using docker:
    ```
    docker-compose up
    ```

## Database Migration
1. After database starts successfully, run the initial migration to create tables:
    ```bash
    sequelize db:migrate
    ```

## Run the Application
```bash
npm run dev
   ```
