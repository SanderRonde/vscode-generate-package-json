import {
	CommandDefinition,
	Inputs,
	ViewDefinition,
	IO,
	ConfigurationDefinition,
} from './lib/types';
import { DeepPartial, fromEntries, optionalObjectProperty } from './lib/util';
import { getIO, Package, readInputs, validateIO } from './lib/input/inputs';
import * as fs from 'fs/promises';
import * as path from 'path';

export const COMMAND_PREFIX = 'cmd.';

function getContributions(
	packageJSON: DeepPartial<Package>,
	commands: [string, CommandDefinition][],
	commandPaletteCommands: [string, CommandDefinition][],
	inputs: Inputs
): Pick<
	Package['contributes'],
	'commands' | 'keybindings' | 'menus' | 'configuration'
> {
	return {
		...packageJSON.contributes,
		commands: getCommands(commands, commandPaletteCommands, inputs),
		keybindings: getKeybindings(commands),
		menus: getMenus(packageJSON, commands, commandPaletteCommands, inputs),
		configuration: getConfiguration(inputs.configuration, inputs.name),
	};
}

function getMenus(
	packageJSON: DeepPartial<Package>,
	commands: [string, CommandDefinition][],
	commandPaletteCommands: [string, CommandDefinition][],
	inputs: Inputs
): Package['contributes']['menus'] {
	return {
		...packageJSON.contributes?.menus,
		commandPalette: getCommandPalette(commands, commandPaletteCommands),
		// Views
		...getViews(inputs),
	};
}

function getViews(inputs: Inputs): Package['contributes']['menus'] {
	return fromEntries(
		Object.entries(inputs.views).map(([view, viewConfig]) => {
			const viewEntries: ViewDefinition[] = [];
			for (const groupName in viewConfig) {
				const groupEntries = viewConfig[groupName];

				// Create groups
				for (let i = 0; i < groupEntries.length; i++) {
					const entry = groupEntries[i];
					if ('command' in entry) {
						viewEntries.push({
							command: entry.command,
							...optionalObjectProperty({
								when: entry.when,
							}),
							group: entry.group ?? `${groupName}@${i + 1}`,
						});
					} else {
						viewEntries.push({
							submenu: entry.submenu,
							...optionalObjectProperty({
								when: entry.when,
							}),
							group: entry.group ?? `${groupName}@${i + 1}`,
						});
					}
				}
			}

			return [view, viewEntries];
		})
	);
}

function getCommandPalette(
	commands: [string, CommandDefinition][],
	commandPaletteCommands: [string, CommandDefinition][]
): Package['contributes']['menus'][string] {
	return [
		...commands.map(([command]) => {
			return {
				command,
				when: 'false',
			};
		}),
		...commandPaletteCommands.map(([command]) => {
			return {
				command: `${COMMAND_PREFIX}${command}`,
				when: 'true',
			};
		}),
	];
}

function getKeybindings(
	commands: [string, CommandDefinition][]
): Package['contributes']['keybindings'] {
	return commands
		.filter(([, config]) => config.keybinding)
		.map(([command, config]) => {
			return {
				command,
				when: config.keybinding === true ? 'true' : config.keybinding!,
			};
		});
}

function getCommands(
	commands: [string, CommandDefinition][],
	commandPaletteCommands: [string, CommandDefinition][],
	inputs: Inputs
): Package['contributes']['commands'] {
	return [
		...commands.map(([command, commandConfig]) => {
			return {
				command,
				title: commandConfig.title,
				...optionalObjectProperty({
					icon: commandConfig.icon,
					enablement: commandConfig.enablement,
				}),
			};
		}),
		// Command palette commands
		...commandPaletteCommands.map(([command, commandConfig]) => {
			const prefixText = `${inputs.prefix}: `;
			return {
				command: `${COMMAND_PREFIX}${command}`,
				title: `${prefixText}${commandConfig.title}`,
				...optionalObjectProperty({
					icon: commandConfig.icon,
					enablement: commandConfig.enablement,
				}),
			};
		}),
	];
}

function stripShape<T>(input: T): T {
	if (typeof input !== 'object' || !input || !('type' in input)) {
		return input;
	}
	if (Array.isArray(input)) {
		return input;
	}

	const newObj: Record<string, unknown> = {};
	for (const key in input) {
		if (key === '__shape') {
			continue;
		}
		newObj[key] = stripShape(input[key as keyof typeof input]);
	}
	return newObj as T;
}

function getConfiguration(
	configuration: Record<string, ConfigurationDefinition>,
	name: string
): Package['contributes']['configuration'] {
	// This is essentially just a stringified version of the configuration object
	// but without the "shape" property in objects.
	const configurationJson: Package['contributes']['configuration']['properties'] =
		{};
	for (const key in configuration) {
		configurationJson[key] = stripShape(configuration[key].jsonDefinition);
	}
	return {
		type: 'object',
		title: name,
		properties: configurationJson,
	};
}

function generatePackageJSON(inputs: Inputs): Package {
	const commands = Object.entries(inputs.commands);
	const packageJSON = inputs.packageJSON;

	const commandPaletteCommands = commands.filter(
		(c) => c[1].inCommandPalette
	);

	const newPackageJSON: Package = {
		...packageJSON,
		contributes: getContributions(
			packageJSON,
			commands,
			commandPaletteCommands,
			inputs
		),
	};

	return newPackageJSON;
}

export async function generate(
	inputs: Inputs,
	write: boolean = true
): Promise<string> {
	const pkg = generatePackageJSON(inputs);
	await fs.mkdir(path.dirname(inputs.outputPath), { recursive: true });
	const outJSON = JSON.stringify(pkg, null, '\t');
	if (write) {
		await fs.writeFile(inputs.outputPath, outJSON);
	}
	return outJSON;
}

export async function generateFromIO(io: IO): Promise<void> {
	await generate(await readInputs(io));
}

export async function generateFromArgv(): Promise<void> {
	await generateFromIO(validateIO(getIO()));
}
