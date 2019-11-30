const Post = require('../models/Post')
const User = require('../models/User')
const mongoose = require('mongoose')

module.exports = {
  async index(req, res) {
    const loggedUserId = req.getLoggedUserId()
    const response = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(`${loggedUserId}`) } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'followers',
          localField: '_id',
          foreignField: 'follower',
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'followers.user_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $project: {
          _id: 0,
          username: 1,
          email: 1,
          followers: '$followers',
          posts: '$posts'
        }
      }
    ]).then(async document => {
      let collection = document[0]
      const authorsIds = collection.posts.map(post => post.author)
      let documents
      try {
        const users = await User.find({ _id: { $in: authorsIds } })

        documents = collection.posts.map(post => {
          const listLikes = post.likes.map(like => like.toString())

          const isPostLiked = listLikes.includes(loggedUserId)

          const author = users.find(user => {
            return JSON.stringify(user._id) === JSON.stringify(post.author)
          })

          return {
            ...post,
            authorName: author.username,
            avatar_url: author.avatar_url,
            isPostLiked
          }
        })
      } catch (error) {
        return res.status(418).json()
      }

      return documents
    })

    res.json(response)
  },

  async create(req, res) {
    const { originalname: name, size, key, location: url = '' } = req.file
    const { description } = req.body
    const author = req.getLoggedUserId()

    const post = await Post.create({
      name,
      size,
      key,
      url,
      description,
      author: mongoose.Types.ObjectId(`${author}`)
    })

    return res.json(post)
  },

  async profile(req, res) {
    const loggedUserId = req.getLoggedUserId()
    const user_Oid = mongoose.Types.ObjectId(`${req.params.id}`)
    const posts = await Post.find({ author: user_Oid }).sort({ createdAt: -1 })

    user = await User.findById(req.params.id)

    const document = posts.map(post => {
      const isOwner = post.author == loggedUserId ? true : false
      const isPostLiked = post.likes.includes(loggedUserId)
      const authorName = user.username
      const avatar_url = user.avatar_url
      return { ...post._doc, authorName, avatar_url, isPostLiked, isOwner }
    })

    return res.json(document)
  },

  async show(req, res) {
    const post = await Post.findById(req.params.id)

    return res.json(post)
  },

  async update(req, res) {
    const loggedUser = req.getLoggedUserId()
    const post = await Post.findById(req.params.id)

    if (post.author == loggedUser) {
      await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
      return res.status(200).json(post)
    }

    return res.status(403).json({ error: 'Este post não é seu!' })
  },

  async destroy(req, res) {
    const loggedUser = req.getLoggedUserId()
    const post = await Post.findById(req.params.id)

    if (post.author == loggedUser) {
      await post.remove()
      return res.status(200).json({ msg: 'Post deletado!' })
    }

    return res.status(406).json({ error: 'Este post não é seu!' })
  },

  async like(req, res) {
    const likedPost = await Post.findById(req.params.id)

    if (!likedPost) {
      return res.status(400).json({ error: 'Post não encontrado!' })
    }

    if (likedPost.likes.includes(req.getLoggedUserId())) {
      return res.status(400).json({ error: 'Você já curtiu esse post!' })
    }

    likedPost.likes.push(req.getLoggedUserId())

    await likedPost.save()

    return res.json(likedPost)
  },

  async deslike(req, res) {
    const loggedUserId = req.getLoggedUserId()
    const deslikedPost = await Post.findById(req.params.id)

    if (deslikedPost.likes.includes(loggedUserId)) {
      await Post.update(
        { _id: mongoose.Types.ObjectId(`${deslikedPost.id}`) },
        { $pull: { likes: { $in: [mongoose.Types.ObjectId(`${loggedUserId}`)] } } }
      )

      return res.status(200).json(deslikedPost)
    } else {
      return res.status(403).json({ error: 'Você ainda não curtiu esse Post!' })
    }
  },

  async isLiked(req, res) {
    const loggedUserId = req.getLoggedUserId()

    const post = await Post.findOne({
      $and: [
        { _id: mongoose.Types.ObjectId(`${req.params.id}`) },
        { likes: { $in: [mongoose.Types.ObjectId(`${loggedUserId}`)] } }
      ]
    })

    return res.status(200).json(post)
  }
}
