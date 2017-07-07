//Validate Email info. Make sure each field is filled in.

module.exports = function(emailInfo){
    if(emailInfo.constructor === Object) {
        for (var i = 0; i < Object.keys(emailInfo).length; i++){
            if (Object.values(emailInfo)[i].length === 0){
                return false;
            }
        }
        return true;
    }
}
