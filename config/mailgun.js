require('dotenv').config()

module.exports = {
    //Your api key, from Mailgun’s Control Panel
    api_key: process.env.API_KEY,
    //Your domain, from the Mailgun Control Panel
    domain: process.env.DOMAIN
}
