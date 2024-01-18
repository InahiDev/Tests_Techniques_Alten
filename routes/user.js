const express = require('express')
const router = express.Router()
const authCtrl = require('../controllers/user')
const auth = require('../middleware/authentification')
const pwdValidator = require('../middleware/passwordValidator')

router.post('/signup', pwdValidator, authCtrl.createAccount)
router.post('/login', authCtrl.loginUser)

module.exports = router