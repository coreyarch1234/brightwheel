var express = require('express');
var router = express.Router();

//Validate Email address
var validateEmail = require('../validators/validateEmail');

//Validate that all fields are filled in
var validateEmailFields = require('../validators/validateForm');

//Use Mailgun as Default
var configMailGun = require('../config/mailgun');

var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var api_key = configMailGun.api_key;
//Your domain, from the Mailgun Control Panel
var domain = configMailGun.domain;


//Get Form Page for Email Info
router.get('/', function(req,res){
    res.render('layouts/home');
});

//Post Email
router.post('/email', function(req,res){
    var emailInfo = req.body;

    //Strip HTML from email body
    emailInfo.emailBody = emailInfo.emailBody.replace(/<(?:.|\n)*?>/gm, '');

    //send the email only if this is true
    var isValidated = false;

    //This will carry the email information and data on if fields were validated
    var validatedResult = {
        emailInfo: emailInfo,
        validateEmailFields: true, // True if all of the fields were filled in
        validateRecipientEmail: true,
        validateSenderEmail: true
    }

    //Check to see if each input field was filled in
    if (validateEmailFields(emailInfo)){
        //Check to see if the email is valid
        if (validateEmail(emailInfo.recipientEmail) && validateEmail(emailInfo.senderEmail)){
            isValidated = true;
            // res.send(validatedResult);
        }
        else if ((validateEmail(emailInfo.recipientEmail) == false)){
            validatedResult.validateRecipientEmail = false;
            res.send(validatedResult);
        }
        else if (validateEmail(emailInfo.senderEmail) == false){
            validatedResult.validateSenderEmail = false;
            res.send(validatedResult);
        }
    }else{
        validatedResult.validateEmailFields = false;
        res.send(validatedResult);
    }

    //Send Email Through Mailgun
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: api_key, domain: domain});

    var data = {
    //Specify email data
      from: emailInfo.senderEmail,
    //The email to contact
      to: emailInfo.recipientEmail,
    //Subject and text data
      subject: emailInfo.subject,
      html: emailInfo.emailBody
    }

    if (isValidated){ //send email only if the email info has been validated
            //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            //If there is an error, render the error page
            if (err) {
                res.render('layouts/error');
                console.log("got an error: ", err);
            }
            else {
                res.send(validatedResult);
                console.log(body);
            }
        });
    }



});

//Export
module.exports = router;
