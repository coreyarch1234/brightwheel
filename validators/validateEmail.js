//Validate Email. Make sure it has, '@' and a '.'

module.exports = function(email) {
    var re = /.+@.+\..+/i;
    return re.test(email);
}
