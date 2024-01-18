const jwt = require('jsonwebtoken')
const { response } = require('../utils/response')
const TOKEN_KEY = process.env.TOKEN_KEY

module.exports = (req, res, next) => {
  try {
/*
Afin de correctement obtenir le rôle de l'utilisateur dans le token, il faut:
Lors de l'encapsulation du token, au login, après avoir vérifié l'email et le mot de passe de l'utilisateur,
dans la réponse de l'API, insérer la propriété:
token: jwt.sign({ role: user.role }).
C'est cette propriété-ci que l'on récupère ici, qui ne peut pas être modifiée, et qui est donc sécurisée.
*/
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, TOKEN_KEY)
    req.user = {
      role: decodedToken.role
    }
    next()
  } catch(error) {
    response(res, 401, "Action non autorisée. Cette action nécessite des privilèges plus élevés.")
  }
}