module.exports = {
  'extends': 'standard',
  'env': {
    'es6': true,
    'node': true,
    'browser': true,
    'mocha': true
  },
  'plugins': [
    'standard',
    'mocha'
  ],
  'globals': {
    'module': false,
    'require': false,
    'global': false,
    '$': false,
    'querystring': false,
    'component_event': false,
    'type': false,
    'each': false,
    'is': false,
    'prevent': false,
    'isMeta': false
  },
  'rules': {
    'camelcase': 0
  }
}
