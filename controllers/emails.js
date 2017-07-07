var express = require('express');
var router = express.Router();


function validateEmail(email) {
    var re = /.+@.+\..+/i;
    return re.test(email);
}

function validateEmailFields(emailInfo){
    if(emailInfo.constructor === Object) {
        for (var i = 0; i < Object.keys(emailInfo).length; i++){
            if (Object.values(emailInfo)[i].length === 0){
                return false;
            }
        }
        return true;
    }
}
//Get Form Page for Email Info
router.get('/', function(req,res){
    res.render('layouts/home');
});

//Post Email
router.post('/email', function(req,res){
    var emailInfo = req.body;
    //Check to see if each input field has been filled in
    if (validateEmailFields(emailInfo)){
        if (validateEmail(emailInfo.emailBody)){
            console.log('everything is validated');
            res.send({emailInfo: emailInfo, validated: true});
        }else{
            console.log('Enter a valid email address');
            res.send({emailInfo: emailInfo, validated: false});
        }
    }else{
        console.log('Fill out all fields');
        res.send({emailInfo: emailInfo, validated: false});
    }
});

//Export
module.exports = router;
