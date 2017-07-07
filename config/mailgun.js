require('dotenv').config()

module.exports = {
    //Your api key, from Mailgun’s Control Panel
    api_key: process.env.MAIL_GUN_API_KEY,
    //Your domain, from the Mailgun Control Panel
    domain: process.env.MAIL_GUN_DOMAIN
}
