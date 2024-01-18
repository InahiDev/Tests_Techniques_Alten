const express = require('express')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

//Importation des routers
const productRoutes = require('./routes/product')
const userRoutes = require('./routes/user')

const app = express()

const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: true
})

//Formatage des requêtes entrante sous format json. Si parsing impossible, le serveur ne s'arrête pas et renvoie une erreur.
app.use(express.json())

//Récupération et stockage des images potentielles dans le dossier image.
//Le traitement de celles-ci, et leur potentielle destruction (si erreur) se fait ultérieurement.
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(cors())
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginRessourcePolicy: false
}))

//Utilisation du limiter (réglé auparavant) afin de limiter le nombre de requêtes effectuées depuis la même origine afin de se prémunir des attaques par force brute
app.use(limiter)

app.use('/api/v1/products', productRoutes)
app.use('/api/v1/user', userRoutes)

module.exports = app