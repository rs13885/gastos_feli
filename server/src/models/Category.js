const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.70,
        },
    });
};
