const fs = require('fs')
const { savedImage } = require('./regex')
const { response } = require('./response')

function oldImageDelete(path) {
  const filename = path.split('/images/')[1]
  fs.unlink(`images/${filename}`, () => console.log(`L'image ${filename} a été supprimée`))
}

module.exports = { oldImageDelete }