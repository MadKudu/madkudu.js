//
// const chai = require('chai');
// const expect = chai.expect;
// const _ = require('lodash');
//
// describe('forms', function () {
//
// 	var madkudu = window.madkudu;
//
// 	describe('load', function () {
//
// 		it('should exist', function () {
// 			expect(madkudu.forms).to.be.an('array');
// 			expect(madkudu.forms).to.have.length.of.at.least(1);
// 		});
//
// 		it('should have a reference to window.madkudu', function () {
// 			var form = madkudu.forms[0];
// 			expect(form.madkudu).to.equal(window.madkudu);
// 		});
//
// 		it('should have settings', function () {
// 			var form = madkudu.forms[0];
// 			// madkudu
// 			expect(form.madkudu).to.be.an('object');
//
// 			// settings
// 			expect(form.settings).to.be.exist;
// 			expect(form.settings).to.be.an('object');
//
// 		});
//
// 		describe('settings', function () {
//
// 			var form = window.madkudu.forms[0];
//
// 			it('should have properties', function () {
//
// 				// settings properties
// 				expect(form.settings._id).to.be.a('string');
// 				expect(form.settings.active).to.be.a('boolean');
// 				expect(form.settings.created_at).to.be.a('string');
// 				expect(form.settings.custom_css).to.be.a('string');
// 				expect(form.settings.custom_js).to.be.a('string');
// 				expect(form.settings.description).to.be.a('string');
// 				expect(form.settings.name).to.be.a('string');
//
// 				// tenant Object
// 				expect(form.settings.tenant).to.be.an('object');
// 				expect(form.settings.tenant._id).to.be.an('number');
// 				expect(form.settings.tenant.api_key).to.be.a('string');
// 				expect(form.settings.tenant.domain).to.be.a('string');
//
// 				// expect(form.settings.trigger).to.be.a('object');
// 				expect(form.settings.updated_at).to.be.a('string');
//
// 				// url_conditions array
// 				expect(form.settings.url_conditions).to.be.an('array');
// 				expect(form.settings.url_conditions).to.be.an('array');
// 				expect(form.settings.url_conditions[0]._id).to.be.a('string');
// 				expect(form.settings.url_conditions[0].match_type).to.be.a('string');
// 				expect(form.settings.url_conditions[0].value).to.be.a('string');
//
// 				// variations array
// 				expect(form.settings.variations).to.be.an('array');
//
// 			});
// 		});
//
// 	});
//
// 	describe('load variation', function () {
//
// 		var form = window.madkudu.forms[0];
//
// 		it('should instantiate a variation', function () {
//
// 			expect(form.variation).to.be.an('object');
// 			var actions = ['load', 'qualify', 'qualify_results', 'qualified', 'not_qualified', 'request', 'signup'];
// 			_.each(actions, action => {
// 				expect(form.variation['on_' + action]).to.be.an('object');
// 				expect(form['_on_' + action]).to.be.a('function');
// 				expect(form['on_' + action]).to.be.a('function');
// 			});
//
// 		});
// 	});
//
// });


// const sinon = require('sinon');
//
// describe('madkudu / form - logic', function () {
//
// 	var form = window.madkudu.forms[0];
//
// 	describe('qualify', function () {
//
// 		it('should call the users qualify function ', function () {
// 			// Fake the function call
// 			var stub_user_qualify = sinon.stub(form.madkudu.user(), 'qualify', function (cb) {
// 				// Check if the qualify is called with a function
// 				expect(cb).to.be.a('function');
// 			});
//
// 			var stub_track = sinon.stub(form, 'track', function (res) {
// 				// Check if the parameter of the function
// 				expect(res).to.be.a('string');
// 			});
//
// 			var stub_on_qualify = sinon.stub(form, 'on_qualify');
//
// 			// Call the function to test
// 			form.qualify({ email: 'elon@tesla.com' });
//
// 			// Check if all happening correctly
// 			sinon.assert.calledOnce(stub_user_qualify);
// 			sinon.assert.calledOnce(stub_track);
// 			sinon.assert.calledOnce(stub_on_qualify);
//
// 			// Restore the functions
// 			stub_user_qualify.restore();
// 			stub_track.restore();
// 			stub_on_qualify.restore();
//
// 		});
// 	});
//
// 	describe('qualify_callback', function () {
//
// 		it('should call qualify_results', function () {
// 			var stub_track = sinon.stub(form, 'track', function (res, obj) {
// 				// Check if the parameters of the function
// 				expect(res).to.be.a('string');
// 				expect(obj).to.be.an('object');
// 				expect(obj).property('customer_fit_segment');
// 				expect(obj).property('qualified');
// 			});
//
// 			// call the function to test
// 			form.qualify_results('abc');
//
// 			// Check if all happening correctly
// 			sinon.assert.calledOnce(stub_track);
//
// 			stub_track.restore();
//
// 		});
// 	});
// });
