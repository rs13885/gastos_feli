const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const roundToTwo = (num) => Math.round(num * 100) / 100;

module.exports = (Expense) => {

    // Get all expenses (optional filtering by month/year)
    router.get('/', async (req, res) => {
        try {
            const { month, year } = req.query; // Expects month (1-12) and year (e.g., 2024)

            let where = {};
            if (month && year) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0); // Last day of the month

                // Format for SQLite/Sequelize DATEONLY comparison can be tricky, 
                // but checking string range usually works for YYYY-MM-DD
                const startStr = startDate.toISOString().split('T')[0];
                const endStr = endDate.toISOString().split('T')[0];

                where.date = {
                    [Op.between]: [startStr, endStr]
                };
            }

            const expenses = await Expense.findAll({
                where,
                order: [['date', 'ASC'], ['category', 'ASC']]
            });
            res.json(expenses);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Add a new expense
    router.post('/', async (req, res) => {
        try {
            const { date, category, item, amount, percentage } = req.body;

            // Round amount to 2 decimal places
            const roundedAmount = roundToTwo(amount);

            // Calculate proportional and round to 2 decimal places
            const rawProportional = roundedAmount * percentage;
            const proportional = roundToTwo(rawProportional);

            const newExpense = await Expense.create({
                date,
                category,
                item,
                amount: roundedAmount,
                percentage,
                proportional
            });

            res.json(newExpense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating expense' });
        }
    });

    // Copy expenses from one month to another
    router.post('/copy', async (req, res) => {
        try {
            const { sourceMonth, sourceYear, targetMonth, targetYear } = req.body;

            if (!sourceMonth || !sourceYear || !targetMonth || !targetYear) {
                return res.status(400).json({ error: 'Missing source or target date parameters' });
            }

            // Find source expenses
            const startDate = new Date(sourceYear, sourceMonth - 1, 1);
            const endDate = new Date(sourceYear, sourceMonth, 0);
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            const sourceExpenses = await Expense.findAll({
                where: {
                    date: {
                        [Op.between]: [startStr, endStr]
                    }
                }
            });

            if (sourceExpenses.length === 0) {
                return res.json({ message: 'No expenses found to copy', count: 0 });
            }

            // Create new expenses for target month
            // We'll set the date to the 1st of the target month by default
            // Adjust formatting to YYYY-MM-DD
            // Actually, let's just construct the date string manually to be safe 'YYYY-MM-01'
            const targetDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;

            const newExpensesData = sourceExpenses.map(exp => {
                // Ensure rounded values on copy too, just in case
                const roundedAmount = roundToTwo(exp.amount);
                const rawProportional = roundedAmount * exp.percentage;
                const roundedProportional = roundToTwo(rawProportional);

                return {
                    date: targetDateStr,
                    category: exp.category,
                    item: exp.item,
                    amount: roundedAmount,
                    percentage: exp.percentage,
                    proportional: roundedProportional
                };
            });

            const createdExpenses = await Expense.bulkCreate(newExpensesData);

            res.json({ message: 'Expenses copied successfully', count: createdExpenses.length });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error copying expenses' });
        }
    });

    // Clear all expenses for a specific month
    router.delete('/month', async (req, res) => {
        try {
            const { month, year } = req.query;
            if (!month || !year) return res.status(400).json({ error: 'Missing month/year' });

            const m = parseInt(month, 10);
            const y = parseInt(year, 10);

            const startDateStr = `${y}-${String(m).padStart(2, '0')}-01`;
            const lastDay = new Date(y, m, 0).getDate();
            const endDateStr = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

            console.log(`Clearing month ${month}/${year}. Range: ${startDateStr} to ${endDateStr}`);

            const deleted = await Expense.destroy({
                where: {
                    date: {
                        [Op.between]: [startDateStr, endDateStr]
                    }
                }
            });

            console.log(`Deleted ${deleted} records.`);

            res.json({ message: 'Month cleared', count: deleted });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error clearing month' });
        }
    });

    // Update an expense
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { date, category, item, amount, percentage } = req.body;

            const expense = await Expense.findByPk(id);
            if (!expense) return res.status(404).json({ error: 'Expense not found' });

            // Prepare update values
            let updateValues = { date, category, item };

            // Handle amount and percentage changes for proportional calculation
            const currentAmount = amount !== undefined ? roundToTwo(amount) : expense.amount;
            const currentPercentage = percentage !== undefined ? percentage : expense.percentage;

            if (amount !== undefined) updateValues.amount = currentAmount;
            if (percentage !== undefined) updateValues.percentage = currentPercentage;

            // Recalculate proportional if either amount or percentage changes
            if (amount !== undefined || percentage !== undefined) {
                const rawProportional = currentAmount * currentPercentage;
                updateValues.proportional = roundToTwo(rawProportional);
            }

            await expense.update(updateValues);

            res.json(expense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating expense' });
        }
    });

    // Delete an expense
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await Expense.destroy({ where: { id } });
            res.json({ message: 'Expense deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting expense' });
        }
    });

    return router;
};
