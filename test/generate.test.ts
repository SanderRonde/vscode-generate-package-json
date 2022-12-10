import { Package } from '../src/lib/input/inputs';
import { CommandDefinition } from '../src';
import test from 'ava';

const { generate } = require(process.argv.includes('--dev')
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

test('can be called with minimal params', async (t) => {
	enum Commands {}

	await t.notThrowsAsync(async () => {
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {},
			},
			false
		);
	});
});
test('does not modify the input package', async (t) => {
	enum Commands {}

	const inputPackage = { name: generateRandomString() };
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: inputPackage,
				views: {},
			},
			false
		)
	) as { name: string };
	t.is(outputPackage.name, inputPackage.name);
});
test('appends only command palette to commands field', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {
					[Commands.COMMAND_X]: { title: generateRandomString() },
					[Commands.COMMAND_Y]: {
						title: generateRandomString(),
						inCommandPalette: true,
					},
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {},
			},
			false
		)
	) as Package;
	t.assert(
		!outputPackage.contributes.commands.some(
			(c) => c.command === `cmd.${Commands.COMMAND_X}`
		)
	);
	t.assert(
		outputPackage.contributes.commands.some(
			(c) => c.command === `cmd.${Commands.COMMAND_Y}`
		)
	);
	t.assert(
		outputPackage.contributes.commands.some(
			(c) => c.command === `${Commands.COMMAND_Y}`
		)
	);
	t.assert(
		outputPackage.contributes.commands.some(
			(c) => c.command === `${Commands.COMMAND_X}`
		)
	);
});
test('applies prefix when passed', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const prefix = generateRandomString();
	const cmdTitle = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {
					[Commands.COMMAND_Y]: {
						title: cmdTitle,
						inCommandPalette: true,
					},
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				prefix,
				views: {},
			},
			false
		)
	) as Package;
	const cmd = outputPackage.contributes.commands.find(
		(c) => c.command === `cmd.${Commands.COMMAND_Y}`
	);
	t.assert(cmd);
	t.is(cmd!.title, `${prefix}: ${cmdTitle}`);
});
test('copies all config properties for commands', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const commandConfig: CommandDefinition = {
		title: generateRandomString(),
		icon: '$(arrow-circle-down)',
		enablement: generateRandomString(),
	};
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {
					[Commands.COMMAND_X]: commandConfig,
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {},
			},
			false
		)
	) as Package;
	const cmd = outputPackage.contributes.commands.find(
		(c) => c.command === Commands.COMMAND_X
	);
	t.assert(cmd);
	t.is(cmd!.command, Commands.COMMAND_X);
	t.is(cmd!.title, commandConfig.title);
	t.is(cmd!.icon, commandConfig.icon);
	t.is(cmd!.enablement, commandConfig.enablement);
});
test('adds commands to keybindings if so configured', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
		COMMAND_Z = 'z',
	}

	const randomCondition = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {
					[Commands.COMMAND_X]: { title: generateRandomString() },
					[Commands.COMMAND_Y]: {
						title: generateRandomString(),
						keybinding: true,
					},
					[Commands.COMMAND_Z]: {
						title: generateRandomString(),
						keybinding: randomCondition,
					},
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {},
			},
			false
		)
	) as Package;
	t.assert(
		!outputPackage.contributes.keybindings.find(
			(c) => c.command === Commands.COMMAND_X
		)
	);

	const keybindingY = outputPackage.contributes.keybindings.find(
		(c) => c.command === Commands.COMMAND_Y
	);
	t.assert(keybindingY);
	t.is(keybindingY!.command, Commands.COMMAND_Y);
	t.is(keybindingY!.when, 'true');

	const keybindingZ = outputPackage.contributes.keybindings.find(
		(c) => c.command === Commands.COMMAND_Z
	);
	t.assert(keybindingZ);
	t.is(keybindingZ!.command, Commands.COMMAND_Z);
	t.is(keybindingZ!.when, randomCondition);
});
test('adds commands to command palette only if so configured', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {
					[Commands.COMMAND_X]: {
						title: generateRandomString(),
						inCommandPalette: false,
					},
					[Commands.COMMAND_Y]: {
						title: generateRandomString(),
						inCommandPalette: true,
					},
				},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {},
			},
			false
		)
	) as Package;
	const matchX = outputPackage.contributes.menus.commandPalette.find(
		(c) => 'command' in c && c.command && c.command === Commands.COMMAND_X
	);
	t.assert(!!matchX);
	t.is(matchX!.when, 'false');

	const matchY = outputPackage.contributes.menus.commandPalette.find(
		(c) =>
			'command' in c &&
			c.command &&
			c.command === `cmd.${Commands.COMMAND_Y}`
	);
	t.assert(!!matchY);
	t.is(matchY!.when, 'true');
});
test('adds views/submenus', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const viewName = generateRandomString();
	const menuName = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {
					[viewName]: {
						mygroup: [
							{
								command: Commands.COMMAND_X,
							},
							{
								submenu: menuName,
							},
						],
					},
				},
			},
			false
		)
	) as Package;

	t.assert(
		outputPackage.contributes.menus[viewName].some(
			(v) =>
				'command' in v && v.command && v.command === Commands.COMMAND_X
		)
	);
	t.assert(
		outputPackage.contributes.menus[viewName].some(
			(v) => 'submenu' in v && v.submenu && v.submenu === menuName
		)
	);
});
test('generates groups', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const viewName = generateRandomString();
	const groupName = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {
					[viewName]: {
						[groupName]: [
							{
								command: Commands.COMMAND_X,
							},
							{
								command: Commands.COMMAND_Y,
							},
						],
					},
				},
			},
			false
		)
	) as Package;

	const matchX = outputPackage.contributes.menus[viewName].find(
		(v) => 'command' in v && v.command && v.command === Commands.COMMAND_X
	);
	const matchY = outputPackage.contributes.menus[viewName].find(
		(v) => 'command' in v && v.command && v.command === Commands.COMMAND_Y
	);
	t.assert(!!matchX);
	t.assert(!!matchY);

	t.is(matchX!.group, `${groupName}@1`);
	t.is(matchY!.group, `${groupName}@2`);
});
test('allows overriding of group', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const viewName = generateRandomString();
	const groupName = generateRandomString();
	const otherGroup = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {
					[viewName]: {
						[groupName]: [
							{
								command: Commands.COMMAND_X,
							},
							{
								command: Commands.COMMAND_Y,
								group: `${otherGroup}@10`,
							},
						],
					},
				},
			},
			false
		)
	) as Package;

	const matchX = outputPackage.contributes.menus[viewName].find(
		(v) => 'command' in v && v.command && v.command === Commands.COMMAND_X
	);
	const matchY = outputPackage.contributes.menus[viewName].find(
		(v) => 'command' in v && v.command && v.command === Commands.COMMAND_Y
	);
	t.assert(!!matchX);
	t.assert(!!matchY);

	t.is(matchX!.group, `${groupName}@1`);
	t.is(matchY!.group, `${otherGroup}@10`);
});
test('sets view config', async (t) => {
	enum Commands {
		COMMAND_X = 'x',
		COMMAND_Y = 'y',
	}

	const viewName = generateRandomString();
	const groupName = generateRandomString();
	const whenCondition = generateRandomString();
	const outputPackage = JSON.parse(
		await generate(
			{
				commandDefinitions: Commands,
				commands: {},
				handlerFileSource: '',
				outputPath: '',
				packageJSON: {},
				views: {
					[viewName]: {
						[groupName]: [
							{
								command: Commands.COMMAND_X,
								when: whenCondition,
							},
						],
					},
				},
			},
			false
		)
	) as Package;

	const matchX = outputPackage.contributes.menus[viewName].find(
		(v) => 'command' in v && v.command && v.command === Commands.COMMAND_X
	);
	t.assert(!!matchX);

	t.is(matchX!.group, `${groupName}@1`);
	t.is(matchX!.when, whenCondition);
});
