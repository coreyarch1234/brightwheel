//Middleware
var express = require('express');
var exphbs = require('express-handlebars');

//App
var app = express();
var port = 3000;

//Controller Imports
var emails = require('./controllers/emails.js');
app.use('/', emails);

//Deploy
app.listen(process.env.PORT || port, function() {
    console.log("Brightwheel is live at: " + port)
});
