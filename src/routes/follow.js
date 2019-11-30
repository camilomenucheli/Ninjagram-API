const router = require('express').Router()
const FollowerControllers = require('../controllers/FollowerControllers')
const authMiddleware = require('../middlewares/auth')

router.use(authMiddleware)

router.get('/index', FollowerControllers.index)
router.post('/isfollowing', FollowerControllers.isFollowing)
router.post('/', FollowerControllers.follow)
router.post('/delete', FollowerControllers.unFollow)
router.get('/count/:id', FollowerControllers.count)

module.exports = router
