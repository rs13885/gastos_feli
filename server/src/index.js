const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup (SQLite)
const dbPath = path.join(__dirname, '../../expenses.db');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

// Models
const Expense = require('./models/Expense')(sequelize);

// Test DB Connection and Sync
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true }); // Use alter to update schema if needed
        console.log('Database synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// Routes
const expensesRoutes = require('./routes/expenses')(Expense);
app.use('/expenses', expensesRoutes);

app.get('/', (req, res) => {
    res.send('Shared Expenses API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
