require('dotenv').config()

const config = {
  port: process.env.PORT,
  dbName: process.env.DB_NAME,
  jwtKey: process.env.JWT_KEY,
  sendGridApiKey: process.env.CHARLY_SENDGRID_API_KEY

}

module.exports = config