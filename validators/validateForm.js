//Validate Email info. Make sure each field is filled in.

module.exports = function(emailInfo){
    if(emailInfo.constructor === Object) {
        //Loop through each key and check to see that the value (input field) has some data in it
        for (var i = 0; i < Object.keys(emailInfo).length; i++){
            if (Object.values(emailInfo)[i].length === 0){
                return false;
            }
        }
        return true;
    }
}
