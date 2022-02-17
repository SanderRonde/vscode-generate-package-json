import {
	createAutoRegisterCommandName,
	autoRegisterFunctionNames,
} from './commands';
import { getIO, Package, readInputs, validateIO } from './lib/input/inputs';
import { DeepPartial } from './lib/util';
import { Inputs, IO } from './lib/types';

function getUnknownCommands(
	// eslint-disable-next-line @typescript-eslint/ban-types
	field: ({ command: string } | {})[],
	commands: string[]
): string[] {
	return field
		.filter(
			(c) =>
				'command' in c &&
				c.command &&
				!commands.includes(c.command) &&
				!c.command.startsWith('cmd.') &&
				!commands.includes(c.command.split('cmd.')[1])
		)
		.map((c) => (c as { command: string }).command);
}

function validatePackageJSON(inputs: Inputs): void {
	const packageJSON = inputs.packageJSON;
	const cmdNames = Object.keys(inputs.commands);

	validateUnknownCommands(packageJSON, cmdNames);
	validateEnum(inputs, packageJSON);
}

function validateEnum(inputs: Inputs, packageJSON: DeepPartial<Package>): void {
	const commandRegistrationFile = inputs.handlerFileSource;
	const generatorName = new RegExp(
		`(\\w+) = ${createAutoRegisterCommandName}`
	).exec(commandRegistrationFile)?.[1];
	const fnNames = generatorName
		? [generatorName, ...autoRegisterFunctionNames]
		: autoRegisterFunctionNames;
	for (const enumKey in inputs.commandDefinitions) {
		const enumValue = inputs.commandDefinitions[enumKey];
		if (
			!commandRegistrationFile.includes(enumKey) &&
			!commandRegistrationFile.includes(enumValue)
		) {
			throw new Error(
				`No handler defined for command with enum key ${enumKey} and value "${enumValue}"`
			);
		}

		if (inputs.commands[enumValue].inCommandPalette) {
			const regexes = [
				...fnNames.map(
					(n) => new RegExp(`${n}\\(?\\s*(\\w+\\.)${enumKey}`)
				),
				...fnNames.map(
					(n) => new RegExp(`${n}\\(?\\s*\\(?${enumValue}`)
				),
			];
			if (!regexes.some((r) => r.test(commandRegistrationFile))) {
				throw new Error(
					`No command palette handler defined for command with enum key ${enumKey} and value "${enumValue}". Use ${autoRegisterFunctionNames
						.map((n) => `"${n}"`)
						.join(
							' or '
						)} to register the command. Alternatively, use "const myGenerator = createAutoRegisterCommandName(commands); myGenerator(name, handler);". Please don't rename this variable from its initial name because this script is not smart enough to track that.`
				);
			}
		}
	}

	const packageString = JSON.stringify(packageJSON);
	for (const enumKey in inputs.commandDefinitions) {
		const enumValue = inputs.commandDefinitions[enumKey];
		if (
			!packageString.includes(enumKey) &&
			!packageString.includes(enumValue)
		) {
			throw new Error(
				`Found unused command with enum key ${enumKey} and value "${enumValue}"`
			);
		}
	}
}

function validateUnknownCommands(
	packageJSON: DeepPartial<Package>,
	cmdNames: string[]
): void {
	const unknownCommands = getUnknownCommands(
		packageJSON.contributes?.commands ?? [],
		cmdNames
	);
	if (unknownCommands.length) {
		throw new Error(
			`contributes.commands contains unknown commands: ${unknownCommands.join(
				', '
			)}`
		);
	}

	const unknownKeybindings = getUnknownCommands(
		packageJSON.contributes?.keybindings ?? [],
		cmdNames
	);
	if (unknownKeybindings.length) {
		throw new Error(
			`contributes.keybindings contains unknown commands: ${unknownKeybindings.join(
				', '
			)}`
		);
	}

	const unknownCommandPaletteCommands = getUnknownCommands(
		packageJSON.contributes?.menus?.commandPalette ?? [],
		cmdNames
	);
	if (unknownCommandPaletteCommands.length) {
		throw new Error(
			`contributes.menus.commandPalette contains unknown command: ${unknownCommandPaletteCommands.join(
				', '
			)}`
		);
	}
}

/**
 * Validate with given settings. Can be called in three ways:
 * * With pre-parsed inputs fully passed.
 * * With raw commandline input
 * * With no input, in which case argv is used
 */
export function validate(inputs: Inputs): void {
	validatePackageJSON(inputs);
}

export async function validateFromIO(io: IO): Promise<void> {
	validate(await readInputs(io));
}

export async function validateFromArgv(): Promise<void> {
	await validateFromIO(validateIO(getIO()));
}
