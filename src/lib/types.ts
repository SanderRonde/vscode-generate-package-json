import { Package } from './input/inputs';
import { DeepPartial } from './util';

export interface CommandDefinition {
	/**
	 * Title of this command when shown in the UI
	 */
	title: string;
	/**
	 * Optional shorter title of this command
	 */
	shortTitle?: string;
	/**
	 * Optional category for this command
	 */
	category?: string;
	/**
	 * When this command should be enabled in the
	 * command palette. Always enabled by default.
	 */
	enablement?: string;
	/**
	 * Icon for this command. Can either be a single
	 * icon or different ones for different themes.
	 */
	icon?:
		| string
		| {
				dark: string;
				light: string;
		  };
	/**
	 * Whether to show this command in the command palette.
	 * Can either be a boolean (always or never show) or a string
	 * (condition on which it is shown)
	 */
	inCommandPalette?: boolean | string;
	/**
	 * Whether this command should be eligible for keybinding.
	 * If true, is always available, if a string, is eligible
	 * depending on that condition.
	 */
	keybinding?: string | true;
}

/**
 * Definition of a single view. The template COMMANDS
 * can be replaced with an enum containing all your commands.
 */
export type ViewDefinition<COMMANDS = string> =
	| {
			/**
			 * Command to run on clicking this menu entry
			 */
			command: COMMANDS;
			/**
			 * Condition on which this menu entry is shown
			 */
			when?: string;
			/**
			 * Optional override for the group property
			 */
			group?: string;
	  }
	| {
			/**
			 * Submenu to contain within this entry
			 */
			submenu: string;
			/**
			 * When to show this submenu
			 */
			when?: string;
			/**
			 * Optional override for the group property
			 */
			group?: string;
	  };

/**
 * Definition of a group of views. The template COMMANDS
 * can be replaced with an enum containing all your commands.
 */
export interface ViewGroupDefinition<COMMANDS = string> {
	/**
	 * Name of the group to which this belongs. This is used to
	 * generate a numerical index within this group. For example index
	 * X in group "mygroup" gets {"group": "mygroup@X"}
	 */
	[groupName: string]: ViewDefinition<COMMANDS>[];
}

/**
 * Inputs for this package to run
 */
export interface Inputs {
	/**
	 * Commands and their definitions
	 */
	commands: Record<string, CommandDefinition>;
	/**
	 * Views and their definions
	 */
	views: Record<string, ViewGroupDefinition>;
	/**
	 * An enum of the command definitions
	 */
	commandDefinitions: Record<string, string>;
	/**
	 * Package.json file
	 */
	packageJSON: DeepPartial<Package> & Record<string, unknown>;
	/**
	 * Optional prefix for command-palette commands
	 */
	prefix?: string;
	/**
	 * Content of the file that registers command handlers
	 */
	handlerFileSource: string;
	/**
	 * Output path for the package.json file
	 */
	outputPath: string;
}

/**
 * IO passed through process.argv
 */
export interface IO {
	/**
	 * File containing commands and views definitions
	 */
	inputPath: string;
	/**
	 * Input package.json file to use
	 */
	inPackagePath: string;
	/**
	 * Path to the package.json file to write
	 */
	outputPath: string;
	/**
	 * Optional prefix to put before command palette commands
	 */
	commandPrefix?: string;
	/**
	 * File path to the file that registers command handlers
	 */
	handlerFile: string;
}
