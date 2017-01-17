'use strict';

var chai = require('chai');
var expect = chai.expect;
const _ = require('lodash');

describe('window', function () {

	it('should change only the madkudu property',function () {

		const modified_properties = _.keys(_.omit(window.mk_window_changes,['_', 'onerror', '__coverage__']));
		/* @todo: the last two are artefact from Karma */

		console.log(modified_properties);

		expect(modified_properties).to.have.members(['madkudu']);


		it('should not modify window.addEventListener', function () {
			expect(window.addEventListener.toString()).to.not.equal(window.madkudu.addEventListener.toString());
		});

	});

});

describe('window.madkudu', function () {

	it('should have loaded madkudu into window.madkudu', function () {
		expect(window.madkudu).to.be.an('object');
	});

	it('should instantiate options and settings', function () {
		var madkudu = window.madkudu;

		expect(madkudu.VERSION).to.be.a('string');

		// Objects
		expect(madkudu.options).to.be.an('object');
		expect(madkudu.settings).to.be.an('object');
		expect(madkudu.settings.api_key).to.be.an('string');

		// Array
		expect(madkudu.forms).to.be.an('array');

	});

});

describe('settings', function () {

	var madkudu = window.madkudu;

	it('should instantiate the settings on load', function () {
		expect(madkudu.settings).to.be.an('object');
	});

	it('should have properties', function () {
		console.log(madkudu.settings);
		expect(madkudu.settings.api_key).to.be.a('string');
		expect(madkudu.settings.form).to.be.an('object');
		expect(madkudu.settings.form.active).to.be.a('boolean');
		expect(madkudu.settings.form.campaigns).to.be.an('array');
		expect(madkudu.settings.form.has_campaigns).to.be.an('boolean');
	});
});
