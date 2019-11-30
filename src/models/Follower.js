const mongoose = require('mongoose')

const FollowersSchema = new mongoose.Schema({
  user_id: {
    type: Object
  },
  follower: {
    type: Object
  },
  followage: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Followers', FollowersSchema)
