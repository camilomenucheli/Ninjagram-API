const User = require('../models/User')
const Post = require('../models/Post')

module.exports = {
  async index(req, res) {
    const users = await User.find({ _id: { $ne: req.getLoggedUserId() } })

    return res.json(users)
  },

  async search(req, res) {
    const { username } = req.body
    try {
      const users = await User.find({ username: new RegExp(username, 'i') }).sort({ username: 0 })
      if (users.length === 0) {
        return res.json({ msg: 'User não encontrado' })
      } else {
        return res.json(users)
      }
    } catch (err) {
      return res.json({ msg: 'A busca não pode ser realizada' })
    }
  },

  async create(req, res) {
    const { username, email } = req.body

    const userExists = await User.findOne({ username })
    const emailExists = await User.findOne({ email })
    try {
      if (userExists || emailExists) {
        return res.json({ msg: 'Username or Email already exists' })
      }
      const user = await User.create(req.body)
      return res.json(user)
    } catch (err) {
      return res.status(400).json({ error: `User registration failed ${err}` })
    }
  },

  async show(req, res) {
    const user = await User.findById(req.params.id)
    const loggedUserId = req.getLoggedUserId()

    const profileOwner = loggedUserId == user._id ? true : false

    const response = { user, profileOwner }

    return res.json(response)
  },

  async update(req, res) {
    const loggedUserId = req.getLoggedUserId()
    const { originalname: name, key } = req.file
    let avatar_url = `${process.env.APP_URL}${process.env.APP_URL_PORT}/files/${key}`
    const { email, username, bio } = req.body
    const userExists = await User.findOne({ username })
    const emailExists = await User.findOne({ email })
    try {
      if (userExists) {
        return res.json({ msg: 'Username já está em uso' })
      }
      if (emailExists) {
        return res.json({ msg: 'Email já está em uso' })
      }
      const user = await User.findByIdAndUpdate(
        loggedUserId,
        { email, username, bio, name, avatar_url },
        { new: true }
      )
      return res.json(user)
    } catch (err) {
      return res.status(400).json({ error: `Falha no update das informações` })
    }
  },

  async destroy(req, res) {
    await User.findByIdAndRemove(req.getLoggedUserId())

    return res.status(200).json({ msg: 'Usuário deletado.' })
  },

  async auth(req, res) {
    try {
      const { email, passwd } = req.body

      const user = await User.findOne({ email })
      // console.log(user)
      if (!user) {
        return res.status(400).json({ error: 'User not found' })
      }

      if (!(await user.compareHash(passwd))) {
        return res.status(400).json({ error: 'Invalid Password' })
      }
      console.log(user.generateToken() || 'erro')

      return res.json({
        user,
        token: user.generateToken()
      })
    } catch (err) {
      return res.status(400).json({ error: 'User authentication failed' + err })
    }
  }
}
