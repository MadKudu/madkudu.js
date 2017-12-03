console.log(madkudu.user().traits())

var user = madkudu.user()
var traits = user.traits()

var attributes = {}
if (traits.email) { attributes.email = traits.email }
if (traits.first_name && traits.last_name) { attributes.name = traits.first_name + ' ' + traits.last_name }

var tags = []
if (user.is_qualified()) { tags.push('good_fit') }
var industry, company_name
if (traits.company) {
  industry = traits.company.industry
  company_name = traits.company.name
  tags.push(traits.company.industry)
}

var top_signals = []
try {
  top_signals = madkudu.user().customer_fit().top_signals
} catch (e) {
  console.log(e)
}

// for (i = 0; i < top_signals.length; i++) {
//   tags.push(top_signals[i])
// }

console.log(attributes, tags, tags.join(','))

$zopim && $zopim(function () {
  attributes && $zopim.livechat.set(attributes)
  tags && $zopim.livechat.addTags(tags.join(','))
})

var dynamic_text
if (user.is_qualified()) {
  dynamic_text = 'Looks like you\'re qualified and your company name is ' + company_name
} else {
  dynamic_text = 'Unfortunately, looks like you\'re not qualified. Please try with another address'
}
$('#zendesk_onboarding_text').text(dynamic_text)
