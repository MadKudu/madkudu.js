'use strict'

module.exports = {
	"extends": "eslint:recommended",
	"env": {
		"es6": true,
		"node": true
	},

	"parser": "babel-eslint",

	"parserOptions": {
		"ecmaVersion": 6
	},

	"ecmaFeatures": {
		"modules": true,
	},

	"env": {
		"node": true,
		"browser": true
	},

	"globals": {
		"exports": true,
		"module": true,
		"require": false,
		"global": true
	},

	"rules": {
		// "comma-dangle": [1, {
		// 	"arrays": "never",
		// 	"objects": "ignore",
		// 	"imports": "never",
		// 	"exports": "never",
		// 	"functions": "ignore",
		// }],
		"consistent-this": [2, "self"],
		"curly": 2,
		"eqeqeq": [2, "smart"],
		"indent": [2, "tab"],
		"global-strict": 0,
		"key-spacing": [2, {
			"beforeColon": false,
			"afterColon": true
		}],
		"linebreak-style": [1, "unix"],
		"max-len": 0,
		"new-cap": [2, {
			capIsNewExceptions: ["Emitter", "Enumerable", "Validator"]
		}],
		"new-parens": 1,
		"no-alert": 0,
		"no-console": 0,
		"no-magic-numbers": [1, {
			"ignore": [0, 1, -1]
		}],
		"no-multi-spaces": 1,
		"no-nested-ternary": 2,
		"no-unneeded-ternary": 1,
		// "no-use-before-define": 1,
		"object-curly-spacing": [2, "always"],
		"prefer-const": 1,
		"quotes": [1, "single"],
		"semi": [2, "always"],
		"space-before-function-paren": 1,
		"space-in-parens": [2, "never"],
		"space-infix-ops": 2,
		"space-unary-ops": 2,
		"spaced-comment": 1,
		"valid-jsdoc": 1,
	},
}
