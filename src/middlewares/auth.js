const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' })
  }

  const [scheme, token] = authHeader.split(' ')

  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    console.log(process.env.SECRET)
    req.getLoggedUserId = () => decoded.id

    return next()
  } catch (err) {
    return res.status(401).send({ error: 'Token invalid' })
  }
}
