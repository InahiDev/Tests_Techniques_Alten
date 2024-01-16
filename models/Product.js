module.exports = (sequelize, type) => {
    return sequelize.define('product', {
        id: {
            type: type.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: type.STRING,
            allowNull: false
        },
        name: {
            type: type.STRING,
            allowNull: false
        },
        description: {
            type: type.STRING,
            allowNull: false
        },
        price: {
            type: type.INTEGER,
            allowNull: false
        },
        quantity: {
            type: type.INTEGER,
            allowNull: false
        },
        inventoryStatus: {
            type: type.STRING,
            allowNull: false
        },
        category: {
            type: type.STRING,
            allowNull: false
        },
        image: {
            type: type.STRING
        },
        rating: {
            type: type.INTEGER
        }
    })
}