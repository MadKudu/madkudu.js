
const watch = process.env.WATCH === 'true';

const Compiler = require('./compiler');

const DEFAULT_OPTIONS = { min: true };

const compiler = new Compiler();

if (watch) {
	compiler.watch();
} else {
	compiler.run(DEFAULT_OPTIONS)
		.then(() => process.exit(0));
}
