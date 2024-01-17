const express = require('express')
const router = express.Router()

const productCtrl = require('../controllers/product')
//Middleware d'authentification afin de vérifier le token reçu lors de l'identification.
//Le rôle est inséré dans le token et permets par la suite d'avoir accès à certaines opérations si il est suffisamment élevé.
//const auth = require('../middleware/authentification')
//Middleware d'enregistrement des images envoyées via une requête form-data. Il enregistre le fichier sur le disk dans le fichier image.
//Les informations concernant le fichier sont ensuite disponibles dans la propriété file de la requête (req.file)
//Les autres champs de la requête form-data sont regroupés dans une propriété body de la requête (req.body)
//const multer = require('../middleware/multer-config')

router.get('/', productCtrl.getProducts)
router.get('/:id', productCtrl.getProductById)
router.post('/', /*auth, multer,*/ productCtrl.createProduct)
router.patch('/:id', /*auth, multer,*/ productCtrl.modifyProduct)
router.delete('/:id', /*auth,*/ productCtrl.removeProduct)

module.exports = router
