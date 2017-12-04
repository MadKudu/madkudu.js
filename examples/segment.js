/* eslint-disable no-undef */

// load ChiliPiper javascript
form.load_external_script('https://js.chilipiper.com/marketing.js')

// listen to form changes and store data locally in case augmentation does not return desired data
var form_data = {}
$('input[name="name"]').blur(function () {
  var full_name = $('input[name="name"]').val()
  var full_name_array = full_name.split(' ')
  form_data.first_name = full_name_array.slice(0, full_name_array.length > 1 ? full_name_array.length - 1 : 1).join(' ')
  form_data.last_name = full_name_array.length > 1 ? full_name_array.slice(full_name_array.length - 1, full_name_array.length).join(' ') : ' '
})
$('input[name="company"]').blur(function () {
  form_data.company = $('input[name="company"]').val()
})
$('input[name="phone"]').blur(function () {
  form_data.phone = $('input[name="phone"]').val()
})

// function to check when the next page is displayed
var once_url_change = function (callback) {
  var old_ref = window.location.href
  var check_for_changes = setInterval(function () {
    if (old_ref !== window.location.href) {
      // stop checking and call callback
      clearInterval(check_for_changes)
      callback()
    } else {
      old_ref = window.location.href
    }
  }, 50)
}

var send_to_chili_piper = function () {
  var traits = madkudu.user().traits()
  var email = traits.email
  var company = traits.company && traits.company.name ? traits.company.name : ''

  var chili_options = {
    title: 'Thanks! What time works best for a quick call?',
    lead: {
      // use first name from enrichment otherwise use full name from form
      FirstName: traits.first_name || form_data.first_name,
      LastName: traits.last_name || form_data.last_name || ' ',
      Email: email,
      Company: company || form_data.company,
      Phone: form_data.phone || ''
    },
    onSuccess: function () {
      analytics.track('Fast Lane Calendar Clicked')
      form.dismiss_modal()
    }
  }
  ChiliPiper.submit('segment', 'inbound-router', chili_options)
}

var show_modal = function () {
  var traits = madkudu.user().traits()
  var first_name = traits.first_name ? traits.first_name : 'Howdy'

  var modal_options = {
    title: first_name + ', you qualify for the fast lane!',
    subtitle: 'Our scoring tells us you should get access to a Segment expert now.',
    cta_yes: 'Book time with us',
    cta_no: 'No thanks.'
  }

  // add a dummy form to make Chili Piper widget work
  $('body').append('<form style="display: none;"></form>')

  form.show_modal(modal_options)
  analytics.track('Fast Lane Modal Shown')

  // listen to the modal
  var add_listeners = function () {
    // listen on the cancel button to trigger the hiding of the MadKudu modal
    $('.madkudu_modal__cancel').on('click', function () {
      analytics.track('Fast Lane Modal Dismissed')
    })
    // listen on accept button to trigger the showing of the Calendly widget
    $('.madkudu_modal__accept').on('click', function () {
      send_to_chili_piper()
      analytics.track('Fast Lane Modal Clicked')
    })
  }
  add_listeners()

  console.log('MadKudu scored you as a qualified lead. Learn more at www.madkudu.com/smart-form?3313')
}

// Randomly allocate to test vs control based on email length
var is_test = function () {
  var traits = madkudu.user().traits()
  var email = traits.email
  return email && email.length % 2 === 0
}

var display_calendar_if_qualified = function () {
  if (!(/demo-thanks/.test(window.location.href))) {
    return
  }

  if (madkudu.user().is_qualified()) {
    if (is_test()) {
      // setTimeout(show_modal, 200); // give the page time to refresh properly before we update the DOM
      show_modal()
    } else {
      form.track('modal_control', { customer_fit_segment: user.customer_fit_segment(), qualified: user.is_qualified() })
    }
  }
}

// execute this code when the form is submitted and the page changed
once_url_change(display_calendar_if_qualified)

/* eslint-enable no-undef */
