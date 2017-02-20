'use strict'

// The server in utils need to be laucnhed
const express = require('express')
const app = express()
const Launcher = require('../../node_modules/webdriverio/build/lib/launcher')
const wdio = new Launcher('./test/browser/config/wdio.conf.js')

const PORT = 3004
// wdio.run()

app.use(express.static('dist'))
app.use(express.static('test/browser/samples'))

app.listen(PORT, function () {
  console.log('Listening on port 3004')
  return wdio.run()
    .then(code => {
      process.exit(code)
    }).catch(error => {
      console.error('Launcher failed to start the test', error.stacktrace)
      process.exit(1)
    })
})
