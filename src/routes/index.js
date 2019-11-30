const router = require('express').Router()
const posts = require('./posts')
const users = require('./users')
const follow = require('./follow')

router.use('/users', users)
router.use('/posts', posts)
router.use('/follow', follow)

module.exports = router
