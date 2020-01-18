const mysql = require('mysql')
// eslint-disable-next-line no-unused-vars
const colors = require('colors')
const dotenv = require('dotenv')
dotenv.config()

class Database {
  constructor(config) {
    if (!!Database.instance) {
      return Database.instance.connection;
    }

    Database.instance = this
    console.log('Instantiating Database =)'.bgGreen.black)
    this.connection = mysql.createConnection({
      user: (config && config.DB_USER) ? config.DB_USER : process.env.DB_USER,
      host: (config && config.DB_HOST) ? config.DB_HOST : process.env.DB_HOST,
      database: (config && config.DB_NAME) ? config.DB_NAME : process.env.DB_NAME,
      password: (config && config.DB_PASS) ? config.DB_PASS : process.env.DB_PASS,
      port: (config && config.DB_PORT) ? parseInt(config.DB_PORT) : parseInt(process.env.DB_PORT)
    })

    this.connection.connect(err => {
      if (err) {
        console.error('Error acquiring client', err.stack)
        process.exit()
      }
      console.log(`connected to MySQL as id: ${this.connection.threadId}`)
    })

    return this.connection
  }
}

module.exports = Database