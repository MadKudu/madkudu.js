'use strict'

/* eslint-disable */

var chai = require('chai')
// var expect = chai.expect;
chai.should()


describe('functional / smart form modal', function () {
	const browser = global.browser
	const modal_options = {
		calendlyUrl: 'https://calendly.com/sam_at_madkudu/30min',
		title: 'Get to know us',
		subtitle: 'Learn about all the cool features that MadKudu has to offer.',
		cta_yes: 'Book time with an expert!',
		cta_no: 'No thanks.'
	};

	it('should open the modal', function () {
		browser
		 	.url('/mk_smart_form_simple.html?email=elon@tesla.com')
		browser
		 	.execute(function(modal_options) {
				window.madkudu.forms[0].show_modal(modal_options)
			}, modal_options)
		browser
			.isVisible('.madkudu_modal')
			.should.be.true
	})

	it('should close the modal', function () {
		browser
			.click('.madkudu_modal__cancel')
			.isVisible('.madkudu_modal')
			.should.be.false
	})

	it.skip('should close the modal arround the box', function () {
		browser
			.execute(function(modal_options) {
				window.madkudu.forms[0].show_modal(modal_options)
			}, modal_options)

		browser
			.execute(function () {
				window.$('.madkudu_modal__overlay').click()
			})
		browser
			.isVisible('.madkudu_modal')
			.should.be.false
	})

	it('should open the calendar', function (){
		browser
			.execute(function(modal_options) {
				window.madkudu.forms[0].show_modal(modal_options)
			}, modal_options)
		browser
			.click('.madkudu_modal__accept')
			.isVisible('.calendly-overlay > div.calendly-popup > div.calendly-popup-content > iframe')
			.should.be.true
	})

	it('should close the calendar and the modal', function () {
		browser
			.click('.calendly-popup-close')
		browser
			.isVisible('.calendly-overlay > div.calendly-popup > div.calendly-popup-content > iframe')
			.should.be.false
		browser
			.isVisible('.madkudu_modal')
			.should.be.false
	})

	it.skip('should close the calendar and the modal arround the calendar', function () {
		browser
			.execute(function(modal_options) {
				window.madkudu.forms[0].show_modal(modal_options)
			}, modal_options)
			.click('.madkudu_modal__accept')

    browser
      .isVisible('.calendly-overlay > div.calendly-popup > div.calendly-popup-content > iframe')
      .should.be.true
    browser
			.execute(function () {
        window.$('.calendly-close-overlay').click()
			})
		browser
			.isVisible('.calendly-overlay > div.calendly-popup > div.calendly-popup-content > iframe')
			.should.be.false
		browser
			.isVisible('.madkudu_modal')
			.should.be.false
	})

	it('should be accescile', function () {
		browser
			.execute(function(modal_options) {
				window.madkudu.forms[0].show_modal(modal_options)
			}, modal_options)

    browser
      .setValue('input[type="email"]', 'elon@tesla.com')
      .hasFocus('input[type="email"]')
	})
})
