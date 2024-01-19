const { Product } = require('../sequelize')
const { analyzeBodyFields, validateIdField, creationFields, modificationFields, validateCreationRequest, validateModificationRequest, formatNumericField } = require('../utils/bodyFieldsAnalysis')
const { productsRequest, price, savedImage } = require('../utils/regex')
const { oldImageDelete, newImageDelete } = require('../utils/fsDelete')
const { response } = require('../utils/response')
const fs = require('fs')

/*
Les deux endpoints GET sont ici destinés à tous les utilisateurs de l'application. Ils n'ont donc pas à être protégés.
Aucun privilège n'est nécessaire pour pouvoir retirer les ressources.
L'ont pourrait conditionner les informations renvoyées (comme le nombre de produit disponible ou d'autres informations sensibles) en fonction du rôle possédé par le requérant.
Dans ce cas-là il sera nécessaire d'insérer le middleware d'authentification avant l'endpoint au niveau du router,
Et dans les deux prochains middlewares, il sera alors possible d'exclure du retour de la base de données les données sensibles renvoyées lorsque le niveau du rôle n'est pas suffisant.
On peut effectuer cela de cette manière par exemple:

  if (req.user.role === "Admin") {
    //Cas où l'utilisateur est un administrateur
    Pas de limitation des informations renvoyées
  } else {
    Product.findAll({
      attributes: {
        exclude: ['quantity', 'otherSensitiveInformation']
      }
    })
  }

*/

exports.getProducts = (req, res) => {
  Product.findAll({ order: [['id', 'ASC']]})
    .then((products) => {
      if (products.length === 0) {
        response(res, 404, "Il n'y a aucun produits en base de donnée. Commencez par en créer un.")
      } else {
        response(res, 200, "Voici la liste complète de tous les produits:", products)
      }
    })
    .catch((error) => response(res, 500, `Une erreur est survenue durant la recherche de tous les produits en Base de Données: ${error}`))
}

/*
Si la base de données grandit, il sera alors peut-être pertinent d'insérer une limitation au nombre d'entrées retournées par Product.findAll()
Il faudra alors modifier en conséquence la logique métier avec un offset transmis viia les query de la requête,
On pourra alors normer cet offset afin qu'il s'incrémente de 10 en 10 par exemple afin de suivre une limite initialisée à 10.
L'utilisateur effectuera alors plusieurs requêtes afin de parcourir la base de données qui lui sera renvoyée petit à petit:

  //Fonction permettant de normer l'offset
  function normalizeOffset(req, limit) {
    let offset = 0
    if (req.query.offset && parseInt(req.query.offset) > limit) {
      offset = Math.floor(parseInt(req.query.offset) / limit) * limit
    }
    return offset
  }

  function getProductsLimited(req, res, offset = 0, limit = 10) {
    Product.findAll({ offset: offset, limit: limit })
      .then((products) => {
        if (products.length === 0) {
          if (offset === 0) {
            response(res, 404, "Il n'y a aucun produit en base de données")
          } else {
            getProducts(req, res, offset - limit, limit)
          }
        } else {
          response(res, 200, "Voilà les produits demandés", products)
        }
      })
  }

  exports.getProducts = (req, res) => {
    const limit = 10
    const offset = normalizeOffset(req, limit)
    getProductsLimited(req, res, offset, limit)
  }

Dans le cas où la recherche calibrée avec un offset normé trop important ne retournerait pas de produits,
Elle s'appelle elle-même en réduisant l'offset normé d'une tranche (articulées autour de la valeur de la limite) et ainsi de suite jusqu'à obtenir un ou plusieurs résultats.
*/


exports.getProductById = (req, res) => {
  if (validateIdField(req.params.id)) {
    const id = parseInt(req.params.id)
    Product.findByPk(id)
      .then((product) => {
        if (product) {
          response(res, 200, "Voici le produit que vous demandez", product)
        } else {
          response(res, 404, `Le produit que vous recherchez n'existe pas. L'id n°${id} ne permet pas de trouver de produit correspondant.`)
        }
      })
      .catch((error) => response(res, 500, `La recherche par Id n'a pas pu aboutir: ${error}`))
  } else {
    response(res, 400, `"${req.params.id}" n'est pas un id correct. Nous ne pouvons rechercher un produit à partir de cet id.`)
  }
}

/*
Bien que cela n'ait pas été demandé dans le README du dossier auquel j'ai eu accès, dans le mail envoyé par Mme Soula, il était question d'un rôle administrateur.
J'ai donc considéré qu'il était demandé et ai inclus des conditions d'accès basées sur l'identification à l'API.
De plus, j'ai ajouté le traitement d'images (ici, des images de poids légers afin de tester).
Chaque erreur renvoyée par les endpoints concernés par l'enregistrement d'image (create & modify) est précédé de la destruction de l'image.
Cela permet de ne pas surcharger le côté serveur avec des fichiers qui ne seront liés à aucun produit de la base de données.
L'enregistrement et la destruction du fichier image en cas d'erreur étant très rapide,
j'ai ajouté un console.log en callback de la fonction fs.unlink afin de garder une trace du travail de l'API.
*/  

exports.createProduct = (req, res) => {
  if (req.user.role === "admin") {
    const propertyArray = Object.keys(req.body)
    //La première vérification exclue l'ajout de champ non-autorisés.
    if (analyzeBodyFields(propertyArray, productsRequest)) {
      //La seconde vérification porte sur la présence de tous les champs obligatoires.
      if (creationFields(propertyArray)) {
        //La dernière vérification porte sur le contenu des champs et leur conformité à ce qui est attendu.
        if (validateCreationRequest(req.body, propertyArray)) {
          //Un code produit devrait être unique, j'ajoute donc une vérification de son unicité avant d'enregistrer le produit.
          Product.findOne({ where: { code: req.body.code }})
            .then((product) => {
              //Si j'ai un retour positif pour la recherche dans la base de données avec le code produit fourni.
              if (product) {  //  Le code produit est déjà attribué, la création n'aura pas lieu il faut donc détruire l'image importée.
                newImageDelete(req)
                response(res, 400, "Un produit existe déjà avec ce code précis, vous ne pouvez pas enregistrer deux fois le même produit, veuillez modifier le produit pré-existant à la place, merci.")
              } else {
                //Création d'une variable de transition afin de traiter la propriété optionnelle "rating"
                let parsedRating = 0
                let image = ''
                if (req.body.rating) {
                  parsedRating = parseInt(req.body.rating)
                }
                //Je donne la priorité à l'image stockée par rapport au lien indiqué dans le body en Texte. Les images stockées pèsent sur le serveur.
                //De plus, leur chemin d'accès est nécessaire si il faut les supprimer.
                if (req.file) {
                  image = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } else if (propertyArray.includes('image')) { //Le chemin d'accès est utilisé seulement si aucun fichier n'est joint à la requête.
                  image = req.body.image
                }
                //Les propriétés "price" et "quantity" ne nécessite pas de condition, car elles sont nécessairement présentes.
                const product = new Product({
                  ...req.body,
                  price: parseInt(req.body.price),
                  quantity: parseInt(req.body.quantity),
                  image: image,
                  rating: parsedRating
                })
                //Le code produit est unique, les champs STRING obligatoires ne sont pas vides, les valeurs numériques ont été mise sous format de nombre (vérifiées auparavant). Je peux modifier la BDD.
                product.save()
                  .then((product) => response(res, 201, "Nouveau produit enregistré.", product))
                  .catch((error) => {
                    newImageDelete(req)
                    response(res, 500, `Une erreur est survenue durant la création du nouveau produit: ${error}`)
                  })
              }
            })
            .catch((error) => {
              newImageDelete(req)
              response(res, 500, `Une erreur est survenue lors de la recherche d'un produit pré-existant avec le même code, avant la création: ${error}`)
            })
        } else {
          newImageDelete(req)
          response(res, 400, "Certaines valeurs des champs: code / name / price / quantity / inventoryStatus / category / rating, ne sont pas autorisées.")
        }
      } else {
        newImageDelete(req)
        response(res, 400, "Un ou plusieurs champs obligatoires sont absents de la requête.")
      }
    } else {
      newImageDelete(req)
      response(res, 400, "Un ou plusieurs champs sont incorrects dans cette requête.")
    }
  } else {
    newImageDelete(req)
    response(res, 401, "Vous n'avez pas les privilèges nécessaires pour créer des ressources.")
  }
}

exports.modifyProduct = (req, res) => {
  if (req.user.role === "admin") {
    //Cette vérification permet d'obtenir un ID correct sous forme de nombre.
    if (validateIdField(req.params.id)) {
      const id = parseInt(req.params.id)
      const propertyArray = Object.keys(req.body)
      //Les 3 prochaines vérification sont du même type que pour la création: Vérifier la présence de champs indésirables, vérifier ensuite la présence de champs autorisés, puis vérifier le contenu des champs autorisés.
      if (analyzeBodyFields(propertyArray, productsRequest)) {
        if (modificationFields(propertyArray)) {
          if (validateModificationRequest(req.body)) {
            Product.findOne({ where: { id: id }})
              .then((product) => {
                if (product) {
                  //Les valeurs numériques du produit sont ici soit conservées grâce à celle conservée en base de donnée (lorsque aucune valeur n'est transmise), soit formatée en (typeof number) lorsqu'une valeur est insérée dans la requête.
                  const price = formatNumericField(propertyArray, 'price', product.price, req.body.price)
                  const quantity = formatNumericField(propertyArray, 'quantity', product.quantity, req.body.quantity)
                  const rating = formatNumericField(propertyArray, 'rating', product.rating, req.body.rating)
                  const dataBaseImage = product.image
                  let newImage = dataBaseImage
                  if (req.file) { //Je donne la priorité encore une fois à l'image dont le fichier a été transmis car il est nécessaire de conserver son chemin d'accès à des fins de suppression potentielle.
                    newImage = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                  } else if (propertyArray.includes('image')) {
                    newImage = req.body.image
                  }
                  //Si une propriété code est envoyée dans la requête, il est nécessaire de la confronter aux code déjà présents en base de données.
                  if (propertyArray.includes('code')) {
                    Product.findOne({ where: { code: req.body.code }})
                      .then((codeProduct) => {
                        //Si un produit est trouvé, et si le produit trouvé à un id différent de celui auquel doit s'appliquer la màj :
                        //On essaye donc à ce moment-là de donner un code produit déjà attribué à un autre produit, à celui que l'on met à jour.
                        if (codeProduct && codeProduct.id !== product.id) {
                          newImageDelete(req)
                          response(res, 400, `Vous ne pouvez pas attribuer ${req.body.code} au produit ${req.body.name}. Ce code est déjà en cours d'utilisation pour le produit ${codeProduct.name}`)
                        } else {
                          // Tous les champs présents ont des valeurs qui ont été vérifiées et qui n'entreront pas en conflit. On peut procéder à la mise-à-jour de la base de données.
                          Product.update({
                            ...req.body,
                            price: price,
                            quantity: quantity,
                            rating: rating,
                            image: newImage
                          },{
                            where: { id: id }
                          })
                            .then(() => {
                              //Les 3 cas de suppression d'une ancienne image gérée par l'API (savedImage.test(dataBaseImage)):
                              // Une nouvelle image est transmise (req.file)
                              // Une image extérieure est transmise (req.body.image est truthy)
                              // Je souhaite la suppression de toutes les images (req.body.image existe et est falsy (transmission d'une String vide))
                              if (savedImage.test(dataBaseImage) && (req.file || propertyArray.includes('image'))) {
                                oldImageDelete(dataBaseImage)
                              }
                              response(res, 200, `Produit mis à jour avec le code produit ${req.body.code}`)
                            })
                            .catch((error) => {
                              newImageDelete(req)
                              response(res, 500, `Une erreur est survenue durant la mise-à-jour du produit avec ou sans changement de code: ${error}`)
                            })
                        }
                      })
                      .catch((error) => {
                        newImageDelete(req)
                        response(res, 500, `Une erreur est survenue durant la vérification d'un produit existant avec le même code-produit: ${error}`)
                      })
                  } else {  // Aucune propriété code n'a été transmise. Aucune vérification n'est nécessaire pour de potentiels conflits.
                    Product.update({
                      ...req.body,
                      price: price,
                      quantity: quantity,
                      rating: rating,
                      image: newImage
                    },{
                      where: { id: id }
                    })
                      .then(() => {
                        if (savedImage.test(dataBaseImage) && (req.file || propertyArray.includes('image'))) {
                          oldImageDelete(dataBaseImage)
                        }
                        response(res, 200, "Produit mis à jour.")
                      })
                      .catch((error) => {
                        newImageDelete(req)
                        response(res, 500, `Une erreur est survenue durant la mise-à-jour de la ressource: ${error}`)
                      })
                  }
                } else {
                  newImageDelete(req)
                  response(res, 404, `Aucun produit n'a été trouvé avec l'id: ${id}`)
                }
              })
              .catch((error) => {
                newImageDelete(req)
                response(res, 500, `Une erreur s'est produite lors de la recherche du produit à modifier: ${error}`)
              })
          } else {
            newImageDelete(req)
            response(res, 400, "Certains champs comprennent des valeurs non-autorisées.")
          }
        } else {
          newImageDelete(req)
          response(res, 400, "Aucun champ nécessaire à la modification d'un produit n'est présent dans la requête.")
        }
      } else {
        newImageDelete(req)
        response(res, 400, "Certains champs de la requête ne sont pas autorisés.")
      }
    } else {
      newImageDelete(req)
      response(res, 400, "Aucun produit ne correspond à cet ID.")
    }
  } else {
    newImageDelete(req)
    response(res, 401, "Vous n'avez pas les privilèges nécessaires pour effectuer une mise à jour des produits")
  }
}

exports.removeProduct = (req, res) => {
  if (req.user.role === "admin") {
    if (validateIdField(req.params.id)) {
      const id = parseInt(req.params.id)
      Product.findOne({ where: { id: id }})
        .then((product) => {
          if (product) {
            const dataBaseImage = product.image
            Product.destroy({ where: { id: id }})
              .then(() => {
                if (savedImage.test(dataBaseImage)) { //On n'oublie pas de supprimer l'image potentiellement stockée.
                  oldImageDelete(dataBaseImage)
                }
                response(res, 200, `Le produit avec l'id ${id} a été supprimé de la base de données.`)
              })
              .catch((error) => response(res, 500, `Une erreur est survenue durant la destruction du produit dont l'id est ${id}: ${error}`))
          } else {
            response(res, 404, `Il n'y a pas de produit correspondant à l'id: ${id}`)
          }
        })
        .catch((error) => response(res, 500, `Une erreur est survenue lors de la recherche du produit à supprimer: ${error}`))
    } else {
      response(res, 400, `L'id ${req.params.id} n'est pas un id correct.`)
    }
  } else {
    response(res, 401, "Vous n'avez pas les privilèges nécessaires pour supprimer un produit de la base de données.")
  }
}