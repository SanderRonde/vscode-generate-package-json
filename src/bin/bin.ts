import { generateFromArgv, validateFromArgv } from '..';
import { printHelp } from '../lib/input/inputs';

async function main(): Promise<void> {
	const mainCommand = process.argv[2];
	if (!mainCommand) {
		console.log(
			'No main command passed, please pass either "generate" or "validate" as the first argument'
		);
		printHelp();
	}

	if (['generate', 'validate'].includes(mainCommand)) {
		console.log(
			`Unknown main command passed ("${mainCommand}"), please pass either "generate" or "validate" as the first argument`
		);
		printHelp();
	}

	if (mainCommand === 'generate') {
		await generateFromArgv();
	} else if (mainCommand === 'validate') {
		await validateFromArgv();
	}
}

void (async () => {
	await main();
})();
