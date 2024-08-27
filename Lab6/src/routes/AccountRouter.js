const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.get('/index', siteController.index);
router.get('/login', siteController.login);
router.get('/register', siteController.register);
router.post('/register', siteController.registerUser);
router.post('/login', siteController.loginUser);



module.exports = router