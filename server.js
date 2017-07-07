//Middleware
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

//App
var app = express();
var port = 3000;

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
