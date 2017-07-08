# Brightwheel Full Stack Engineering Task

This project involves creating a service that provides an abstraction between two different email service providers. This way, if one service goes down, it will be easy to failover to a different provider.To accomplish this, there were 5 general steps:


1. Creating an easy-to-use form for the email information submission.
2. Implement the HTTP Service to accept the POST request with the email information.
3. Validate the email information.
4. Implement Mailgun and Sendgrid.
5. Implement failover mechanism. 


 * **Note:** I will be linking important files in this documentation. Feel free to click and view in a separate tab. I will be going over the important methods and implementations, not every single detail.

Before I go over the steps, here is the installation information:

### Dependencies
* Node.js (>= v6.0.0)
* Body-Parser (>= 1.17.2)
* Express-Handlebars (>= 3.0.0)
* Request (>= 2.81.0)
* Unirest (>= 0.5.1)

### Installation
* Install node dependencies with:
  ```zsh
  npm install
  ```

### Running Application
* Run server.js on port 3000 (I recommend using [nodemon](https://github.com/remy/nodemon)):
  ```zsh
  nodemon
  ```

# Step 1 - The Email Form:

There are 6 input fields the user must fill out to send an email:
1. Recipient Email
2. Recipient Name
3. Sender Email
4. Sender Name
5. Subject Line
6. Email Body

I created a [form](views/layouts/home.handlebars) with these 6 fields and I styled it with CSS shown [here](public/styles/application.css). Each field in the form has a specific id to be referenced later:

```
<div class="heading-container">
          <form class="form-container" id="send-email">
              <div class="form-input">
                  <h3></h3>
              </div>
              <div class="form-input">
                  <h3>Recipient Email</h3>
                  <input type="text" id="recipient-email" name="recipientEmail" placeholder="ENTER VALID EMAIL">
              </div>
              <div class="form-input">
                  <h3>Recipient Name</h3>
                  <input type="text" id="recipient-name" name="recipientName" placeholder="ENTER NAME">
              </div>
              <div class="form-input">
                  <h3>Sender Email</h3>
                  <input type="text" id="sender-email" name="senderEmail" placeholder="ENTER VALID EMAIL">
              </div>
              <div class="form-input">
                  <h3>Sender Name</h3>
                  <input type="text" id="sender-name" name="senderName" placeholder="ENTER VALID NAME">
              </div>
              <div class="form-input">
                  <h3>Subject Line</h3>
                  <input type="text" id="subject" name="subject" placeholder="SUBJECT LINE">
              </div>
              <div class="form-input">
                  <h3>Email Body</h3>
                  <!-- <input type="text" id="email-body" placeholder="ENTER EMAIL BODY"> -->
                  <textarea name="emailBody" id="email-body" cols="50" rows="10" placeholder="ENTER EMAIL BODY"></textarea>
              </div>
              <div class="submit-button">
                  <input type="submit" id="submit-info">
              </div>
          </form>
      </div>
```
![ScreenShot](http://i.imgur.com/kGUCqH7.png)

# Step 2 - Email Information Post Request:

Once the user types in their answers in the form, I store each answer in a variable and create a JSON object with it.  This is shown in the script file [here](/public/scripts/email.js), where I create the ```emailObj``` variable.

```
// SUBMIT EMAIL  POST FORM
$('#submit-info').click(function(event) {
    event.preventDefault();
    //Grab all email info data and store in variables
    var recipientEmail = $('#recipient-email').val(); // to The email address to send to
    var recipientName = $('#recipient-name').val(); //to_name The name to accompany the email
    var senderEmail = $('#sender-email').val(); //from The email address in the from and reply fields
    var senderName = $('#sender-name').val(); //from_name The name to accompany the from/reply emails
    var subject = $('#subject').val(); //subject The subject line of the email
    var emailBody = $('#email-body').val(); //body The HTML body of the email
    var emailBody = $('#email-body').val(); //body The HTML body of the email

    //Create email JSON object
    var emailObj = {};
    emailObj['recipientEmail'] = recipientEmail;
    emailObj['recipientName'] = recipientName;
    emailObj['senderEmail'] = senderEmail;
    emailObj['senderName'] = senderName;
    emailObj['subject'] = subject;
    emailObj['emailBody'] = emailBody //Get rid of html if there is any
```

After this, I use an AJAX request  to post to ```'/email'```:

```
$.ajax({
      type: 'POST',
      url: '/email',
      data: emailObj,
      dataType: 'JSON',
      fail: function() {
        alert(error.message);
      },
      success: function(validatedResult) {
          if (validatedResult.validateEmailFields && validatedResult.validateRecipientEmail && validatedResult.validateSenderEmail){
              console.log('great! your email will be sent');
              console.log(validatedResult);
              $('#correct-answer-alert').html("<h2>Your email has been sent!</h2>");
          }
          else if (validatedResult.validateEmailFields == false) {
               console.log('you forgot some fields');
               console.log(validatedResult);
               $('#correct-answer-alert').html("<h2>Fill out all fields</h2>");
          }
          else if (validatedResult.validateRecipientEmail == false){
              console.log('enter a valid recipient email address');
              console.log(validatedResult);
              $('#correct-answer-alert').html("<h2>Enter a valid recipient email</h2>");
          }
          else if (validatedResult.validateSenderEmail == false){
              console.log('enter a valid sender email address');
              console.log(validatedResult);
              $('#correct-answer-alert').html("<h2>Enter a valid sender email</h2>");
          }
      }
    });
   });
```

I will explain the success function soon. Once this request hits the ```'/email'``` endpoint in my email controller [file](controllers/email.js), I store the ```emailObj``` in ```emailInfo```:

```
//Send Email through a post request
router.post('/email', function(req,res){
    var emailInfo = req.body;

```
I also strip the ```emailBody``` of its HTML in this way:

```
//Strip HTML from email body
    emailInfo.emailBody = emailInfo.emailBody.replace(/<(?:.|\n)*?>/gm, '');
```

The next step is to validate the data. 

# Step 3 - Validate:

I create a function to validate the email. I am testing that the email has an '@' and a '.'. 

Another option would have been to use an extremely cumbersome Regular Expression for a more rigorous test, but since the email will be sent to this address, there is no need to. If the email is invalid, it will be bounced back with an error. This [article](https://davidcel.is/posts/stop-validating-email-addresses-with-regex/) sums up why regular expressions may not be the best idea in this situation. 

The function I used in my [validateEmail](validators/validateEmail.js) file is: 

```
//Validate Email. Make sure it has, '@' and a '.'

module.exports = function(email) {
    var re = /.+@.+\..+/i;
    return re.test(email);
}
```
The next step is to make sure each input field was filled in:

```
//Validate Email info. Make sure each field is filled in.

module.exports = function(emailInfo){
    if(emailInfo.constructor === Object) {
        //Loop through each key and check to see that the value (input field) has some data in it
        var inputs_length = Object.keys(emailInfo).length;
        for (var i = 0; i < inputs_length; i++){
            if (Object.values(emailInfo)[i].length === 0){
                return false;
            }
        }
        return true;
    }
}

```
This function takes in ```emailInfo```, which is an object with each input field as a key. I first make sure that ```emailInfo``` is an object and then I loop through its length (which should be 6). At each iteration, I check to see if the length of the value is 0, where the value is the answer the user submitted. If it is 0, then the field is empty and I return false. 

Now, I export these functions to my email controller [file](controllers/email.js). In the ```'/email'``` route, I create an ```isValidated``` variable that will be true when the data is properly validated:

```
//send the email only if this is true
    var isValidated = false;
```
Then, I validate that all of the input fields are filled in. If they are, I check to see if each email is valid (the ```recipientEmail``` and the ```senderEmail```). 

```
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

```
If the input fields and the email addresses are valid, then I set ```isValidated``` to true. If either of the email addresses are invalid or the input fields are invalid, then I send back ```validatedResult``` with ```res.send(validatedResult)```. ```validatedResult``` is an object that holds ```emailInfo``` and 3 bools that tell if the emails and/or input fields are valid;

```
    //This will carry the email information and and validation results
    var validatedResult = {
        emailInfo: emailInfo,
        // True if all of the fields were filled in.
        //They are all true by default
        validateEmailFields: true,
        validateRecipientEmail: true,
        validateSenderEmail: true
    }
```
This gets sent back to my AJAX request success function. I check to see what is invalid, and if any field is invalid, I show an error alert message on the form. Here is an example of an invalid recipient email input message:

![ScreenShot](http://i.imgur.com/lxIL3pl.png)

Now that the validation is complete, I implement Mailgun. 

# Step 4 - Mailgun and Sendgrid:

To implement both Mailgun and Sendgrid, I made an account and received an API key. Mailgun also required a domain. I stored this information in a '.env' and included it in a '.gitignore' so that my API keys would not be exposed when I commit. 

I export this information in my [config](config) files:

```
require('dotenv').config()

module.exports = {
    //Your api key, from Mailgun’s Control Panel
    api_key: process.env.MAIL_GUN_API_KEY,
    //Your domain, from the Mailgun Control Panel
    domain: process.env.MAIL_GUN_DOMAIN
}

```

```
require('dotenv').config()

module.exports = {
    //Your SENDGRID api key
    api_key: process.env.SENDGRID_API_KEY

}
```

In my email controller [file](controllers/email.js), I create 2 functions that implement both SendGrid and Mailgun respectively. 

For SendGrid:

```
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
```
I create a data object that stores all of the input information. I then create an options object that holds the essential information for the POST request including the API url and the body. Once this is done, I make the request. I use the low level HTTP Client module called, '[request](https://www.npmjs.com/package/request)'. This is my alternative to using the built in SendGrid library. 

Here is the Mailgun function:

```
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
```

This works similarly, however, I use '[unirest](http://unirest.io/)', a lightweight low level HTTP client. This is my alternative to using Mailguns client library for post requests. 

I used both request and unirest for its simplicity and because of its abundant usage in the Nodejs community. I tend to use packages that have a lot of documentation associated with them, which is the case with popular packages like request and unirest.

# Step 5 - Failover Mechanism:

Now that I have both post request functions, I can use that in my '/email' endpoint function:

```
//If the email information has been validated, send email
    if (isValidated){
        //To use sendgrid, call useSendGrid()
        //To use mailgun, call useMailGun()
        useSendGrid(emailInfo);
        // useMailGun(emailInfo);
        res.send(validatedResult);
    };
```

If ```isValidated``` is true, we can use either SendGrid or Mailgun. By default, I have SendGrid set. If we need to failover to Mailgun, it is as easy as commenting out the ```useSendGrid``` function and uncommenting the ```useMailGun``` function. This makes it super easy to prevent downtime during an email service provider outage.

# Tradeoffs and Implementations if I had more time:



 
