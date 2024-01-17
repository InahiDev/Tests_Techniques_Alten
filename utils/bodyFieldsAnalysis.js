const { productsRequest, code, name, price, quantity, inventoryStatus, category, rating } = require('./regex')

//Parcours les différentes entrées du body et les confronte aux colonnes prédéfinies de notre modèle rassemblées dans une regex. En cas de champ erronés, renvoie 'false'. Sinon renvoie 'true'
function analyzeBodyFields(array, regExp) {
  for (let key of array) {
    if (!regExp.test(key)) {
      return false
    }
  }
  return true
}

//Vérification basique de l'id. L'Id doit être un nombre supérieur à l'Id minimum: 1000.
function validateIdField(idField) {
  if (idField === ("" || ":id")) {
    return false
  } else {
    console.log(parseInt(idField))
    if (parseInt(idField) >= 1000) {
      return true
    } else {
      return false
    }
  }
  //if (parseInt(idField) >= 1000) {
  //  return true
  //} else {
  //  return false
  //}
}

//Vérification de l'existence de tous les champs obligatoires à la création d'une instance de product
function creationFields(array) {
  if (array.includes('code')
  && array.includes('name')
  && array.includes('description')
  && array.includes('price')
  && array.includes('quantity')
  && array.includes('inventoryStatus')
  && array.includes('category')) {
    return true
  } else {
    return false
  }
}

//Vérification de la présence d'au minimum 1 champ nécessaire pour la modification d'un product
function modificationFields(array) {
  if (array.includes('code')
  || array.includes('name')
  || array.includes('description')
  || array.includes('price')
  || array.includes('quantity')
  || array.includes('inventoryStatus')
  || array.includes('category')
  || array.includes('image')
  || array.includes('rating')) {
    return true
  } else {
    return false
  }
}

//Vérification générale de la conformité du contenu d'un champ.

//Cas d'un champ obligatoire. Je considère leur présence vérifiée.
function validateMandatoryField(fieldValue, regex) {
  const isValid = regex.test(fieldValue)
  return isValid
}

//Cas d'un champ optionnel, L'absence de cette propriété ne mets pas un arrêt au passage de la condition.
function validateExtraField(array, fieldName, fieldValue, regex) {
  if (array.includes(`${fieldName}`)) {
    if (regex.test(fieldValue)) {
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}

//Vérification que les champs STRING ne soient pas vide s'ils existent. S'ils ne sont pas présent, ne bloque pas la condition
function isExtraStringFullfilled(array, fieldName, fieldValue) {
  if (array.includes(`${fieldName}`)) {
    if (!fieldValue) {
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

//Vérification de la conformité de tous les champs de la requête appliquée à la création. Certains champs sont obligatoires, d'autres sont otpionnels.
function validateCreationRequest(body) {
  if (code.test(body.code)
  && body.name  //Le champ name ne peut pas être vide.
  && body.description //Le champ description ne peut pas être vide.
  && price.test(body.price)
  && quantity.test(body.quantity)
  && inventoryStatus.test(body.inventoryStatus)
  && category.test(body.category)
  && validateExtraField(propertyArray, "rating", body.rating, rating)) {
    return true
  } else {
    return false
  }
}

//Vérification de la conformité de tous les champs de la requête appliquée à la modification. Tous les champs sont alors optionnels.
function validateModificationRequest(body) {
  const propertyArray = Object.keys(body)
  if (validateExtraField(propertyArray, "code", body.code, code)
  && isExtraStringFullfilled(propertyArray, "name", body.name)
  && isExtraStringFullfilled(propertyArray, "description", body.description)
  && validateExtraField(propertyArray, "price", body.price, price)
  && validateExtraField(propertyArray, "quantity", body.quantity, quantity)
  && validateExtraField(propertyArray, "inventoryStatus", body.inventoryStatus, inventoryStatus)
  && validateExtraField(propertyArray, "category", body.category, category)
  && validateExtraField(propertyArray, "rating", body.rating, rating)) {
    return true
  } else {
    return false
  }
}

function formatNumericField(array, valueName, storedValue, requestValue) {
  if (array.includes(valueName)) {
    return parseInt(requestValue)
  } else {
    return parseInt(storedValue)
  }
}

module.exports = { analyzeBodyFields, validateIdField, creationFields, modificationFields, validateMandatoryField, validateExtraField, validateCreationRequest, validateModificationRequest, formatNumericField }