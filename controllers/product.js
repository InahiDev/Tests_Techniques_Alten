const { Product } = require('../sequelize')
const { analyzeBodyFields, validateIdField, creationFields, modificationFields, validateCreationRequest, validateModificationRequest } = require('../utils/bodyFieldsAnalysis')
const { productsRequest } = require('../utils/regex')
const { response } = require('../utils/response')
const fs = require('fs')

exports.getProducts = (req, res) => {
  console.log("Endpoint GET sur '/products' non implémenté encore.")
}

exports.getProductById = (req, res) => {
  console.log("Endpoint GET sur '/products/:id' non implémenté encore.")
}

exports.createProduct = (req, res) => {
  //La première vérification exclue l'ajout de champ non-autorisés.
  if (analyzeBodyFields(req, productsRequest)) {
    //La seconde vérification porte sur la présence de tous les champs obligatoires.
    if (creationFields(req.body)) {
      //La dernière vérification porte sur le contenu des champs et leur conformité à ce qui est attendu.
      if (validateCreationRequest(req.body)) {
        Product.findOne({ where: { code: req.body.code }})
          .then((product) => {
            if (product) {
              response(res, 400, "Un produit existe déjà avec ce code précis, vous ne pouvez pas enregistrer deux fois le même produit, veuillez modifier le produit pré-existant à la place, merci.")
            } else {
              const product = new Product({
                ...req.body
              })
              product.save()
                .then((product) => response(res, 201, "Nouveau produit enregistré.", product))
                .catch((error) => response(res, 500, `Une erreur est survenue durant la création du nouveau produit: ${error}`))
            }
          })
          .catch((error) => response(res, 500, `Une erreur est survenue lors de la recherche d'un produit pré-existant avec le même code, avant la création.`))
      } else {
        response(res, 400, "Certaines valeurs des champs: code / price / quantity / inventoryStatus / category, ne sont pas autorisées.")
      }
    } else {
      response(res, 400, "Un ou plusieurs champs obligatoires sont absents de la requête.")
    }
  } else {
    response(res, 400, "Un ou plusieurs champs sont incorrects dans cette requête.")
  }
  console.log("Endpoint POST sur '/products' non implémenté encore.")
}

exports.modifyProduct = (req, res) => {
  //!!!Attention, La validation du champ ID fonctionne-t-elle correctement si le champ est rempli avec des caractères alphabétiques? condition: (value<1000)
  if (validateIdField(req.params.id)) {
    if (analyzeBodyFields(req, productsRequest)) {
      if (modificationFields(req.body)) {
        if (validateModificationRequest(req.body)) {
          Product.findOne({ where: { id}})
        } else {
          response(res, 400, "Certains champs comprennent des valeurs non-autorisées.")
        }
      } else {
        response(res, 400, "Aucun champ nécessaire à la modification d'un produit n'est présent dans la requête.")
      }
    } else {
      response(res, 400, "Certains champs de la requête ne sont pas autorisés.")
    }
  }
  
  console.log("Endpoint PATCH sur '/products/:id' non implémenté encore.")
}

exports.removeProduct = (req, res) => {
  console.log("Endpoint DELETE sur '/products/:id' non implémenté encore.")
}