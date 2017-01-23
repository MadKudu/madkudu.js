'use strict';

const CI = process.env.CI;
const DEV = process.env.DEV;

const DEFAULT_SETTINGS = require('./utils/default_settings');
const get_webpack_config = require('./utils/get_webpack_config');

const test_type = process.env.TESTS || 'unit';

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
					{ pattern: 'test/compiled/window_changes.js', watched: true },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			} else if (test_type === 'jquery') {
				return [
					{ pattern: 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', watched: false },
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'dist/madkudu.min.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/window.jquery.js', watched: true }
				];
			} else if (test_type === 'segment') {
				return [
					{ pattern: 'test/support/segment.js', watched: true },
					{ pattern: 'test/compiled/window.analytics.js', watched: true }
				];
			} else if (test_type === 'require') {
				return [
					{ pattern: 'dist/madkudu.min.js', watched: true, included: false },
					{ pattern: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.js' },
					{ pattern: 'test/support/require_main.js' },
					{ pattern: 'test/compiled/window.madkudu.js', watched: true }
				];
			} else if (test_type === 'snippet') {
				return [
					{ pattern: 'test/support/setup.js', watched: true },
					{ pattern: 'test/support/snippet.js', watched: true },
					{ pattern: 'test/support/teardown.js', watched: true },
					{ pattern: 'test/compiled/window.snippet.js', watched: true }
				];
			} else if (test_type === 'unit') {
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

		webpack: get_webpack_config(DEFAULT_SETTINGS, { test: true }),

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
		// logLevel: config.LOG_INFO,
		logLevel: config.DEBUG,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: DEV === 'true',

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: (function () {
			if (process.env.BROWSERS) {
				return process.env.BROWSERS.split(',');
			} else if (CI === 'true') {
				return ['Chrome', 'PhantomJS', 'Firefox'];
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
			captureConsole: true,
			mocha: {
				grep: process.env.GREP,
				reporter: 'html',
				timeout: 20000
			}
		},

		// How long does Karma wait for a browser to reconnect (in ms).
		browserDisconnectTimeout: 20000,
		browserNoActivityTimeout: 20000,

		coverageReporter: {
			dir: 'dist/coverage/' + test_type,
			reporters: [
				{ type: 'text' },
				{ type: 'lcov' }
			]
		}

	});
};
