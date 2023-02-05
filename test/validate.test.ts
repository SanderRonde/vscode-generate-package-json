import test from 'ava';

const { validate } = require(process.argv.includes('--dev')
	? '../src/index'
	: '../dist/index') as typeof import('../src/index');

const CHARS =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
function generateRandomString(length: number = 24): string {
	let str: string = '';
	for (let i = 0; i < length; i++) {
		str += CHARS[Math.floor(Math.random() * CHARS.length)];
	}
	return str;
}

test('can be called with minimal params', (t) => {
	enum Commands {}

	t.notThrows(() => {
		validate({
			commandDefinitions: Commands,
			commands: {},
			handlerFileSource: '',
			outputPath: '',
			packageJSON: {},
			views: {},
			configuration: {},
		});
	});
});
test('finds unknown commands', (t) => {
	enum Commands {}

	const cmdName = generateRandomString();
	t.throws(
		() => {
			validate({
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {
					contributes: {
						commands: [{ command: cmdName }],
					},
				},
				views: {},
				configuration: {},
			});
		},
		{ message: new RegExp(`.*commands.*${cmdName}.*`) }
	);

	t.throws(
		() => {
			validate({
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {
					contributes: {
						keybindings: [{ command: cmdName }],
					},
				},
				views: {},
				configuration: {},
			});
		},
		{ message: new RegExp(`.*keybindings.*${cmdName}.*`) }
	);

	t.throws(
		() => {
			validate({
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {
					contributes: {
						menus: {
							commandPalette: [{ command: cmdName }],
						},
					},
				},
				views: {},
				configuration: {},
			});
		},
		{ message: new RegExp(`.*commandPalette.*${cmdName}.*`) }
	);
});
test('finds commands with no handler', (t) => {
	enum Commands {
		X = 'somecommand',
	}

	t.throws(
		() => {
			validate({
				commandDefinitions: Commands,
				commands: {
					[Commands.X]: { title: '' },
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {
					contributes: {
						commands: [{ command: Commands.X }],
					},
				},
				views: {},
				configuration: {},
			});
		},
		{ message: new RegExp(`.*No handler defined.*${Commands.X}.*`) }
	);
});
test('throws no error if a handler is defined', (t) => {
	enum Commands {
		X = 'somecommand',
	}

	t.notThrows(() => {
		validate({
			commandDefinitions: Commands,
			commands: {
				[Commands.X]: { title: '' },
			},
			handlerFileSource: Commands.X,
			outputPath: '',
			packageJSON: {
				contributes: {
					commands: [{ command: Commands.X }],
				},
			},
			views: {},
			configuration: {},
		});
	});
});
test('finds unused commands', (t) => {
	enum Commands {
		X = 'somecommand',
	}

	t.throws(
		() => {
			validate({
				commandDefinitions: Commands,
				commands: {
					[Commands.X]: { title: '' },
				},
				handlerFileSource: Commands.X,
				outputPath: '',
				packageJSON: {},
				views: {},
				configuration: {},
			});
		},
		{ message: new RegExp(`.*unused command.*${Commands.X}.*`) }
	);
});
