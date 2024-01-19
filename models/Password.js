const pwdValidator = require('password-validator')

const pwdSchema = new pwdValidator()

pwdSchema
.is().min(8, "Votre mot de passe doit contenir au minimum 8 caractères.")
.is().max(32, "votre mot de passe ne peut excéder 32 caractères.")
.has().uppercase(1, "Votre mot de passe doit contenir au minimum 1 majuscule.")
.has().lowercase(1, "Votre mot de pass doit contenir au minimum 1 minuscule.")
.has().digits(1, "Votre mot de passe doit contenir au minimum 1 chiffre")
.has().not().spaces(1, "Votre mot de passe ne peut contenir d'espace ou caractères assimilés (Retour à la ligne...).")
.has().not().symbols(1, "Votre mot de passe ne peut contenir de symboles ($, *, ...)")

module.exports = pwdSchema