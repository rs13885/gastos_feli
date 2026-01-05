const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Expense', {
        date: {
            type: DataTypes.DATEONLY, // Store as YYYY-MM-DD
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5, // Default 50%
        },
        proportional: {
            type: DataTypes.FLOAT,
            // We can calculate this on the fly or store it. 
            // Storing it allows for manual overrides if ever needed, but usually it's calculated.
            // Let's store it to match the spreadsheet logic closely and strictly.
            allowNull: false,
            defaultValue: 0,
        }
    });
};
