$(document).ready(function() {

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
  });
