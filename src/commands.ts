/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandDefinition, COMMAND_PREFIX, DefaultCodiconStrings } from '.';
import type { Disposable } from 'vscode';

export const autoRegisterFunctionNames: string[] = [
	'registerCommandPaletteCommandregisterCommand',
	'autoRegisterCommand',
];
export function registerCommandPaletteCommandregisterCommand(
	command: string,
	callback: (...args: unknown[]) => unknown,
	thisArg?: unknown
): Disposable {
	const vscode = require('vscode') as typeof import('vscode');
	const disposables = [
		vscode.commands.registerCommand(command, callback, thisArg),
		vscode.commands.registerCommand(
			COMMAND_PREFIX + command,
			callback,
			thisArg
		),
	];
	return {
		dispose: (): void => {
			disposables.forEach((d) => void d.dispose());
		},
	};
}

export function autoRegisterCommand<C extends string = DefaultCodiconStrings>(
	command: string,
	callback: (...args: unknown[]) => unknown,
	commandDefinitions: Record<string, CommandDefinition<C>>,
	thisArg?: unknown
): Disposable {
	const vscode = require('vscode') as typeof import('vscode');
	if (!commandDefinitions[command]?.inCommandPalette) {
		return vscode.commands.registerCommand(command, callback, thisArg);
	}

	return registerCommandPaletteCommandregisterCommand(
		command,
		callback,
		thisArg
	);
}

export const createAutoRegisterCommandName = 'createAutoRegisterCommand';
export function createAutoRegisterCommand<
	C extends string = DefaultCodiconStrings
>(commandDefinitions: Record<string, CommandDefinition<C>>) {
	return (
		command: string,
		callback: (...args: any[]) => any,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		thisArg?: any
	): Disposable => {
		return autoRegisterCommand(
			command,
			callback,
			commandDefinitions,
			thisArg
		);
	};
}
