const main = (database, smtp, logger) => {
  smtp.server.listen(2525, 'localhost', 100, () => console.log('SMTP listening on port 2525'))
  smtp.on('email', data => {
    console.log('============ DESDE main.js ============')
    console.log(data)
  })
}

module.exports = main