const Password = require('../models/Password')
const { response } = require('../utils/response')

module.exports = (req, res, next) => {
  if (req.body.password) {
    if (!Password.validate(req.body.password)) {
      const validator = Password.validate(req.body.password, { details: true })
      let validatorMessage = validator[0].message
      for (let detail of validator) {
        if (validator.indexOf(detail) > 0) {
          validatorMessage = detail.message + ' ' + validatorMessage
        }
      }
      response(res, 400, `${validatorMessage}`)
    } else {
      next()
    }
  } else {
    response(res, 400, 'Veuillez remplir le champ "mot de passe".')
  }
}