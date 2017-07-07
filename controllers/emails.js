var express = require('express');
var router = express.Router();

//Validate Email address
var validateEmail = require('../validators/validateEmail');

//Validate that all fields are filled in
var validateEmailFields = require('../validators/validateForm');

//Mailgun
var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var api_key = 'key-d5b067dbc3964489a62ad4728fd4b9a6';
//Your domain, from the Mailgun Control Panel
var domain = 'sandbox4c3085e2b352474b86eb394ab431a2d5.mailgun.org';

var config = require('./config/mailgun');

console.log("API KEY IS: " + config.api_key);










//Get Form Page for Email Info
router.get('/', function(req,res){
    res.render('layouts/home');
});

//Post Email
router.post('/email', function(req,res){
    var emailInfo = req.body;
    //Strip HTML from email body
    emailInfo.emailBody = emailInfo.emailBody.replace(/<(?:.|\n)*?>/gm, '');

    var isValidated = false; //send the email only if this is true

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
            console.log(validatedResult.emailInfo.emailBody);
            isValidated = true;
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

    //Send Email

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
                res.render('error', { error : err});
                console.log("got an error: ", err);
            }
            //Else we can greet    and leave
            else {
                //Here "submitted.jade" is the view file for this landing page
                //We pass the variable "email" from the url parameter in an object rendered by Jade
                res.render('submitted', { email : req.params.mail });
                console.log(body);
            }
        });
    }



});

//Export
module.exports = router;
