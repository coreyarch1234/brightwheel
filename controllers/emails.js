var express = require('express');
var router = express.Router();

//Validate Email address
var validateEmail = require('../validators/validateEmail');

//Validate that all fields are filled in
var validateEmailFields = require('../validators/validateForm');

//Use Sendgrid as Default
var configSendGrid = require('../config/sendgrid');
var helper = require('sendgrid').mail;
//Your sendgrid api key
var sendgrid_api_key = configSendGrid.api_key;

//Use Mailgun In Case Sendgrid fails
var configMailGun = require('../config/mailgun');
var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var mailgun_api_key = configMailGun.api_key;
//Your domain, from the Mailgun Control Panel
var domain = configMailGun.domain;

//Simply run this function to use Sendgrid as mail service
function useSendGrid(emailInfo){
    var sg = require('sendgrid')(sendgrid_api_key);

    var fromEmail = new helper.Email(emailInfo.senderEmail);
    var toEmail = new helper.Email(emailInfo.recipientEmail);
    var subject =  emailInfo.subject;
    var content = new helper.Content('text/plain', emailInfo.emailBody);
    var mail = new helper.Mail(fromEmail, subject, toEmail, content);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });


    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
        res.render('layouts/error');
      }
      console.log(response.statusCode);
      console.log("the response body is: " + response.body);
      console.log(response.headers);
    });
};

//Simply run this function to use Mailgun as mail service
function useMailGun(emailInfo){
    //Send Email Through Sendgrid
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({apiKey: mailgun_api_key, domain: domain});
    var data = {
    //Specify email data
      from: emailInfo.senderEmail,
    //The email to contact
      to: emailInfo.recipientEmail,
    //Subject and text data
      subject: emailInfo.subject,
      html: emailInfo.emailBody
    }
    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            res.render('layouts/error');
            console.log("got an error: ", err);
        }
        else {
            console.log(body);
        }
    });
};


//Get Form Page for Email Info
router.get('/', function(req,res){
    res.render('layouts/home');
});

//Send Email through a post request
router.post('/email', function(req,res){
    var emailInfo = req.body;

    //Strip HTML from email body
    emailInfo.emailBody = emailInfo.emailBody.replace(/<(?:.|\n)*?>/gm, '');

    //send the email only if this is true
    var isValidated = false;

    //This will carry the email information and and validation results
    var validatedResult = {
        emailInfo: emailInfo,
        // True if all of the fields were filled in.
        //They are all true by default
        validateEmailFields: true,
        validateRecipientEmail: true,
        validateSenderEmail: true
    }

    //Check to see if each input field was filled in
    if (validateEmailFields(emailInfo)){
        //Check to see if the email is valid
        if (validateEmail(emailInfo.recipientEmail) && validateEmail(emailInfo.senderEmail)){
            isValidated = true;
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

    //If the email information has been validated, send email
    if (isValidated){
        //To use sendgrid, call useSendGrid()
        //To use mailgun, call useMailGun()
        useSendGrid(emailInfo);
        res.send(validatedResult);
    };
});

//Export
module.exports = router;
