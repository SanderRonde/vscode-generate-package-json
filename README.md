# VSCode generate package.json

A package for generating your VSCode package.json file from code instead of writing it in untyped JSON. Allows for re-using of defined types/enums for better type safety and less work.

## Usage

```
$ yarn add vscode-generate-package-json
$ yarn vscode-generate-package-json --input src/commands.ts --ovewrite -p package.json --handler src/commandd-handler.ts --validate --prefix MyExtension
```

```ts
// src/defs.ts
enum MyExtensionCommand {
	X = 'my.command.1',
	Y = 'my.command.2',
}

// Lets the package know which commands you want to use (and which
// ones need to be available in the command palette)
export const commands = {
	[MyExtensionCommand.X]: {
		title: 'Lint/check file',
		icon: '$(smiley)',
		inCommandPalette: true,
		keybinding: true,
	},
	[MyExtensionCommand.Y]: {
		title: 'Reload',
		icon: '$(refresh)',
	},
};

// Lets the package know what you want to contribute to views
export const views = {
	'view/item/context': {
		inline: [
			{
				command: MyExtensionCommand.X,
				when: 'someCondition',
			},
		],
	},
};

export const configuration = {
	enabled: {
		'myExtension.jsonDefinition': {
			type: 'boolean',
			default: false,
		},
	},
} as const;

// Lets the package know which commands you have
export const commandDefinitions = MyExtensionCommand;
```

This generates the following package.json file for you:

```json
{
	...
	"contributes": {
		"configuration": {
			"type": "object",
			"title": "Extension Configuration",
			"properties": {
				"myExtension.jsonDefinition": {
					"type": "boolean",
					"default": false
				}
			}
		},
		"commands": [{
			"command": "my.command.1",
			"title": "Lint/check file",
			"icon": "$(smiley)",
		}, {
			"command": "my.command.2",
			"title": "Reload",
			"icon": "$(refresh)",
		}, {
			"command": "cmd.my.command.1",
			"title": "MyExtension: Lint/check file",
			"icon": "$(smiley)",
		}],
		"keybindings": [{
			"command": "my.command.1",
			"when": "true"
		}],
		"menus": {
			"commandPalette": [{
				"command": "my.command.1",
				"when": "false"
			}, {
				"command": "my.command.2",
				"when": "false"
			}, {
				"command": "cmd.my.command.1",
				"when": "true"
			}],
			"view/item/context": [{
				"command": "my.command.1",
				"when": "someCondition",
				"group": "inline@1"
			}]
		}
	}
}
```

Additionally, use the condition exports to build better conditions. For example a normal condition in your package.json could be `view == myExtension:myView && viewItem =~ /someIdentifier/ && viewItem =~ /otherIdentifier/`. Using the condition exports you can type this a bit better. For example:

```ts
enum Identifiers {
	First = 'someIdentifier',
	Second = 'otherIdentifier',
}

enum MyViews {
	MyView = 'myExtension:myView',
}

const condition = and(
	isView(MyViews.MyView),
	viewItemContains(Identifiers.First),
	viewitemContains(Identifiers.Second)
);
```

Finally you can also use the configuration you wrote to generate typed version of `getConfiguration`. For example:

```ts
import type {
	GetConfigurationType,
	TypedWorkspaceConfiguration,
} from 'vscode-generate-package-json';
import { configuration } from './defs';

export function getConfiguration(
	section?: string,
	scope?: ConfigurationScope | null
): TypedWorkspaceConfiguration<GetConfigurationType<typeof configuration>> {
	return workspace.getConfiguration(section, scope);
}
```
