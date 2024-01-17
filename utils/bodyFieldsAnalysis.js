const { productsRequest, code, name, price, quantity, inventoryStatus, category, rating } = require('./regex')

//Parcours les différentes entrées du body et les confronte aux colonnes prédéfinies de notre modèle rassemblées dans une regex. En cas de champ erronés, renvoie 'false'. Sinon renvoie 'true'
function analyzeBodyFields(body, regExp) {
  const propertyArray = Object.keys(body)
  for (let key of propertyArray) {
    if (!regExp.test(key)) {
      return false
    }
  }
  return true
}

//Vérification basique de l'id. L'Id doit être un nombre supérieur à l'Id minimum: 1000.
function validateIdField(idField) {
  if (parseInt(idField) < 1000) {
    return false
  } else {
    return true
  }
}

//Vérification de l'existence de tous les champs obligatoires à la création d'une instance de product
function creationFields(body) {
  const propertyArray = Object.keys(body)
  if (propertyArray.includes('code')
  && propertyArray.includes('name')
  && propertyArray.includes('description')
  && propertyArray.includes('price')
  && propertyArray.includes('quantity')
  && propertyArray.includes('inventoryStatus')
  && propertyArray.includes('category')) {
    return true
  } else {
    return false
  }
}

//Vérification de la présence d'au minimum 1 champ nécessaire pour la modification d'un product
function modificationFields(body) {
  const propertyArray = Object.keys(body)
  if (propertyArray.includes('code')
  || propertyArray.includes('name')
  || propertyArray.includes('description')
  || propertyArray.includes('price')
  || propertyArray.includes('quantity')
  || propertyArray.includes('inventoryStatus')
  || propertyArray.includes('category')
  || propertyArray.includes('image')
  || propertyArray.includes('rating')) {
    return true
  } else {
    return false
  }
}

//Vérification générale de la conformité du contenu d'un champ.
function validateMandatoryField(field, regex) {
  if (field) {
    if (regex.test(field)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function validateExtraField(field, regex) {
  if (field) {
    if (regex.test(field)) {
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}

//Vérification de la conformité de tous les champs de la requête appliquée à la création.
function validateCreationRequest(body) {
  if (validateMandatoryField(body.code, code)
  && validateMandatoryField(body.price, price)
  && validateMandatoryField(body.quantity, quantity)
  && validateMandatoryField(body.inventoryStatus, inventoryStatus)
  && validateMandatoryField(body.category, category)
  && validateExtraField(body.rating, rating)) {
    return true
  } else {
    return false
  }
}

// " à la modification.
function validateModificationRequest(body) {
  if (validateExtraField(body.code, code)
  && validateExtraField(body.price, price)
  && validateExtraField(body.quantity, quantity)
  && validateExtraField(body.inventoryStatus, inventoryStatus)
  && validateExtraField(body.category, category)
  && validateExtraField(body.rating, rating)) {
    return true
  } else {
    return false
  }
}

module.exports = { analyzeBodyFields, validateIdField, creationFields, modificationFields, validateMandatoryField, validateExtraField, validateCreationRequest, validateModificationRequest }