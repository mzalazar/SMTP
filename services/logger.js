const dotenv = require('dotenv')
dotenv.config()

class Logger {
  constructor() {
    if (!!Logger.instance) {
      return Logger.instance.logger
    }
    console.log('Instantiating Logger =)'.bgGreen.black)
    // create a rolling file logger based on date/time that fires process events
    const opts = {
      errorEventName: 'server',
      logDirectory: `${process.env.ROOT_DIR}/logs`, // NOTE: folder must exist and be writable...
      fileNamePattern: 'roll-<DATE>.log',
      dateFormat: 'MM.DD'
    }
    this.logger = require('simple-node-logger').createRollingFileLogger(opts)
    Logger.instance = this
    return this.logger
  }
}

module.exports = Logger