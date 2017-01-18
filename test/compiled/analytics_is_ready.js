'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('Env variable SEGMENT_API_KEY', function () {

	it('should set as environment variable', function () {
		/* eslint-disable */
		expect(__SEGMENT_API_KEY__).to.be.a('string');
		/* eslinst-enable */
	});
});

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
