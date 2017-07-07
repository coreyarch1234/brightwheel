var express = require('express');
var router = express.Router();

//Get Form Page for Email Info
router.get('/', function(req,res){
    console.log('Reached Email Homepage');
    res.render('layouts/home');
});

//Export
module.exports = router;
