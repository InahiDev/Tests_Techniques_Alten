const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
const { User } = require('../sequelize')
const TOKEN_KEY = process.env.TOKEN_KEY
const { response } = require('../utils/response')

exports.createAccount = (req, res) => {
  console.log(req.body.email)
  if (req.body.email && req.body.password) {
    if (validator.isEmail(req.body.email)) {
      //vérification de l'unicité de l'email dans la base de données.

      User.findOne({ where: { email: req.body.email }})
        .then((user) => {
          if (user) {
            response(res, 400, `L'email ${req.body.email} a déjà été utilisé pour un compte, veuillez vous connecter à la place.`)
          } else {
            //Le stockage des mot de passe ne doit jamais être fait en clair. On utilise donc bcrypt qui permettra de le stocker crypté, et nous permettra de comparer les hash lors du login.
            bcrypt.hash(req.body.password, 10)
              .then((hash) => {
                const user = new User({
                  email: req.body.email,
                  password: hash,
                  role: 'public'
                })
                user.save()
                  .then((savedUser) => {
                    const sharedUser = {
                      id: savedUser.id,
                      role: savedUser.role,
                      email: savedUser.email
                    }
                    response(res, 201, "Utilisateur créé", sharedUser)
                  })
                  .catch((error) => response(res, 500, `L'enregistrement de votre compte a échoué: ${error}`))
              })
              .catch((error) => response(res, 500, `La sécurisation de votre mot de passe a rencontré une erreur: ${error}`))
          }
        })
        .catch((error) => response(res, 500, `Une erreur serveur est survenue durant la recherche d'un compte déjà rattaché à l'email fourni: ${error}`))
    } else {
      response(res, 400, `L'email ${req.body.email} n'est pas valide. La requête ne peut aboutir.`)
    }
  } else {
    response(res, 400, "Des informations nécessaires à la création de compte sont manquantes dnas la requête")
  }
}

exports.loginUser = (req, res) => {
  if (req.body.email && req.body.password) {
    if (validator.isEmail(req.body.email)) {
      User.findOne({ where: { email: req.body.email }})
        .then((user) => {
          if (user) {
            bcrypt.compare(req.body.password, user.password)
              .then((valid) => {
                if (valid) {
                  response(res, 200, "Vous êtes connectés.", {
                    role: user.role,
                    email: user.email,
                    id: user.id,
                    //
                    token: jwt.sign({
                      id: user.id,
                      role: user.role,
                      email: user.email
                    },
                      TOKEN_KEY,
                    { expiresIn: '3h' })
                  })
                } else {
                  response(res, 400, "Mot de pass erroné")
                }
              })
              .catch((error) => response(res, 500, `La vérification de votre mot de pass a rencontré une erreur: ${error}`))
          } else {
            response(res, 404, "Aucun compte n'a été associé à cet email.")
          }
        })
        .catch((error) => response(res, 500, `La recherche de votre compte a échouée: ${error}`))
    }
  } else {
    response(res, 400, "Des information nécessaires à la connexion sont manquantes dans la requête.")
  }
}