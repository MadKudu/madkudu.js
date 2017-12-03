const Emitter = require('component-emitter')
const modalTemplate = require('./modal.pug')
require('./madkudu.less')

const Form = function (madkudu, settings) {
  this.madkudu = madkudu
  this.settings = settings || {}
  this.events = ['load', 'qualify', 'qualify_results', 'qualified', 'not_qualified', 'request', 'signup']
}

/**
 * Mix in event emitter.
 */

Emitter(Form.prototype)

/**
 * Initialize the form
 */

Form.prototype.init = function () {
  this.initialize_variation()
  this.initialize_events()
  this.emit('initialized')
}

/**
 * Initialize all the user defined function
 */

Form.prototype.initialize_variation = function () {
  if (!this.settings.variations) {
    return this
  }

  this.settings.trigger = this.settings.trigger || { js: '' }
  this._trigger = new Function('form', '$', this.settings.trigger.js).bind(this) // eslint-disable-line
  this.trigger = () => this._trigger(this, $)

  const variationId = 0
  this.variation = this.settings.variations[variationId] || {}
  // for each of the event, add the user-defined function to the form
  each(event => {
    const method = 'on_' + event
    this.variation[method] = this.variation[method] || {} // make sure the object exists
    this.variation[method].js = this.variation[method].js || '' // make sure the js exists
    // create a function using the string and bind it to the form
    this['_' + method] = new Function('form', '$', this.variation[method].js).bind(this) // eslint-disable-line
    this[method] = () => this['_' + method](this, $) // call the previous method with this and $ as arguments (to make them available in the execution context)
  }, this.events)
}

Form.prototype.initialize_events = function () {
  each(event => {
    this.on(event, props => {
      this[event](props)
    })
  }, this.events)
}

Form.prototype.log = function (message) {
  console.log(message)
}

Form.prototype.normalize = function (props = {}) {
  props.email = props.email || this.madkudu.user().traits().email
  props.userId = props.userId || this.madkudu.user().id()
  props.campaign = props.campaigns || { _id: this.settings._id, name: this.settings.name }
  return props
}

Form.prototype.track = function (event, props) {
  props = this.normalize(props)
  this.madkudu.track(event, props)
}

Form.prototype.parse_query_string = function () {
  this.query = querystring.parse(window.location.search)
  this.emit('qualify', { email: this.query.email })
}

Form.prototype.qualified = function () {
  const user = this.madkudu.user()
  this.track('qualified', { customer_fit_segment: user.customer_fit_segment(), qualified: user.is_qualified() })
  this.on_qualified()
}

Form.prototype.not_qualified = function () {
  this.on_not_qualified()
}

Form.prototype.request = function (props) {
  this.track('request', props)
  this.on_request()
}

Form.prototype.qualify_results = function () {
  var user = this.madkudu.user()
  var is_qualified = user.is_qualified()
  this.track('qualify_results', { customer_fit_segment: user.customer_fit_segment(), qualified: is_qualified })
  this.on_qualify_results()
  is_qualified ? this.qualified() : this.not_qualified()
}

Form.prototype.set_email = function (email) {
  this.email = email
  this.madkudu.identify({ email })
}

Form.prototype.is_email = function (email) {
  const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line
  return regexp.test(email)
}

Form.prototype.qualify = function (props) {
  if (props && props.email && props.email !== this.email && this.is_email(props.email)) {
    this.set_email(props.email)
    this.track('qualify', props)
    this.madkudu.user().qualify((err, results) => {
      if (err) {
        return this.log(err)
      }
      this.qualify_results(results)
    })
  }
  this.on_qualify()
}

Form.prototype._test_url_condition = function (condition) {
  try {
    if (condition.match_type === 'regex') {
      return condition.value.test(document.location.href)
    } else {
      const regex = new RegExp(condition.value, 'i')
      return regex.test(document.location.href)
    }
  } catch (e) {
    this.log(e)
  }
}

Form.prototype.verify_location = function () {
  const url_conditions = this.settings.url_conditions || []
  for (var i = 0; i < url_conditions.length; i++) {
    const condition = url_conditions[i]
    if (this._test_url_condition(condition)) {
      return true
    }
  }
  return false
}

Form.prototype.track_element = function (elements, events = 'blur', action, properties) {
  if (!elements) {
    return this
  }
  // always arrays, handles jquery
  if (type(elements) === 'element') {
    elements = [elements]
  }

  const on = component_event.bind

  each(el => {
    if (type(el) !== 'element') {
      throw new TypeError('Must pass HTMLElement to `track_element`.')
    }
    on(el, events, e => {
      var props = is.fn(properties) ? properties(el, e) : properties
      var href = el.getAttribute('href') ||
        el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
        el.getAttribute('xlink:href')

      this.emit(action, props)

      if (href && el.target !== '_blank' && !isMeta(e)) {
        prevent(e)
        this.madkudu._callback(() => {
          window.location.href = href
        })
      }
    })
  }, elements)

  return this
}

Form.prototype.track_input = function (elements, events) {
  this.track_element(elements, events, 'qualify', el => { return { email: el.value } })
}

Form.prototype.track_cta = function (elements, events, type) {
  const handler = (el, e) => {
    return {
      cta: {
        type: type,
        value: e.target ? e.target.value : undefined
      }
    }
  }
  this.track_element(elements, events, 'request', handler)
}

Form.prototype.load_external = function (type, src) {
  var tag = type === 'script' ? 'script' : 'link'
  var e = document.createElement(tag)
  if (type === 'script') {
    e.type = 'text/javascript'
    e.src = src
  } else if (type === 'stylesheet') {
    e.rel = 'stylesheet'
    e.href = src
  }
  e.async = !0
  var n = document.getElementsByTagName('script')[0]
  n.parentNode.insertBefore(e, n)
}

Form.prototype.load_external_script = function (src) {
  this.load_external('script', src)
}

Form.prototype.load_external_css = function (src) {
  this.load_external('stylesheet', src)
}

Form.prototype.show_calendar = function (options = {}) {
  if (options.calendlyUrl) {
    // add a listener to close the modal
    $(document).on('click', ['.calendly-close-overlay', '.calendly-popup-close'], this.dismiss_modal.bind(this))
    // load the Calendly widget
    window.Calendly && window.Calendly.showPopupWidget(options.calendlyUrl)
  }
}

Form.prototype.show_modal = function (options = {}) {
  this.track('modal')
  // load the calendly dependency
  // note: a race condition between this and the click on the modal is still possible
  if (options.calendlyUrl) {
    this.load_external_css('https://calendly.com/assets/external/widget.css')
    this.load_external_script('https://calendly.com/assets/external/widget.js')
  }

  this.hide_modal()
  const modalHtml = modalTemplate(options)
  $('body').prepend(modalHtml)

  // when the visitor click on accept, send a request event and show the calendar
  $('.madkudu_modal__accept').on('click', () => {
    this.emit('request')
    this.show_calendar(options)
  })

  $('.madkudu_modal__cancel').on('click', this.dismiss_modal.bind(this))
}

Form.prototype.dismiss_modal = function () {
  this.track('modal_dismiss')
  this.hide_modal()
}

Form.prototype.hide_modal = function () {
  $('.madkudu_modal').remove()
}

Form.prototype.load = function () {
  if (!this.loaded) {
    this.loaded = true
    this.log('madkudu smart form initialized')
    this.settings.debug && this.track('loaded')
    // execute the user defined on load action
    this.on_load()
    // initialize the listeners
    this.trigger()
  }
}

Form.prototype.start = function () {
  if (this.verify_location()) {
    this.load()
  }
}

module.exports = Form
