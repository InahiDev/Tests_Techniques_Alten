const usersRequest = /^password$|^email$/
const productsRequest = /^code$|^name$|^description$|^price$|^quantity$|^inventoryStatus$|^category$|^image$|^rating$/
const code = /^[a-z\d]{9}$/
const name = /^([A-Z]{1}[a-zäëïöüâêîôûçùàéè]*){1}([-\s]{1}[A-Z]{1}[a-zäëïöüâêîôûçùàéè]*)*$/
const price = /^[0-9]{1,}$/
const quantity = /^[0-9]{1,}$/
const inventoryStatus = /^INSTOCK$|^LOWSTOCK$|^OUTOFSTOCK$/
const category = /^Accessories$|^Clothing$|^Electronics$|^Fitness$/
const rating = /^[0-5]{1}$/
const savedImage = /^http:\/\/localhost:3000\/images\/.+$/

module.exports = { usersRequest, productsRequest, code, name, price, quantity, inventoryStatus, category, rating, savedImage }