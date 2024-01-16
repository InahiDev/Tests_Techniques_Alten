const express = require('express')
const router = express.Router()

const productCtrl = require('../controllers/product')
//const auth = require('../middleware/auth')
//const multer = require('../middleware/multer-config')

router.get('/', productCtrl.getProducts)
router.get('/:id', productCtrl.getProductById)
router.post('/', productCtrl.createProduct)
router.patch('/:id', productCtrl.modifyProduct)
router.delete('/:id', productCtrl.removeProduct)

module.exports = router
