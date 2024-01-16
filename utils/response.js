function response(res, code, message, data= null) {
  res.status(code).json({ message: message, data })
}

module.exports = { response }