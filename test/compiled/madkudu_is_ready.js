'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('madkudu.ready', function () {

	before(function (done) {
		window.madkudu.ready(function () {
			console.log('MadKudu is ready');
			done();
		});
	});

	it('should wait to load segment madkudu', function () {
		expect(window.madkudu).to.be.an('object');
	});

});
