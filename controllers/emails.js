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
    var validatedResult = {
        emailInfo: emailInfo,
        validateEmailFields: true,
        validateRecipientEmail: true,
        validateSenderEmail: true
    }
    console.log(emailInfo)

    //Check to see if each input field was filled in
    if (validateEmailFields(emailInfo)){
        //Check to see if the email is valid
        if (validateEmail(emailInfo.recipientEmail) && validateEmail(emailInfo.senderEmail)){
            console.log('everything is validated');
            res.send(validatedResult);
        }
        else if ((validateEmail(emailInfo.recipientEmail) == false)){
            console.log('Enter a valid recipient email address');
            validatedResult.validateRecipientEmail = false;
            res.send(validatedResult);
        }
        else if (validateEmail(emailInfo.senderEmail) == false){
            console.log('Enter a valid sender email address');
            validatedResult.validateSenderEmail = false;
            res.send(validatedResult);
        }
    }else{
        console.log('Fill out all fields');
        validatedResult.validateEmailFields = false;
        res.send(validatedResult);
    }
});

//Export
module.exports = router;
