'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('analytics.ready', function () {

	it('should emit the ready callback', function (done) {
		this.timeout(20000);
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
