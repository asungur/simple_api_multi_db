require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const DBUSER = process.env.DBUSER
const DBPASSWORD = process.env.DBPASSWORD

module.exports = {
  MONGODB_URI,
  PORT,
  DBUSER,
  DBPASSWORD
}
