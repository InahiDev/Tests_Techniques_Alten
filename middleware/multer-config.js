const multer = require('multer')
const { response } = require('../utils/response')

const MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'imagge/png': 'png'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split('.').join('_')
    const extension = MIME_TYPES[file.mimetype]
    callback(null, name + Date.now() + '.' + extension)
  }
})

module.exports =  multer({ storage }).single('image')