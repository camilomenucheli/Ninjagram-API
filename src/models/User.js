const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  passwd: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  avatar_url: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  }
})

UserSchema.pre('save', async function hashPasswd(next) {
  if (!this.isModified('passwd')) next()

  this.passwd = await bcrypt.hash(this.passwd, 8)
})

UserSchema.methods = {
  compareHash(hash) {
    return bcrypt.compare(hash, this.passwd)
  },

  generateToken() {
    return jwt.sign({ id: this.id }, process.env.SECRET, {
      expiresIn: 86400
    })
  }
}

module.exports = mongoose.model('User', UserSchema)
