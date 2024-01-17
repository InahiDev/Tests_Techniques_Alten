const { Product } = require('../sequelize')
const { analyzeBodyFields, validateIdField, creationFields, modificationFields, validateCreationRequest, validateModificationRequest, formatNumericField } = require('../utils/bodyFieldsAnalysis')
const { productsRequest, price } = require('../utils/regex')
const { response } = require('../utils/response')
const fs = require('fs')

/*
Les deux endpoints GET sont ici destinés à tous les utilisateurs de l'application. Ils n'ont donc pas à être protégés.
Aucune vérification supplémentaire n'est nécessaire pour pouvoir retirer les ressources.
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
La création, la modification ou la suppression de données de la base de données devraient être en tout cas être protégées.
Leur déclenchement ne doit pas être permis à n'importe qui ayant accès à l'API.
Si le système d'authentificaiton devait être miis en place, cet endpoint, comme les endpoints de modification et de suppression, serait à minima protégé par la vérification du rôle.
Cela se traduirait en premier lieu par:

  if (req.user.role === "Admin") {
    Logique de modification de la base de données
  } else {
    response(res, 401, "Vous n'avez pas les privilègges suffisants pour modifier la base de données (ajout/modification/suppression d'entrées)")
  }

=> Si l'utilisateur est Admin. Récupération du rôle utilisateur inséré à l'intérieur du token jwt vérifié dans un middleware antérieur.
Ajout à la requête d'un objet user contenant une propriété rôle puis confrontation du rôle avec la condition suivante:

Demande extra: Pour l'enregistrement des fichiers images, je sépare l'endpoint de création (comme l'endpoint de modification) en deux cas:
L'un avec fichier: requête form-data traité par le middleware multer placé en amont dans le router.
Le middleware multer permet de vérifier la présence ou non de fichier en traitant uniquement les requêtes form-data.
Il ajoute à la requête une propriété file (req.file).
La vérification de l'existence de req.file permet de savoir qu'un fichier a été joint à la requête et à été traité par multer.
La propriété req.file nous permet d'accéder à des propriétés du fichier d'origine (.originalname, .mimetype, ...).
A partir de là:

  if (req.file) {
    Traitement du cas avec fichier
  } else {
    Traitement du cas sans fichier
  }

Les autres vérifications portant sur les champs partagés par les deux cas peuvent se faire après cette première vérification.

N.B.: Si la requête est mal formulée et finie par ne pas être enregistrée,
Il faut faire attention car le fichier image a lui déjà été enregistré par le middleware multer à l'adresse ci-dessous:

  pathToFile: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

Il faut donc supprimer le fichier pour ne pas être engorgé de fichiers inutiles et inutilisables car non reliés à des entrées de la Base De Données.
On peut utiliser une petite fonction comme cela afin de supprimer le fichier en cas de requête n'ayant pas abouti:
  
  function deletePictureLoaded(req) {
    const uploadedPicture = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    const filename = uploadedPicture.split('/images/')[1]
    fs.unlink(`images/${filename}`, () => console.log(`${filename} n'a pas été conservé car votre requête n'a pas abouti.`))
  }

*/  

exports.createProduct = (req, res) => {
  const propertyArray = Object.keys(req.body)
  //La première vérification exclue l'ajout de champ non-autorisés.
  if (analyzeBodyFields(propertyArray, productsRequest)) {
    //La seconde vérification porte sur la présence de tous les champs obligatoires.
    if (creationFields(propertyArray)) {
      //La dernière vérification porte sur le contenu des champs et leur conformité à ce qui est attendu.
      if (validateCreationRequest(req.body)) {
        //Un code produit devrait être unique, j'ajoute donc une vérification de son unicité avant d'enregistrer le produit.
        Product.findOne({ where: { code: req.body.code }})
          .then((product) => {
            //Si j'ai un retour positif pour la recherche dans la base de données avec le code produit fourni.
            if (product) {
              response(res, 400, "Un produit existe déjà avec ce code précis, vous ne pouvez pas enregistrer deux fois le même produit, veuillez modifier le produit pré-existant à la place, merci.")
            } else {
              //Création d'une variable de transition afin de traiter la propriété optionnelle "rating"
              let parsedRating = 0
              if (req.body.rating) {
                parsedRating = parseInt(req.body.rating)
              }
              //Les propriétés "price" et "quantity" ne nécessite pas de condition, car elles sont nécessairement présentes.
              const product = new Product({
                ...req.body,
                price: parseInt(req.body.price),
                quantity: parseInt(req.body.quantity),
                rating: parsedRating
              })
              //Le code produit est unique, les champs STRING obligatoires ne sont pas vides, les valeurs numériques ont été mise sous format de nombre (vérifiées auparavant). Je peux modifier la BDD.
              product.save()
                .then((product) => response(res, 201, "Nouveau produit enregistré.", product))
                .catch((error) => response(res, 500, `Une erreur est survenue durant la création du nouveau produit: ${error}`))
            }
          })
          .catch((error) => response(res, 500, `Une erreur est survenue lors de la recherche d'un produit pré-existant avec le même code, avant la création: ${error}`))
      } else {
        response(res, 400, "Certaines valeurs des champs: code / name / price / quantity / inventoryStatus / category / rating, ne sont pas autorisées.")
      }
    } else {
      response(res, 400, "Un ou plusieurs champs obligatoires sont absents de la requête.")
    }
  } else {
    response(res, 400, "Un ou plusieurs champs sont incorrects dans cette requête.")
  }
}

/*
Si l'on enregistrait des fichiers photos, il serait nécessaire de comparer le fichier déjà lié au produit dans la base de données, avec le fichier inclus dans la requête.
On peut le faire grâce à la propriété req.file.originalname par exemple.
On peut également considérer que tout fichier transmis est forcément nouveau (même si c'est le même), et qu'on doit alors supprimer l'ancien et conserver le nouveau.

Dans le premier cas, il faut être précis dans le nommage des fichiers envoyés, car tout fichier enregistré obtiens un timestamp Date.now().
Ce timestamp est accolé au nom originel du fichier ce qui permet de ne pas supprimer les anciens fichiers s'ils devaient porter le même nom que ceux entrants (doc1.docx pour l'exemple).
On peut alors supprimer le vieux fichier avec une fonction de ce type que l'on appelle APRES que la mise-à-jour ait été effectuée
Il faut prendre soin de conserver le chemin de la vieille image dans une variable que l'on passe ici en argument:

  function deleteOldPicture(pathToPicture = undefined) {
    if (pathToPicture) {
      const oldFilename = pathToPicture.split('/images/')[1]
      fs.unlink(`images/${oldFilename}`, () => console.log(`${oldFilename} a été supprimée à cause de la mise-à-jour d'une nouvelle image`))
    } else {
      console.log('Aucune image a détruire')
    }
  }

Comme pour la création, l'image étant facultative, on peut détecter depuis cet endpoint qu'une image a été transmise, traitée et enregistrée en effectuant la vérification:

  if (req.file) {
    Cas d'une requête ayant transmise une image récupérée et traitée par le middleware multer
  } else {
    Cas sans image attachée
  }

*/

exports.modifyProduct = (req, res) => {
  //Cette vérification permet d'obtenir un ID correct sous forme de nombre.
  if (validateIdField(req.params.id)) {
    const id = parseInt(req.params.id)
    const propertyArray = Object.keys(req.body)
    //Les 3 prochaines vérification sont du même type que pour la création: Vérifier la présence de champs indésirables, vérifier ensuite la présence de champs autorisés, puis vérifier le contenu des champs autorisés.
    if (analyzeBodyFields(propertyArray, productsRequest)) {
      if (modificationFields(propertyArray)) {
        if (validateModificationRequest(req.body)) {
          //Une fois 
          Product.findOne({ where: { id: id }})
            .then((product) => {
              if (product) {
                //Les valeurs numériques du produit sont ici soit conservées grâce à celle conservée en base de donnée (lorsque aucune valeur n'est transmise), soit formatée en (typeof number) lorsqu'une valeur est insérée dans la requête.
                const price = formatNumericField(propertyArray, 'price', product.price, req.body.price)
                const quantity = formatNumericField(propertyArray, 'quantity', product.quantity, req.body.quantity)
                const rating = formatNumericField(propertyArray, 'rating', product.rating, req.body.rating)
                //Si une propriété code est envoyée dans la requête, il est nécessaire de la confronter aux code déjà présents en base de données.
                if (propertyArray.includes('code')) {
                  Product.findOne({ where: { code: req.body.code }})
                    .then((codeProduct) => {
                      //Si un produit est trouvé, et si le produit trouvé à un id différent de celui auquel doit s'appliquer la màj :
                      //On essaye donc à ce moment-là de donner un code produit déjà attribué à une autre produit, au produit que l'on met à jour.
                      if (codeProduct && codeProduct.id !== product.id) {
                        response(res, 400, `Vous ne pouvez pas attribuer ${req.body.code} au produit ${req.body.name}. Ce code est déjà en cours d'utilisation pour le produit ${codeProduct.name}`)
                      } else {
                        // Tous les champs présents ont des valeurs qui ont été vérifiées et qui n'entreront pas en conflit. On peut procéder à la mise-à-jour de la base de données.
                        Product.update({
                          ...req.body,
                          price: price,
                          quantity: quantity,
                          rating: rating
                        },{
                          where: { id: id }
                        })
                          .then(() => response(res, 200, `Mise-à-jour réussie du produit avec le code ${req.body.code}.`))
                          .catch((error) => response(res, 500, `Une erreur est survenue durant la mise-à-jour du produit avec ou sans changement de code: ${error}`))
                      }
                    })
                    .catch((error) => response(res, 500, `Une erreur est survenue durant la vérification d'un produit existant avec le même code-produit: ${error}`))
                } else {
                  // Tous les champs présents ont des valeurs qui ont été vérifiées et qui n'entreront pas en conflit. On peut procéder à la mise-à-jour de la base de données.
                  Product.update({
                    ...req.body,
                    price: price,
                    quantity: quantity,
                    rating: rating
                  },{
                    where: { id: id }
                  })
                    .then(() => response(res, 200, "Produit mis-à-jour."))
                    .catch((error) => response(res, 500, `Une erreur est survenue durant la mise-à-jour de la ressource: ${error}`))
                }
              } else {
                response(res, 404, `Aucun produit n'a été trouvé avec l'id: ${id}`)
              }
            })
            .catch((error) => response(res, 500, `Une erreur s'est produite lors de la recherche du produit à modifier: ${error}`))
        } else {
          response(res, 400, "Certains champs comprennent des valeurs non-autorisées.")
        }
      } else {
        response(res, 400, "Aucun champ nécessaire à la modification d'un produit n'est présent dans la requête.")
      }
    } else {
      response(res, 400, "Certains champs de la requête ne sont pas autorisés.")
    }
  } else {
    response(res, 400, "Aucun produit ne correspond à cet ID.")
  }
}

/*
Encore une fois, le cas du fichier image n'est pas traité durant ces tests, mais si l'on devait le traiter,
Il serait nécessaire ici de ne pas oublier de détruire le fichier image lorsque l'on supprime le produit auquel elle est rattachée.
Dans ce cas, l'on devrait stocker le pathToFile dans une constante initialisée avec le product.image (que je considère comme le pathToFile pour l'exemple)
Une fois la destruction effectuée, à l'intérieur du .then(), on peut donc effectuer la destruction de l'image:

  Product.destroy({ where { id: id }})
    .then(() => {
      const filename = pathToFile.split('/images/)[1]
      fs.unlink(`images/${filename}`, () => console.log(`Suite à la supression du produit n°${id}, l'image associée ${filename} a été supprimée.`))
    })
    .catch((error) => Traitement de l'erreur)

*/

exports.removeProduct = (req, res) => {
  if (validateIdField(req.params.id)) {
    const id = parseInt(req.params.id)
    Product.findOne({ where: { id: id }})
      .then((product) => {
        if (product) {
          Product.destroy({ where: { id: id }})
            .then(() => response(res, 200, `Le produit avec l'id ${id} a été supprimé de la base de données.`))
            .catch((error) => response(res, 500, `Une erreur est survenue durant la destruction du produit dont l'id est ${id}: ${error}`))
        } else {
          response(res, 404, `Il n'y a pas de produit correspondant à l'id: ${id}`)
        }
      })
      .catch((error) => response(res, 500, `Une erreur est survenue lors de la recherche du produit à supprimer: ${error}`))
  }
}