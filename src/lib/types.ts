import { ConfigurationJSONDefinition } from './configuration-json-type';
import { Package } from './input/inputs';
import { DeepPartial } from './util';

/**
 * Definition for a VSCode command handler. Takes an optional
 * codicon set that defaults to the builtin VSCode codicon set.
 * If you want to use a custom set or none at all (maybe
 * you want to use your own local icons) pass the types of that
 * different set or just `string`.
 */
export interface CommandDefinition<C extends string = DefaultCodiconStrings> {
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
		| C
		| {
				dark: C;
				light: C;
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

export interface ConfigurationDefinition {
	/**
	 * JSON definition in package.json
	 */
	jsonDefinition: ConfigurationJSONDefinition;
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
	 * An enum of configuration definitions
	 */
	configuration: Record<string, ConfigurationDefinition>;
	/**
	 * Package.json file
	 */
	packageJSON: DeepPartial<Package> & Record<string, unknown>;
	/**
	 * Name of the package, to be used for the name of the settings object
	 */
	name: string;
	/**
	 * Prefix for command-palette commands
	 */
	prefix: string;
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
	 * File containing commands, views and configuration definitions
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
	/**
	 * Name of the package, to be used for the name of the settings object
	 */
	name: string;
}

/**
 * Default set of VSCode codicons
 */
export type DefaultCodiconNames =
	| 'account'
	| 'activate-breakpoints'
	| 'add'
	| 'archive'
	| 'arrow-both'
	| 'arrow-circle-down'
	| 'arrow-circle-left'
	| 'arrow-circle-right'
	| 'arrow-circle-up'
	| 'arrow-down'
	| 'arrow-left'
	| 'arrow-right'
	| 'arrow-small-down'
	| 'arrow-small-left'
	| 'arrow-small-right'
	| 'arrow-small-up'
	| 'arrow-swap'
	| 'arrow-up'
	| 'azure-devops'
	| 'azure'
	| 'beaker-stop'
	| 'beaker'
	| 'bell-dot'
	| 'bell-slash-dot'
	| 'bell-slash'
	| 'bell'
	| 'blank'
	| 'bold'
	| 'book'
	| 'bookmark'
	| 'bracket-dot'
	| 'bracket-error'
	| 'briefcase'
	| 'broadcast'
	| 'browser'
	| 'bug'
	| 'calendar'
	| 'call-incoming'
	| 'call-outgoing'
	| 'case-sensitive'
	| 'check-all'
	| 'check'
	| 'checklist'
	| 'chevron-down'
	| 'chevron-left'
	| 'chevron-right'
	| 'chevron-up'
	| 'chrome-close'
	| 'chrome-maximize'
	| 'chrome-minimize'
	| 'chrome-restore'
	| 'circle-filled'
	| 'circle-large-filled'
	| 'circle-large'
	| 'circle-slash'
	| 'circle-small-filled'
	| 'circle-small'
	| 'circle'
	| 'circuit-board'
	| 'clear-all'
	| 'clippy'
	| 'close-all'
	| 'close'
	| 'cloud-download'
	| 'cloud-upload'
	| 'cloud'
	| 'code'
	| 'collapse-all'
	| 'color-mode'
	| 'combine'
	| 'comment-discussion'
	| 'comment-unresolved'
	| 'comment'
	| 'compass-active'
	| 'compass-dot'
	| 'compass'
	| 'copy'
	| 'credit-card'
	| 'dash'
	| 'dashboard'
	| 'database'
	| 'debug-all'
	| 'debug-alt-small'
	| 'debug-alt'
	| 'debug-breakpoint-conditional-unverified'
	| 'debug-breakpoint-conditional'
	| 'debug-breakpoint-data-unverified'
	| 'debug-breakpoint-data'
	| 'debug-breakpoint-function-unverified'
	| 'debug-breakpoint-function'
	| 'debug-breakpoint-log-unverified'
	| 'debug-breakpoint-log'
	| 'debug-breakpoint-unsupported'
	| 'debug-console'
	| 'debug-continue-small'
	| 'debug-continue'
	| 'debug-coverage'
	| 'debug-disconnect'
	| 'debug-line-by-line'
	| 'debug-pause'
	| 'debug-rerun'
	| 'debug-restart-frame'
	| 'debug-restart'
	| 'debug-reverse-continue'
	| 'debug-stackframe-active'
	| 'debug-stackframe'
	| 'debug-start'
	| 'debug-step-back'
	| 'debug-step-into'
	| 'debug-step-out'
	| 'debug-step-over'
	| 'debug-stop'
	| 'debug'
	| 'desktop-download'
	| 'device-camera-video'
	| 'device-camera'
	| 'device-mobile'
	| 'diff-added'
	| 'diff-ignored'
	| 'diff-modified'
	| 'diff-removed'
	| 'diff-renamed'
	| 'diff'
	| 'discard'
	| 'edit'
	| 'editor-layout'
	| 'ellipsis'
	| 'empty-window'
	| 'error-small'
	| 'error'
	| 'exclude'
	| 'expand-all'
	| 'export'
	| 'extensions'
	| 'eye-closed'
	| 'eye'
	| 'feedback'
	| 'file-binary'
	| 'file-code'
	| 'file-media'
	| 'file-pdf'
	| 'file-submodule'
	| 'file-symlink-directory'
	| 'file-symlink-file'
	| 'file-zip'
	| 'file'
	| 'files'
	| 'filter-filled'
	| 'filter'
	| 'flame'
	| 'fold-down'
	| 'fold-up'
	| 'fold'
	| 'folder-active'
	| 'folder-library'
	| 'folder-opened'
	| 'folder'
	| 'gear'
	| 'gift'
	| 'gist-secret'
	| 'gist'
	| 'git-commit'
	| 'git-compare'
	| 'git-merge'
	| 'git-pull-request-closed'
	| 'git-pull-request-create'
	| 'git-pull-request-draft'
	| 'git-pull-request-go-to-changes'
	| 'git-pull-request-new-changes'
	| 'git-pull-request'
	| 'github-action'
	| 'github-alt'
	| 'github-inverted'
	| 'github'
	| 'globe'
	| 'go-to-file'
	| 'grabber'
	| 'graph-left'
	| 'graph-line'
	| 'graph-scatter'
	| 'graph'
	| 'gripper'
	| 'group-by-ref-type'
	| 'heart-filled'
	| 'heart'
	| 'history'
	| 'home'
	| 'horizontal-rule'
	| 'hubot'
	| 'inbox'
	| 'indent'
	| 'info'
	| 'inspect'
	| 'issue-draft'
	| 'issue-reopened'
	| 'issues'
	| 'italic'
	| 'jersey'
	| 'json'
	| 'kebab-vertical'
	| 'key'
	| 'law'
	| 'layers-active'
	| 'layers-dot'
	| 'layers'
	| 'layout-activitybar-left'
	| 'layout-activitybar-right'
	| 'layout-centered'
	| 'layout-menubar'
	| 'layout-panel-center'
	| 'layout-panel-justify'
	| 'layout-panel-left'
	| 'layout-panel-off'
	| 'layout-panel-right'
	| 'layout-panel'
	| 'layout-sidebar-left-off'
	| 'layout-sidebar-left'
	| 'layout-sidebar-right-off'
	| 'layout-sidebar-right'
	| 'layout-statusbar'
	| 'layout'
	| 'library'
	| 'lightbulb-autofix'
	| 'lightbulb'
	| 'link-external'
	| 'link'
	| 'list-filter'
	| 'list-flat'
	| 'list-ordered'
	| 'list-selection'
	| 'list-tree'
	| 'list-unordered'
	| 'live-share'
	| 'loading'
	| 'location'
	| 'lock-small'
	| 'lock'
	| 'magnet'
	| 'mail-read'
	| 'mail'
	| 'map-filled'
	| 'map'
	| 'markdown'
	| 'megaphone'
	| 'mention'
	| 'menu'
	| 'merge'
	| 'milestone'
	| 'mirror'
	| 'mortar-board'
	| 'move'
	| 'multiple-windows'
	| 'mute'
	| 'new-file'
	| 'new-folder'
	| 'newline'
	| 'no-newline'
	| 'note'
	| 'notebook-template'
	| 'notebook'
	| 'octoface'
	| 'open-preview'
	| 'organization'
	| 'output'
	| 'package'
	| 'paintcan'
	| 'pass-filled'
	| 'pass'
	| 'person-add'
	| 'person'
	| 'pie-chart'
	| 'pin'
	| 'pinned-dirty'
	| 'pinned'
	| 'play-circle'
	| 'play'
	| 'plug'
	| 'preserve-case'
	| 'preview'
	| 'primitive-square'
	| 'project'
	| 'pulse'
	| 'question'
	| 'quote'
	| 'radio-tower'
	| 'reactions'
	| 'record-keys'
	| 'record-small'
	| 'record'
	| 'redo'
	| 'references'
	| 'refresh'
	| 'regex'
	| 'remote-explorer'
	| 'remote'
	| 'remove'
	| 'replace-all'
	| 'replace'
	| 'reply'
	| 'repo-clone'
	| 'repo-force-push'
	| 'repo-forked'
	| 'repo-pull'
	| 'repo-push'
	| 'repo'
	| 'report'
	| 'request-changes'
	| 'rocket'
	| 'root-folder-opened'
	| 'root-folder'
	| 'rss'
	| 'ruby'
	| 'run-above'
	| 'run-all'
	| 'run-below'
	| 'run-errors'
	| 'save-all'
	| 'save-as'
	| 'save'
	| 'screen-full'
	| 'screen-normal'
	| 'search-fuzzy'
	| 'search-stop'
	| 'search'
	| 'server-environment'
	| 'server-process'
	| 'server'
	| 'settings-gear'
	| 'settings'
	| 'shield'
	| 'sign-in'
	| 'sign-out'
	| 'smiley'
	| 'sort-precedence'
	| 'source-control'
	| 'split-horizontal'
	| 'split-vertical'
	| 'squirrel'
	| 'star-empty'
	| 'star-full'
	| 'star-half'
	| 'stop-circle'
	| 'symbol-array'
	| 'symbol-boolean'
	| 'symbol-class'
	| 'symbol-color'
	| 'symbol-constant'
	| 'symbol-enum-member'
	| 'symbol-enum'
	| 'symbol-event'
	| 'symbol-field'
	| 'symbol-file'
	| 'symbol-interface'
	| 'symbol-key'
	| 'symbol-keyword'
	| 'symbol-method'
	| 'symbol-misc'
	| 'symbol-namespace'
	| 'symbol-numeric'
	| 'symbol-operator'
	| 'symbol-parameter'
	| 'symbol-property'
	| 'symbol-ruler'
	| 'symbol-snippet'
	| 'symbol-string'
	| 'symbol-structure'
	| 'symbol-variable'
	| 'sync-ignored'
	| 'sync'
	| 'table'
	| 'tag'
	| 'target'
	| 'tasklist'
	| 'telescope'
	| 'terminal-bash'
	| 'terminal-cmd'
	| 'terminal-debian'
	| 'terminal-linux'
	| 'terminal-powershell'
	| 'terminal-tmux'
	| 'terminal-ubuntu'
	| 'terminal'
	| 'text-size'
	| 'three-bars'
	| 'thumbsdown'
	| 'thumbsup'
	| 'tools'
	| 'trash'
	| 'triangle-down'
	| 'triangle-left'
	| 'triangle-right'
	| 'triangle-up'
	| 'twitter'
	| 'type-hierarchy-sub'
	| 'type-hierarchy-super'
	| 'type-hierarchy'
	| 'unfold'
	| 'ungroup-by-ref-type'
	| 'unlock'
	| 'unmute'
	| 'unverified'
	| 'variable-group'
	| 'verified-filled'
	| 'verified'
	| 'versions'
	| 'vm-active'
	| 'vm-connect'
	| 'vm-outline'
	| 'vm-running'
	| 'vm'
	| 'wand'
	| 'warning'
	| 'watch'
	| 'whitespace'
	| 'whole-word'
	| 'window'
	| 'word-wrap'
	| 'workspace-trusted'
	| 'workspace-unknown'
	| 'workspace-untrusted'
	| 'zoom-in'
	| 'zoom-out';

export type DefaultCodiconStrings = `$(${DefaultCodiconNames})`;
