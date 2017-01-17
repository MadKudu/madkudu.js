'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('analytics.ready', function () {

	before(function (done) {
		window.analytics.ready(function () {
			console.log('Analytics is ready');
			done();
		});
	});

	it('should wait to load segment analytics', function () {
		expect(window.analytics).to.be.an('object');
	});

});
