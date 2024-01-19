const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
const { User } = require('../sequelize')
const TOKEN_KEY = process.env.TOKEN_KEY
const { usersRequest } = require('../utils/regex')
const { analyzeBodyFields } = require('../utils/bodyFieldsAnalysis')
const { response } = require('../utils/response')

exports.createAccount = (req, res) => {
  const propertyArray = Object.keys(req.body)
  if (analyzeBodyFields(propertyArray, usersRequest)) { //  Seuls les champs attendus sont incorporés à la requête.
    if (propertyArray.includes('email') && propertyArray.includes('password')) {  //Les champs sont présents.
      if (req.body.email && req.body.password) { // Les champs sont remplis.
        if (validator.isEmail(req.body.email)) {  //  Seule la valeur de email est vérifiée (la valeur de password est traitée par le middleware contenu dans passwordValidator).
          //  Vérification de l'unicité de l'email dans la base de données.
          User.findOne({ where: { email: req.body.email }})
            .then((user) => {
              if (user) {
                response(res, 400, `L'email ${req.body.email} a déjà été utilisé pour un compte, veuillez vous connecter à la place.`)
              } else {
                //  Le stockage des mot de passe ne doit jamais être fait en clair.
                //  Bcrypt permettra de le stocker crypté, et nous permettra de comparer les hash lors du login.
                bcrypt.hash(req.body.password, 10)
                  .then((hash) => {
                    const user = new User({
                      email: req.body.email,
                      password: hash,
                      role: 'public'  //  Attribution automatique de permissions basiques lors de la création d'un compte.
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
    } else {
      response(res, 400, "Certains champs obligatoires sont absents de la requête.")
    } 
  } else {
    response(res, 400, "Certains champs de la requête ne sont pas acceptés.")
  }
}

exports.loginUser = (req, res) => { //  On applique les mêmes vérifications pour les mêmes champs obligatoires que lors de la création d'un compte.
  const propertyArray = Object.keys(req.body)
  if (analyzeBodyFields(propertyArray, usersRequest)) {
    if (propertyArray.includes('email') && propertyArray.includes('password')) {
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
                        token: jwt.sign({
                          id: user.id,        //  C'est à ce niveau-là que la transmission du rôle de façon sécurisée est mis en place.
                          role: user.role,    //  A l'intérieur du token, on inclus le role.
                          email: user.email   //  Ce token décrypté nous permettra de ressortir le rôle d'admin et d'accéder aux endpoints qui le nécessitent.
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
        } else {
          response(res, 400, `L'email ${req.body.email} n'est pas valide, la requête ne peut aboutir`)
        }
      } else {
        response(res, 400, "Des information nécessaires à la connexion sont manquantes dans la requête.")
      }
    } else {
      response(res, 400, "Certains champs nécessaires au login sont absents de la requête")
    }
  } else {
    response(res, 400, "Certains champs de la requête ne sont pas acceptés")
  }


  
}