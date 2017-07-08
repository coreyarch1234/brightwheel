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

var unirest = require('unirest');
var request = require('request');

//Simply run this function to use Sendgrid as mail service
function useSendGrid(emailInfo){

    // var data = {
    //   fromEmail: emailInfo.senderEmail,
    //   toEmail: emailInfo.recipientEmail,
    //   subject: emailInfo.subject,
    //   content: emailInfo.emailBody
    // }

    var data = {
        from: emailInfo.senderEmail,
        to: emailInfo.recipientEmail,
        subject: emailInfo.subject,
        content: emailInfo.emailBody
    }
    // request('http://www.google.com', function (error, response, body) {
    //   console.log('error:', error); // Print the error if one occurred
    //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //   console.log('body:', body); // Print the HTML for the Google homepage.
    // });
    // request.post('https://api.sendgrid.com/v3/mail/send', data)
    //   .on('response', function(response) {
    //     console.log(response.statusCode) // 200
    //     // console.log(response.headers['content-type']) // 'image/png'
    // });
        //
    // var header = new Buffer("api_key:"+sendgrid_api_key).toString('base64');
    // //
    // unirest.post('https://api.sendgrid.com/v3/mail/send')
    //     // .header('Content-Type', 'application/json')
    //     // .header('Authorization', 'Bearer ' + sendgrid_api_key)
    //     .headers({'Content-Type': 'application/json', 'Authorization': 'Bearer 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'})
    //     .send(data)
    //     .end(function(res){
    //         console.log(res.statusCode)
    //         console.log("post sendgrid request sent");
    //     });

    var options = {
      method: 'post',
      body: data,
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
            type: "text/plain",
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
    })

  //   var headersOpt = {
  //       "content-type": "application/json",
  //   };
  //   request({
  //     method: 'POST',
  //     uri: 'https://api.sendgrid.com/v3/mail/send',
  //     'auth': {
  //             'bearer': sendgrid_api_key
  //     },
  //     multipart: [
  //        {
  //            headers: headersOpt,
  //            json: true,
  //            body: JSON.stringify(data)
  //        }
  //     ],
  // },
  //     function (error, response, body) {
  //         if (error) {
  //           return console.error('upload failed:', error);
  //         }
  //         console.log('Upload successful!  Server responded with:', body);
  //     });


        // var options = {
        //   url: 'https://api.sendgrid.com/api/mail.send.json',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': 'Bearer' + sendgrid_api_key
        // },
        //     from: emailInfo.senderEmail,
        //     to: emailInfo.recipientEmail,
        //     subject: emailInfo.subject,
        //     content: emailInfo.emailBody.
        //     api_key: sendgrid_api_key
        // };
        //
        // function callback(error, response, body) {
        //   if (!error && response.statusCode == 200) {
        //     var info = JSON.parse(body);
        //     console.log(info.stargazers_count + " Stars");
        //     console.log(info.forks_count + " Forks");
        //   }
        // }
        //
        // request(options, callback);

    // var sg = require('sendgrid')(sendgrid_api_key);
    //
    // var fromEmail = new helper.Email(emailInfo.senderEmail);
    // var toEmail = new helper.Email(emailInfo.recipientEmail);
    // var subject =  emailInfo.subject;
    // var content = new helper.Content('text/plain', emailInfo.emailBody);
    // var mail = new helper.Mail(fromEmail, subject, toEmail, content);
    //
    // var request = sg.emptyRequest({
    //   method: 'POST',
    //   path: '/v3/mail/send',
    //   body: mail.toJSON()
    // });
    //
    //
    // sg.API(request, function (error, response) {
    //   if (error) {
    //     console.log('Error response received');
    //     res.render('layouts/error');
    //   }
    //   console.log(response.statusCode);
    //   console.log("the response body is: " + response.body);
    //   console.log(response.headers);
    // });
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


    //Invokes the method to send emails given the above data with the helper library
    // mailgun.messages().send(data, function (err, body) {
    //     //If there is an error, render the error page
    //     if (err) {
    //         res.render('layouts/error');
    //         console.log("got an error: ", err);
    //     }
    //     else {
    //         console.log(body);
    //     }
    // });
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
