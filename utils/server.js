'use strict';

var express = require('express')
var app = express()

app.use(express.static('dist'));

app.listen(3004, function () {
	console.log('Listening on port 3004');
});

