const Follower = require('../models/Follower')
const User = require('../models/User')
const mongoose = require('mongoose')

module.exports = {
  async index(req, res) {
    const id = mongoose.Types.ObjectId(`${req.getLoggedUserId()}`)

    const following = await Follower.find({
      follower: id
    })

    return res.json(following)
  },

  async count(req, res) {
    const id = mongoose.Types.ObjectId(`${req.params.id}`)

    const following = await Follower.find({ follower: id })
    const followers = await Follower.find({ user_id: id })

    const response = {
      followers,
      following
    }

    return res.json(response)
  },

  async isFollowing(req, res) {
    const followerUser = mongoose.Types.ObjectId(`${req.getLoggedUserId()}`)
    const { user_id } = req.body
    const followedUser = mongoose.Types.ObjectId(`${user_id}`)

    const isFollowing = await Follower.find({
      user_id: followedUser,
      follower: followerUser
    })

    return res.json(isFollowing)
  },

  async follow(req, res) {
    const userFollower = req.getLoggedUserId()
    const { user_id: userFollowed } = req.body
    if (userFollower === userFollowed) {
      return res.json({ msg: 'Você não pode seguir a ti mesmo' })
    }
    //verifica se o usuario a ser seguido existe
    const userFollowedExists = await User.findOne({
      _id: mongoose.Types.ObjectId(`${userFollowed}`)
    })
    if (userFollowedExists) {
      try {
        //verificar se já segue
        const isFollowing = await Follower.findOne({
          user_id: mongoose.Types.ObjectId(`${userFollowed}`),
          follower: mongoose.Types.ObjectId(`${userFollower}`)
        })
        if (isFollowing) {
          return res.json({ msg: 'Você já segue esse usuário' })
        } else {
          //seguir
          await Follower.create({
            user_id: mongoose.Types.ObjectId(`${userFollowed}`),
            follower: mongoose.Types.ObjectId(`${userFollower}`)
          })
          return res.json({ msg: 'Agora você o segue' })
        }
      } catch (err) {
        return res.json(err)
      }
    } else {
      return res.json({ msg: 'Usuário não existe' })
    }
  },

  async unFollow(req, res) {
    const userFollower = req.getLoggedUserId()
    const { user_id: userUnfollowed } = req.body
    //verifica se o usuario seguido ainda existe.
    try {
      //verificar se segue
      const isFollowing = await Follower.findOne({
        user_id: mongoose.Types.ObjectId(`${userUnfollowed}`),
        follower: mongoose.Types.ObjectId(`${userFollower}`)
      })
      if (isFollowing) {
        await Follower.findByIdAndRemove(isFollowing._id)
        return res.json({ msg: 'Deixou de seguir' })
      }
      return res.json({ msg: 'Usuário não é seguido' })
    } catch (err) {
      return res.json(err)
    }
  }
}
