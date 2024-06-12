import {
	ConfigurationArrayJSONDefinition,
	ConfigurationBooleanJSONDefinition,
	ConfigurationJSONDefinition,
	ConfigurationNullJSONDefinition,
	ConfigurationNumberJSONDefinition,
	ConfigurationObjectJSONDefinition,
	ConfigurationStringJSONDefinition,
} from './lib/configuration-json-type';
import type { ConfigurationTarget, WorkspaceConfiguration } from 'vscode';
import { ConfigurationDefinition } from './lib/types';

type GetArrayConfigurationTypeFallback<
	T extends ConfigurationArrayJSONDefinition<unknown>
> = (
	T extends ConfigurationArrayJSONDefinition<infer U> ? U : unknown
) extends unknown
	? T['items'] extends ConfigurationJSONDefinition
		? GetSingleJsonConfigurationType<T['items']>[]
		: unknown
	: T extends ConfigurationArrayJSONDefinition<infer U>
	? U
	: unknown;

type GetArrayConfigurationType<
	T extends ConfigurationArrayJSONDefinition<unknown>
> = T extends ConfigurationObjectJSONDefinition<infer U>
	? U extends string | boolean | number | object
		? U
		: GetArrayConfigurationTypeFallback<T>
	: GetArrayConfigurationTypeFallback<T>;

type GetObjectConfigurationTypeFallback<
	T extends ConfigurationObjectJSONDefinition<unknown>
> = T['properties'] extends undefined
	? T extends ConfigurationObjectJSONDefinition<infer U>
		? U
		: unknown
	: T['properties'] extends Record<string, ConfigurationJSONDefinition>
	? {
			[K in keyof T['properties']]: GetSingleJsonConfigurationType<
				T['properties'][K]
			>;
	  }
	: unknown;
type GetObjectConfigurationType<
	T extends ConfigurationObjectJSONDefinition<unknown>
> = T extends ConfigurationObjectJSONDefinition<infer U>
	? U extends string | boolean | number | object
		? U
		: GetObjectConfigurationTypeFallback<T>
	: GetObjectConfigurationTypeFallback<T>;

type WithDefault<T, D> = D extends undefined ? T | undefined : T;

type GetSingleJsonConfigurationType<T extends ConfigurationJSONDefinition> =
	T extends ConfigurationBooleanJSONDefinition
		? WithDefault<boolean, T['default']>
		: T extends ConfigurationNumberJSONDefinition
		? WithDefault<number, T['default']>
		: T extends ConfigurationStringJSONDefinition
		? T extends { enum: readonly (infer E)[] }
			? WithDefault<E, T['default']>
			: WithDefault<string, T['default']>
		: T extends ConfigurationNullJSONDefinition
		? WithDefault<null, T['default']>
		: T extends ConfigurationArrayJSONDefinition
		? WithDefault<GetArrayConfigurationType<T>, T['default']>
		: T extends ConfigurationObjectJSONDefinition
		? WithDefault<GetObjectConfigurationType<T>, T['default']>
		: unknown;

export type GetSingleConfigurationType<T extends ConfigurationDefinition> =
	GetSingleJsonConfigurationType<T['jsonDefinition']>;

export type GetConfigurationType<
	T extends Record<string, ConfigurationDefinition>
> = {
	[K in keyof T]: GetSingleConfigurationType<T[K]>;
};

export interface TypedWorkspaceConfiguration<T> extends WorkspaceConfiguration {
	get<K extends Extract<keyof T, string>>(
		section: K,
		defaultValue: T[K]
	): T[K];
	get<K extends Extract<keyof T, string>>(section: K): T[K];
	get<K extends Extract<keyof T, string>>(
		section: K,
		defaultValue?: T[K]
	): T[K];
	has<K extends Extract<keyof T, string>>(section: K): boolean;
	update<K extends Extract<keyof T, string>>(
		section: K,
		value: T[K],
		configurationTarget?: ConfigurationTarget | boolean | null,
		overrideInLanguage?: boolean
	): Thenable<void>;
}
