'use strict';

var chai = require('chai');
var expect = chai.expect;
const _ = require('lodash');

describe('madkudu', function () {

	var madkudu;

	// reset window.madkudu and call page
	before(function () {
		var mdkd = window.madkudu = [];
		mdkd.methods = ['identify', 'reset', 'group', 'ready', 'page', 'track', 'once', 'on', 'smart_form'];
		mdkd.factory = function (t) {
			return function () {
				var e = Array.prototype.slice.call(arguments);
				e.unshift(t);
				mdkd.push(e);
				return mdkd;

			};
		};
		for (var t = 0; t < mdkd.methods.length; t++) {
			var e = mdkd.methods[t];
			mdkd[e] = mdkd.factory(e);
		}
		mdkd.page();

		madkudu = require('../../lib');

	});

	it('should expose a .VERSION', function () {
		expect(madkudu.VERSION).to.be.a('string');
	});

	describe('window', function () {

		it('should change only the madkudu property',function () {

			const modified_properties = _.keys(_.omit(window.mk_window_changes,['_', 'onerror', 'setImmediate', 'clearImmediate']));
			/* @todo: the last two are not expected, getting rid of them for now but this needs to be fixed */
			// those last two should also not be there but they're a consequence of loading sinon (and we can't use noParse on sinon)

			console.log(modified_properties);

			expect(modified_properties).to.have.members(['madkudu', '__coverage__']);
			// __coverage__ is expected in this context

			it('should not modify window.addEventListener', function () {
				expect(window.addEventListener.toString()).to.not.equal(window.madkudu.addEventListener.toString());
			});

		});

	});

});
