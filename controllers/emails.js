var express = require('express');
var router = express.Router();

//Get Form Page for Email Info
router.get('/', function(req,res){
    console.log('Reached Email Homepage');
    res.render('layouts/home');
});

//Post Email
router.post('/email', function(req,res){
    var email = req.body;
    console.log('posted successfully: ' + email);
    res.send(email);
});

//Export
module.exports = router;
