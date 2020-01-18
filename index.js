const Injector = require('./injector')
//const SmtpServer = require('./services/smtp')
const logger = new Injector('logger')
const smtp = new Injector('smtp')
const main = new Injector('main')
const database = new Injector('database')

