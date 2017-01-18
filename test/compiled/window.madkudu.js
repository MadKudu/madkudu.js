'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('window.madkudu', function () {

	it('should emit the ready callback', function (done) {
		window.madkudu.ready(function () {
			console.log('MadKudu is ready');
			done();
		});
	});

	it('should have loaded madkudu into window.madkudu', function () {
		expect(window.madkudu).to.be.an('object');
	});

	it('should instantiate options and settings', function () {
		var madkudu = window.madkudu;

		expect(madkudu.VERSION).to.be.a('string');

		// Array
		expect(madkudu.forms).to.be.an('array');

	});

});

describe('settings', function () {


	it('should instantiate the settings on load', function () {
		var madkudu = window.madkudu;

		expect(madkudu.settings).to.be.an('object');
	});

	it('should have properties', function () {
		var madkudu = window.madkudu;

		expect(madkudu.settings.api_key).to.be.a('string');
		expect(madkudu.settings.form).to.be.an('object');
		expect(madkudu.settings.form.active).to.be.a('boolean');
		expect(madkudu.settings.form.campaigns).to.be.an('array');
		expect(madkudu.settings.form.has_campaigns).to.be.an('boolean');
	});
});
