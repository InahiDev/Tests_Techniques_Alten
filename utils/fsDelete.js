const fs = require('fs')
const { savedImage } = require('./regex')
const { response } = require('./response')

function oldImageDelete(path) {
  const filename = path.split('/images/')[1]
  fs.unlink(`images/${filename}`, () => console.log(`L'image ${filename} a été supprimée.`))
}

function newImageDelete(req) {
  if (req.file) {
    const path = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    fs.unlink(`images/${req.file.filename}`, () => console.log(`L'image ${req.file.filename} a été détruite car la requête n'a pas aboutie.`))
  }
}

module.exports = { oldImageDelete, newImageDelete }