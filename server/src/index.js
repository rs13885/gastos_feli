const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, '../../expenses.db');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

const Expense = require('./models/Expense')(sequelize);
const Category = require('./models/Category')(sequelize);

const DEFAULT_CATEGORIES = [
    { name: 'Vivienda', percentage: 0.25 },
    { name: 'Salud', percentage: 0.70 },
    { name: 'Educación', percentage: 0.70 },
    { name: 'Alimentos', percentage: 0.25 },
    { name: 'Otros', percentage: 0.70 },
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        const count = await Category.count();
        if (count === 0) {
            await Category.bulkCreate(DEFAULT_CATEGORIES);
            console.log('Default categories seeded.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const expensesRoutes = require('./routes/expenses')(Expense);
const categoriesRoutes = require('./routes/categories')(Category);

app.use('/expenses', expensesRoutes);
app.use('/categories', categoriesRoutes);

app.get('/', (req, res) => {
    res.send('Shared Expenses API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
