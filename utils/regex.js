const productsRequest = /^id$|^code$|^name$|^description$|^price$|^quantity$|^inventoryStatus$|^category$|^image$|^rating$/
const code = /^[a-z\d]{9}$/
const name = /^([A-Z]{1}[a-zäëïöüâêîôûçùàéè]*){1}([-\s]{1}[A-Z]{1}[a-zäëïöüâêîôûçùàéè]*)*$/
const price = /^\d{3,}$/
const quantity = /^\d{1,}$/
const inventoryStatus = /^INSTOCK$|^LOWSTOCK$|^OUTOFSTOCK$/
const category = /^Accessories$|^Clothing$|^Electronics$|^Fitness$/
const rating = /^[0-5]{1}$/

module.exports = { productsRequest, code, name, price, quantity, inventoryStatus, category, rating }