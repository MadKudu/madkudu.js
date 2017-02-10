
const watch = process.env.WATCH === 'true'

const Compiler = require('./compiler')

const DEFAULT_SETTINGS = require('./default_settings')
const DEFAULT_OPTIONS = {}

const compiler = new Compiler(DEFAULT_SETTINGS, DEFAULT_OPTIONS)

if (watch) {
  compiler.watch()
} else {
  compiler.run({ min: true })
    .then(() => process.exit(0))
}
