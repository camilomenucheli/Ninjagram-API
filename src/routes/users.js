const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const multer = require('multer')
const multerConfig = require('../config/multer')
const UserControllers = require('../controllers/UserControllers')

router.post('/auth', UserControllers.auth)
router.post('/create', UserControllers.create)

router.use(authMiddleware)

router.get('/', UserControllers.index)
router.post('/search', UserControllers.search)
router.get('/:id', UserControllers.show)
router.put('/:id', multer(multerConfig).single('file'), UserControllers.update)
router.delete('/:id', UserControllers.destroy)

module.exports = router
