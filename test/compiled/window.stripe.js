'use strict'

var chai = require('chai')
var expect = chai.expect

describe('stripe checkout.js', function () {
  this.timeout(20000)

  // Wait for the loading of Stripe and the Checkout popup test
  it('should open the checkout popup', function (done) {
    // Stripe Handler
    window.handler.open({
      name: 'Stripe.com',
      description: '2 widgets',
      zipCode: true,
      amount: 2000
    })
    // Wait the opening of the popup
    setTimeout(() => {
      expect(window.mk_stripe_was_opened).to.be.true
      done()
    }, 5000)
  })

  it('should close the checkout popup', function (done) {
    // Stripe Handler
    window.handler.close()
    // Wait the closing of the popup
    setTimeout(() => {
      expect(window.mk_stripe_was_closed).to.be.true
      done()
    }, 5000)
  })

  it('should load madkudu in the window', function () {
    expect(window.madkudu).to.be.an('object')
  })
})
