const { DataTypes } = require('sequelize')

module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    email: {
      type: type.STRING,
      allowNull: false,
      unique: true,
      isEmail: true
    },
    password: {
      type: type.STRING,
      allowNull: false
    },
    role: {
      type: type.STRING,
      allowNull: false
    }
  })
}