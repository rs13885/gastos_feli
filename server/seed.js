const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../expenses.db');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

const Expense = require('./src/models/Expense')(sequelize);

const DATA = [
    { category: 'Vivienda', item: 'Alquiler', amount: 329000, percentage: 0.25 },
    { category: 'Vivienda', item: 'Luz', amount: 32513.25, percentage: 0.25 },
    { category: 'Vivienda', item: 'Agua', amount: 9000, percentage: 0.25 },
    { category: 'Vivienda', item: 'ABL', amount: 18000, percentage: 0.25 },
    { category: 'Vivienda', item: 'Gas', amount: 42350, percentage: 0.25 },
    { category: 'Vivienda', item: 'Internet', amount: 24025, percentage: 0.25 },
    { category: 'Salud', item: 'OSDE', amount: 110695, percentage: 0.5 },
    { category: 'Otros', item: 'Niñera', amount: 420000, percentage: 0.25 },
    { category: 'Otros', item: 'Moratoria Aportes ANSES', amount: 64667, percentage: 0.25 },
    { category: 'Otros', item: 'Ingles', amount: 75000, percentage: -0.5 },
    { category: 'Otros', item: 'Baile', amount: 15000, percentage: 0.5 },
    { category: 'Otros', item: 'Dibujo', amount: 36000, percentage: 0.5 },
    { category: 'Otros', item: 'Gorro egreso', amount: 2500, percentage: 0.5 },
    { category: 'Otros', item: 'Llavero egreso', amount: 1000, percentage: 0.5 },
    { category: 'Otros', item: 'Regalo mamá coordinadora', amount: 4500, percentage: 0.5 },
    { category: 'Educación', item: 'Cuota Colegio', amount: 57900, percentage: 0.5 },
    { category: 'Educación', item: 'Matricula 2026', amount: 120000, percentage: 0.5 },
    { category: 'Educación', item: 'Cuota materiales', amount: 5000, percentage: 0.5 },
    { category: 'Alimentos', item: 'Supermercado', amount: 325800, percentage: 0.25 },
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Ensure table exists
        await sequelize.sync();

        // Clear existing for Jan 2026 to avoid duplicates if re-run
        const date = '2026-01-05'; // Month of Jan

        // Insert
        for (const item of DATA) {
            await Expense.create({
                date: date,
                category: item.category,
                item: item.item,
                amount: item.amount,
                percentage: item.percentage,
                proportional: item.amount * item.percentage
            });
        }

        console.log('Data seeded successfully.');
    } catch (e) {
        console.error(e);
    }
})();
