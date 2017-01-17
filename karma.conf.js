'use strict';

const CI = process.env.CI;
const DEV = process.env.DEV;

const webpack = require('webpack');
const _ = require('lodash');
const DEFAULT_WEBPACK_CONFIG = require('./webpack.config');

const test_type = process.env.TESTS || 'unit';
const SEGMENT_API_KEY = process.env.SEGMENT_API_KEY;

console.log(test_type);

module.exports = function (config) {

	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// list of files / patterns to load in the browser
		files: (function () {
			if (test_type === 'compiled') {
				return [
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'dist/madkudu.min.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/mk_window_changes.js', watched: true },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			} else if (test_type === 'jquery') {
				return [
					{ pattern: 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', watched: false },
					// { pattern: 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js', watched: false, included: true },
					// { pattern: 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js', watched: false, included: true },
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'dist/madkudu.min.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			} else if (test_type === 'segment') {
				return [
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'test/support/segment.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/analytics_is_ready.js', watched: true },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			} else if (test_type === 'require') {
				return [
					{ pattern: 'dist/madkudu.min.js', watched: true, included: false },
					{ pattern: 'support/domReady.js', watched: true, included: false },
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.js' },
					{ pattern: 'test/support/require_main.js' },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/madkudu_is_ready.js', watched: true },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			}
			else {
				return [
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'test/unit/*.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true }
				];
			}
		})(),

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha'],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'test/**/*.js': ['webpack', 'sourcemap'],
			'test/**/support/*.js': ['webpack']
		},

		webpack: (function () {
			const webpack_conf = _.cloneDeep(DEFAULT_WEBPACK_CONFIG);

			webpack_conf.output = {
				libraryTarget: 'var'
			};

			webpack_conf.plugins.push(
				new webpack.DefinePlugin({
					__3313__: JSON.stringify(false),
					__CAMPAIGNS__: JSON.stringify(false),
					__SETTINGS__: JSON.stringify({}),
					__SEGMENT_API_KEY__: JSON.stringify(SEGMENT_API_KEY)
				})
			);

			return webpack_conf;

		})(),

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress', 'coverage'],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: DEV === 'true',

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: (function () {
			if (CI === 'true') {
				return ['Chrome', 'Firefox'];
			} else if (DEV === 'true' && test_type === 'stripe') {
				return ['Chrome_without_security'];
			} else if (DEV === 'true') {
				return ['Chrome'];
			} else {
				return ['Chrome', 'Firefox', 'Safari'];
			}
		})(),

		// custom flag
		// disable chrome security
		customLaunchers: {
			Chrome_without_security: {
				base: 'Chrome',
				flags: ['--disable-web-security']
			}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: !(DEV === 'true'),

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,

		client: {
			mocha: {
				grep: process.env.GREP,
				reporter: 'html',
				timeout: 10000
			}
		},

		coverageReporter: {
			dir: 'dist/coverage/' + test_type,
			reporters: [
				{ type: 'text' },
				{ type: 'lcov' }
			]
		}

	});
};
