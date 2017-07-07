var express = require('express');
var router = express.Router();

//Validate Email address
var validateEmail = require('../validators/validateEmail');

//Validate that all fields are filled in
var validateEmailFields = require('../validators/validateForm');


//Get Form Page for Email Info
router.get('/', function(req,res){
    res.render('layouts/home');
});

//Post Email
router.post('/email', function(req,res){
    var emailInfo = req.body;

    //Check to see if each input field was filled in
    if (validateEmailFields(emailInfo)){
        //Check to see if the email is valid
        if (validateEmail(emailInfo.emailBody)){
            console.log('everything is validated');
            res.send({emailInfo: emailInfo, validated: true});
        }else{
            console.log('Enter a valid email address');
            res.send({emailInfo: emailInfo, validated: false});
        }
    }else{
        console.log('Fill out all fields');
        res.send({emailInfo: emailInfo, validated: false});
    }
});

//Export
module.exports = router;
