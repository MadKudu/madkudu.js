'use strict'

const Emitter = require('component-emitter')

var Form = function (madkudu, settings) {
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

  var variationId = 0
  this.variation = this.settings.variations[variationId] || {}
  // for each of the event, add the user-defined function to the form
  each(event => {
    var method = 'on_' + event
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

Form.prototype.normalize = function (props) {
  props = props || {}
  props.email = props.email || this.madkudu.user().traits().email
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
  var traits = this.madkudu.user().traits()
  this.track('qualified', { customer_fit_segment: traits.customer_fit_segment, qualified: traits.qualified })
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
  var traits = this.madkudu.user().traits()
  this.track('qualify_results', { customer_fit_segment: traits.customer_fit_segment, qualified: traits.qualified })
  this.on_qualify_results()
  traits.qualified ? this.qualified() : this.not_qualified()
}

Form.prototype.set_email = function (email) {
  this.email = email
  this.madkudu.identify({ email: email })
}

Form.prototype.is_email = function (email) {
  var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // eslint-disable-line
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
      var regex = new RegExp(condition.value, 'i')
      return regex.test(document.location.href)
    }
  } catch (e) {
    this.log(e)
  }
}

Form.prototype.verify_location = function () {
  var url_conditions = this.settings.url_conditions || []
  var match = false
  for (var i = 0; i < url_conditions.length; i++) {
    var condition = url_conditions[i]
    if (this._test_url_condition(condition)) {
      return true
    }
  }

  return match
}

Form.prototype.track_element = function (elements, events, action, properties) {
  events = events || 'blur'
  if (!elements) {
    return this
  }
  // always arrays, handles jquery
  if (type(elements) === 'element') {
    elements = [elements]
  }

  var on = component_event.bind

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
  var handler = (el, e) => {
    return {
      cta: {
        type: type,
        value: e.target ? e.target.value : undefined
      }
    }
  }
  this.track_element(elements, events, 'request', handler)
}

// Form.prototype.track_submit = function(forms, event, properties) {
//   if (!forms) return this;
//   // always arrays, handles jquery
//   if (type(forms) === 'element') forms = [forms];
//
//   each(el => {
//     if (type(el) !== 'element') throw new TypeError('Must pass HTMLElement to `track_submit`.');
//     function handler(e) {
//       prevent(e);
//
//       var ev = is.fn(event) ? event(el) : event;
//       var props = is.fn(properties) ? properties(el) : properties;
//
//       // self.track(ev, props);
//       console.log(ev, props);
//
//       this._callback(function() {
//         el.submit();
//       });
//     }
//
//     // Support the events happening through jQuery or Zepto instead of through
//     // the normal DOM API, because `el.submit` doesn't bubble up events...
//     var $ = window.jQuery || window.Zepto;
//     if ($) {
//       $(el).submit(handler);
//     } else {
//       on(el, 'submit', handler);
//     }
//   }, forms);
//
//   return this;
// };

Form.prototype.load = function () {
  if (!this.loaded) {
    this.loaded = true
    this.log('madkudu smart form initialized')
    this.track('loaded')
    // execute the user defined on load action
    this.on_load()
    // parse the query string
    this.parse_query_string()
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
