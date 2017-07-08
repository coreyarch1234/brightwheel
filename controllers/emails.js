var express = require('express');
var router = express.Router();

//Validate Email address
var validateEmail = require('../validators/validateEmail');

//Validate that all fields are filled in
var validateEmailFields = require('../validators/validateForm');

//Use Sendgrid as Default
var configSendGrid = require('../config/sendgrid');
//Your sendgrid api key
var sendgrid_api_key = configSendGrid.api_key;

//Use Mailgun In Case Sendgrid fails
var configMailGun = require('../config/mailgun');
//Your api key, from Mailgun’s Control Panel
var mailgun_api_key = configMailGun.api_key;
//Your domain, from the Mailgun Control Panel
var domain = configMailGun.domain;

var unirest = require('unirest');
var request = require('request');

//Simply run this function to use Sendgrid as mail service
function useSendGrid(emailInfo){

    var data = {
        from: emailInfo.senderEmail,
        to: emailInfo.recipientEmail,
        subject: emailInfo.subject,
        content: emailInfo.emailBody
    }

    var options = {
      method: 'post',
      json: true,
      url: 'https://api.sendgrid.com/v3/mail/send',
      'auth': {
              'bearer': sendgrid_api_key
      },
      body: {
          from: {
            email: emailInfo.senderEmail
          },
          personalizations: [{
            to: [{ email: emailInfo.recipientEmail }]
          }],
          subject: emailInfo.subject,
          content: [{
            type: 'text/plain',
            value: emailInfo.emailBody
          }]
      }
    }
    request(options, function (err, res, body) {
      if (err) {
        console.error('error posting json: ', err)
        throw err
      }
      var headers = res.headers
      var statusCode = res.statusCode
      console.log('headers: ', headers)
      console.log('statusCode: ', statusCode)
      console.log('body: ', body)
  });
};



//Simply run this function to use Mailgun as mail service
function useMailGun(emailInfo){
    var data = {
      from: emailInfo.senderEmail,
      to: emailInfo.recipientEmail,
      subject: emailInfo.subject,
      html: emailInfo.emailBody
    }

    var header = new Buffer("api:"+mailgun_api_key).toString('base64');

    unirest.post('https://api.mailgun.net/v3/' + domain + '/messages')
        .headers({'Authentication': "Basic " + header})
        .send(data)
        .end(function(res){
            console.log("post mailgun request sent");
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
        // useMailGun(emailInfo);
        res.send(validatedResult);
    };
});

//Export
module.exports = router;
