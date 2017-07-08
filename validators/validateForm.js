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
