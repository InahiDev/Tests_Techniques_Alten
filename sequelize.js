const Sequelize = require('sequelize')
const mysql = require('mysql2')
const ProductModel = require('./models/Product')
const UserModel = require('./models/User')

const USERNAME = process.env.DB_USERNAME
const PWD = process.env.DB_PWD
const PORT = process.env.DB_PORT
const DIALECT = process.env.DB_DIALECT

async function initializeDataBase() {
//Création de la Base de Données si elle n'existe pas encore
  const connection = mysql.createConnection({ host: 'localhost', port: PORT, user: USERNAME, password: PWD })
  connection.query(`CREATE DATABASE IF NOT EXISTS ALTEN_TESTS`)
}

initializeDataBase()

const sequelize = new Sequelize('alten_tests', USERNAME, PWD, { port: PORT, dialect: DIALECT })

const Product = ProductModel(sequelize, Sequelize)
const User = UserModel(sequelize, Sequelize)

sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données réussie.'))
  .catch((error) => console.log(`Connexion à la base de données échouée: ${error}`))

sequelize.sync()
  .then(() => console.log('Tables synchronisées et créées ou mises à jour avec les Modèles.'))
  .catch((error) => console.log(`Mise à jour ou création des Tables échouée: ${error}`))

module.exports = { Product, User }