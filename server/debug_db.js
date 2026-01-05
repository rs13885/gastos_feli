const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../expenses.db');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

const Expense = require('./src/models/Expense')(sequelize);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const expenses = await Expense.findAll();
        console.log('Total expenses:', expenses.length);
        expenses.forEach(e => {
            console.log(`ID: ${e.id}, Date: "${e.date}" (Type: ${typeof e.date})`);
        });
    } catch (e) {
        console.error(e);
    }
})();
