const express = require('express'); 
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

router.post('/addTextFile', siteController.addTextFile);
router.post('/upload', siteController.upload);

module.exports = router;