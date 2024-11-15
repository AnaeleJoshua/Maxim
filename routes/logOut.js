const express = require('express')
const router = express.Router()
const logOutrController = require('../controllers/logOutController')

router.post('/',logOutrController.handleLogOut)

module.exports = router;