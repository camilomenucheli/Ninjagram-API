const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const aws = require('aws-sdk')
const fs = require('fs')
const path = require('path')

const s3 = new aws.S3()

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  author: {
    type: Object,
    required: true
  }
})

PostSchema.pre('save', function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}${process.env.APP_URL_PORT}/files/${this.key}`
  }
})

PostSchema.pre('remove', function() {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: 'ninjaup',
        Key: this.key
      })
      .promise()
  } else {
    return fs.unlink(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
  }
})

module.exports = mongoose.model('Post', PostSchema)
