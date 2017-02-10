'use strict'

var express = require('express')
var app = express()
const PORT = 3004

app.use(express.static('dist'))

app.listen(PORT, function () {
  console.log('Listening on port 3004')
})
