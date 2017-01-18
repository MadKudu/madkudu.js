module.exports = {
	api_key: process.env.MADKUDU_API_KEY || 'test',
	form: {
		active: true,
		campaigns: [
			{
				_id: 'BJ2rrsYEx',
				active: true,
				name: 'Signup Page',
				custom_css: '',
				custom_js: '',
				__v: 1,
				description: '',
				variations: [
					{
						on_load: {
							js: 'console.log(\'Want to improve your signup form? http://try.madkudu.com/smart-form\')'
						},
						on_qualified: {
							hook: 'https://hooks.zapier.com/hooks/catch/874624/t7ntqj/',
							js: 'console.log(madkudu.user().traits());\n\nvar wrapper_id = \'mk_smart_form\'; \n$(\'#\' + wrapper_id).remove(); \nvar wrapper = $(\'<div id="\' + wrapper_id + \'"><div>\'); \n$(wrapper).insertBefore($(\'.form-group--signup\')); \nvar html = "<div class=\'form-group\'> <p>Would you like help getting started?</p> <input id=\'mk_smart_form_cta_yes\' class=\'mk_smart_form_cta\' name=\'mk_smart_form_cta\' type=\'radio\'  value=\'yes\' style=\'padding-right: 5px;\'></input> <label for=\'yes\' style=\'padding-right: 10px;\'> Yes </label> <input id=\'mk_smart_form_cta_no\' class=\'mk_smart_form_cta\' name=\'mk_smart_form_cta\' type=\'radio\' value=\'no\' style=\'padding-right: 5px;\'></input> <label for=\'no\'> No </label> </div>"; \nvar new_element = $(html); \n$(wrapper).append(new_element); \nform.track_cta($(\'.mk_smart_form_cta\'), \'click\', \'request_help\');'
						},
						on_request: {
							hook: 'https://hooks.zapier.com/hooks/catch/874624/t7ntqj/'
						}
					}
				],
				trigger: { js: 'form.track_input($(\'input[name="email"]\'));' },
				url_conditions: [
					{
						match_type: 'simple',
						value: 'https://app.madkudu.com/signup'
					},
					{
						match_type: 'simple',
						value: 'try.madkudu.com'
					},
					{
						match_type: 'simple',
						value: '/signup'
					}
				]
			}
		]
	}
};
