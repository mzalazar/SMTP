const EventEmitter = require('events')
const SMTPServer = require("smtp-server").SMTPServer
const simpleParser = require('mailparser').simpleParser
const colors = require('colors')

const options = {
  lmtp: false,
  secure: false,
  authOptional: true,
}

class SmtpServer extends EventEmitter {
  constructor() {
    if (!!SmtpServer.instance) {
      console.log('Returning instance of smtpServer'.bgGreen.black)
      return SmtpServer.instance
    }
    super()

    SmtpServer.instance = this
    console.log('Instantiating SmtpServer =)'.bgYellow.black)
    const self = this
    this.server = new SMTPServer({
      ...options,
      onData(stream, session, callback) {
        //        stream.pipe(process.stdout) // print message to console
        simpleParser(stream, {}, (err, parsed) => {
          if (err) throw err
          //        console.log(parsed)
          //      console.log('FROM: ', parsed.headers.get('from'))
          //    console.log('TO: ', parsed.headers.get('to'))
          self.emit('email', parsed)
        })
        stream.on("end", callback)
      }
    })
    return this.server
  }
}

module.exports = SmtpServer
