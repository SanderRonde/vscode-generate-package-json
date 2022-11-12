import * as tsNode from 'ts-node';
import * as fs from 'fs';
import path from 'path';

export function tryReadFile(filePath: string): Promise<string | null> {
	return new Promise<string | null>((resolve) => {
		fs.readFile(
			filePath,
			{
				encoding: 'utf-8',
			},
			(err, data) => {
				if (err) {
					resolve(null);
				} else {
					resolve(data);
				}
			}
		);
	});
}

export function tryRequire<T>(filePath: string):
	| {
			success: true;
			value: T;
	  }
	| {
			success: false;
			error: Error;
	  } {
	try {
		if (filePath.endsWith('.ts')) {
			tsNode.register({ transpileOnly: true });
		}
		return {
			success: true,
			value: require(path.isAbsolute(filePath)
				? filePath
				: path.join(process.cwd(), filePath)) as T,
		};
	} catch (e) {
		return {
			success: false,
			error: e,
		};
	}
}

export function tryParseJSON<T>(json: string): T | null {
	try {
		return JSON.parse(json) as T;
	} catch (e) {
		return null;
	}
}

export function exitErr(...errorArgs: unknown[]): never {
	console.error(...errorArgs);
	throw new Error();
}

export function optionalObjectProperty<
	O extends {
		[K: string]: V | undefined;
	},
	V
>(
	object: O
): {
	[K in keyof O]: O[K] extends undefined ? never : O[K];
} {
	const newObj: Partial<{
		[K in keyof O]: O[K] extends undefined ? never : O[K];
	}> = {};
	for (const key in object) {
		if (object[key] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			newObj[key] = object[key] as any;
		}
	}
	return newObj as {
		[K in keyof O]: O[K] extends undefined ? never : O[K];
	};
}

export function fromEntries<T = unknown>(
	entries: Iterable<readonly [PropertyKey, T]>
): { [k: string]: T };
export function fromEntries(entries: Iterable<readonly unknown[]>): unknown;
export function fromEntries<T = unknown>(
	entries: Iterable<readonly [PropertyKey, T]>
): { [k: string]: T } {
	const obj: Record<string, T> = {};
	for (const [key, value] of entries) {
		obj[key as string] = value;
	}
	return obj;
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? DeepPartial<U>[]
		: T[P] extends Record<string, unknown>
		? DeepPartial<T[P]>
		: T[P];
};
