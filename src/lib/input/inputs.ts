import { exitErr, tryParseJSON, tryReadFile, tryRequire } from '../util';
import { ConfigurationJSONDefinition } from '../configuration-json-type';
import { CommandDefinition, ConfigurationDefinition } from '../types';
import { Inputs, IO, ViewGroupDefinition } from '../..';

export function printHelp(): never {
	console.log(`
Usage: generate-package-json [generate/validate] --input src/commands.ts --package package.json --overwrite --handler src/cmdHandler.ts

Arguments:
-i / --input: file path of command-definition file to use. Should export command and menus definitions, as well as commands enum (can be a ts file)
-o / --output: path to write the resulting package.json file to. Can be omitted if --overwrite is passed
-p / --package: source package.json file to use. If --overwrite is used, this will also be the output path
-w / --overwrite: overwrites original package.json file with the new output
--handler: file path of the file in which command handlers are defined (can be a ts file)
--prefix: optional prefix to put before all command palette commands
-h: show this help dialog
--validate: if main command is generate, also runs validate command afterwards with the same args
`);
	// eslint-disable-next-line no-process-exit
	process.exit(0);
}

interface InputIO extends IO {
	overwrite?: boolean;
}

export function getIO(): Partial<InputIO> {
	const io: Partial<InputIO> = {};
	for (let i = 0; i < process.argv.length; i++) {
		const arg = process.argv[i];
		if (arg === '--input' || arg === '-i') {
			io.inputPath = process.argv[++i];
		} else if (arg === '-o' || arg === '--output') {
			io.outputPath = process.argv[++i];
		} else if (arg === '-p' || arg === '--package') {
			io.inPackagePath = process.argv[++i];
		} else if (arg === '-w' || arg === '--overwrite') {
			io.overwrite = true;
		} else if (arg === '--handler') {
			io.handlerFile = process.argv[++i];
		} else if (arg === '--prefix') {
			io.commandPrefix = process.argv[++i];
		} else if (arg === '-h') {
			printHelp();
		}
	}
	return io;
}

export function validateIO(io: Partial<InputIO>): IO {
	if (!io.inputPath) {
		exitErr(
			'Missing commands/views definition. Pass it with --input {commandfile}'
		);
	}
	if (!io.inPackagePath) {
		exitErr(
			'No input package.json specified. Pass it with -p {package.json}'
		);
	}
	if (!io.outputPath && !io.overwrite) {
		exitErr(
			'No output file specified. Either allow overwriting by passing -w or specify an output file with -o {package.json}'
		);
	}
	if (!io.handlerFile) {
		exitErr(
			'No command handler file specified. Pass it with --handler {handlerfile}'
		);
	}

	return {
		inputPath: io.inputPath,
		outputPath: io.outputPath ?? io.inPackagePath,
		inPackagePath: io.inPackagePath,
		handlerFile: io.handlerFile,
		commandPrefix: io.commandPrefix,
	};
}

function readCommandsFile(filePath: string):
	| {
			commands: Record<string, CommandDefinition>;
			views: Record<string, ViewGroupDefinition>;
			commandDefinitions: Record<string, string>;
			configuration: Record<string, ConfigurationDefinition>;
	  }
	| never {
	const commandsFileRequire = tryRequire<{
		commands: Record<string, CommandDefinition>;
		views: Record<string, ViewGroupDefinition>;
		commandDefinitions: Record<string, string>;
		configuration: Record<string, ConfigurationDefinition>;
	}>(filePath);
	if (!commandsFileRequire.success) {
		exitErr(
			'Failed to read input file. Please pass it with --input {commandfile}',
			commandsFileRequire.error
		);
	}

	const commandsFile = commandsFileRequire.value;
	if (!('commands' in commandsFile)) {
		exitErr(
			'Input file should export an object under the "commands" name. Example:\n\nexport const commands = {};'
		);
	}
	const commandsExport = commandsFile.commands;
	if (!commandsExport || typeof commandsExport !== 'object') {
		exitErr(
			"Input file's command export should be an object, found",
			commandsExport
		);
	}

	if (!('views' in commandsFile)) {
		exitErr(
			'Input file should export an object under the "views" name. Example:\n\nexport const views = {};'
		);
	}
	const viewsExport = commandsFile.views;
	if (!viewsExport || typeof viewsExport !== 'object') {
		exitErr(
			"Input file's views export should be an object, found",
			viewsExport
		);
	}

	if (!('commandDefinitions' in commandsFile)) {
		exitErr(
			'Input file should export an object under the "commandDefinitions" name. Example:\n\nexport enum MY_DEFINITIONS { ... };\nexport const commandDefinitions = MY_DEFINITIONS;'
		);
	}
	const commandDefinitionsExport = commandsFile.commandDefinitions;
	if (
		!commandDefinitionsExport ||
		typeof commandDefinitionsExport !== 'object'
	) {
		exitErr(
			"Input file's views commands should be an enum, found",
			commandDefinitionsExport
		);
	}

	if (!('configuration' in commandsFile)) {
		exitErr(
			'Input file should export an object under the "configuration" name. Example:\n\nexport const configuration = {enabled: {type: \'boolean\'}};'
		);
	}
	const configurationDefinitionsExport = commandsFile.configuration;
	if (
		!configurationDefinitionsExport ||
		typeof configurationDefinitionsExport !== 'object'
	) {
		exitErr(
			"Input file's views configuration should be an object, found",
			configurationDefinitionsExport
		);
	}

	return {
		commands: commandsExport,
		views: viewsExport,
		commandDefinitions: commandDefinitionsExport,
		configuration: configurationDefinitionsExport,
	};
}

export interface Package {
	contributes: {
		configuration: {
			type: 'object';
			title: string;
			properties: Record<string, ConfigurationJSONDefinition>;
		};
		commands: {
			command: string;
			title: string;
			enablement?: string;
			icon?:
				| string
				| {
						dark: string;
						light: string;
				  };
		}[];
		keybindings: {
			command: string;
			when?: string;
		}[];
		menus: {
			[menuName: string]: (
				| {
						command: string;
						when?: string;
						group?: string;
				  }
				| {
						submenu: string;
						when?: string;
						group?: string;
				  }
			)[];
		};
	};
}

async function readPackage(
	inputFile: string
): Promise<Package & Record<string, unknown>> {
	const packageJSON = await tryReadFile(inputFile);
	if (!packageJSON) {
		exitErr(
			`Failed to read package.json file at "${inputFile}". Please check whether it exists`
		);
	}
	const parsed = tryParseJSON<Package & Record<string, unknown>>(packageJSON);
	if (!parsed) {
		exitErr(
			"Failed to parse package.json as JSON. Are you sure it's a valid JSON file?"
		);
	}
	return parsed;
}

async function readCommandHandlerFile(
	handlerFilePath: string
): Promise<string> {
	const handlerFile = await tryReadFile(handlerFilePath);
	if (handlerFile === null) {
		exitErr(
			`Failed to read command handler file at "${handlerFilePath}". Please check whether it exists`
		);
	}
	return handlerFile;
}

export async function readInputs(io: IO): Promise<Inputs> {
	const { commands, views, commandDefinitions, configuration } =
		readCommandsFile(io.inputPath);
	return {
		commands,
		views,
		commandDefinitions,
		packageJSON: await readPackage(io.inPackagePath),
		prefix: io.commandPrefix,
		handlerFileSource: await readCommandHandlerFile(io.handlerFile),
		outputPath: io.outputPath,
		configuration,
	};
}
