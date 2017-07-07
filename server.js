//Middleware
var express = require('express');
var exphbs = require('express-handlebars');

//App
var app = express();
var port = 3000;

// Setting templating engine
app.engine('handlebars', exphbs({defaultLayout: 'home'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

//Controller Imports
var emails = require('./controllers/emails.js');
app.use('/', emails);

//Deploy
app.listen(process.env.PORT || port, function() {
    console.log("Brightwheel is live at: " + port)
});
