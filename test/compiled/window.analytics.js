'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('analytics.ready', function () {

	before(function (done) {
		// Wait the loading of analytics.js
		window.analytics.ready(function () {
			done();
		});
	});

	it('should wait to load segment analytics', function () {
		expect(window.analytics).to.be.an('object');
	});

	it('should load madkudu in the window', function () {
		expect(window.madkudu).to.be.an('object');
	});

});
