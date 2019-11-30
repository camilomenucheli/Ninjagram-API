const router = require('express').Router()
const multer = require('multer')
const multerConfig = require('../config/multer')
const PostControllers = require('../controllers/PostControllers')
const authMiddleware = require('../middlewares/auth')

router.use(authMiddleware)

router.get('/index', PostControllers.index)
router.post('/', multer(multerConfig).single('file'), PostControllers.create)
router.get('/profile/:id', PostControllers.profile)
router.get('/:id', PostControllers.show)
router.put('/:id', PostControllers.update)
router.delete('/:id', PostControllers.destroy)
router.post('/:id/like', PostControllers.like)
router.post('/:id/deslike', PostControllers.deslike)

module.exports = router
