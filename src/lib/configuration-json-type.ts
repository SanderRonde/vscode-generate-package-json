interface BaseConfigurationJSONDefinition {
	$id?: string;
	$schema?: string;
	$ref?: string;
	$comment?: string;
	title?: string;
	description?: string;
	readOnly?: boolean;
	writeOnly?: boolean;
	required?: string[];
	const?: boolean;
	if?: ConfigurationJSONDefinition;
	then?: ConfigurationJSONDefinition;
	else?: ConfigurationJSONDefinition;
	allOf?: ConfigurationJSONDefinition[];
	anyOf?: ConfigurationJSONDefinition[];
	oneOf?: ConfigurationJSONDefinition[];
	not?: ConfigurationJSONDefinition;
}

export type ConfigurationJSONDefinition =
	| ConfigurationBooleanJSONDefinition
	| ConfigurationNumberJSONDefinition
	| ConfigurationStringJSONDefinition
	| ConfigurationNullJSONDefinition
	| ConfigurationArrayJSONDefinition
	| ConfigurationObjectJSONDefinition;

export interface ConfigurationBooleanJSONDefinition
	extends BaseConfigurationJSONDefinition {
	type: 'boolean';
	examples?: readonly boolean[];
	default?: boolean;
}

export interface ConfigurationNumberJSONDefinition
	extends BaseConfigurationJSONDefinition {
	type: 'integer' | 'number';
	examples?: readonly number[];
	default?: number;
	multipleOf?: number;
	maximum?: number;
	exclusiveMaximum?: number;
	minimum?: number;
	exclusiveMinimum?: number;
}

export interface ConfigurationStringJSONDefinition
	extends BaseConfigurationJSONDefinition {
	type: 'string';
	examples?: readonly string[];
	default?: string;
	maxLength?: number;
	minLength?: number;
	pattern?: string;
	enum?: string[];
	contentMediaType?: string;
	contentEncoding?: string;
}

export interface ConfigurationNullJSONDefinition
	extends BaseConfigurationJSONDefinition {
	type: 'null';
	examples?: readonly null[];
	default?: null;
}

export interface ConfigurationArrayJSONDefinition<T = null>
	extends BaseConfigurationJSONDefinition {
	type: 'array';
	examples?: readonly (readonly unknown[])[];
	default?: readonly unknown[];
	/**
	 * Use this property to pass the shape of this array as a type.
	 * Example usage: `{type: 'array', __shape: '' as MyShape}`
	 */
	__shape?: T;
	additionalItems?: boolean | ConfigurationJSONDefinition;
	items?:
		| ConfigurationJSONDefinition
		| readonly ConfigurationJSONDefinition[];
	maxItems?: number;
	minItems?: number;
	uniqueItems?: boolean;
	contains?: boolean | ConfigurationJSONDefinition;
}

export interface ConfigurationObjectJSONDefinition<T = unknown>
	extends BaseConfigurationJSONDefinition {
	type: 'object';
	examples?: readonly unknown[];
	default?: unknown;
	/**
	 * Use this property to pass the shape of this array as a type.
	 * Example usage: `{type: 'object', __shape: '' as MyShape}`
	 */
	__shape?: T;
	maxProperties?: number;
	minProperties?: number;
	additionalProperties?: boolean | ConfigurationJSONDefinition;
	definitions?: Record<string, ConfigurationJSONDefinition>;
	properties?: Record<string, ConfigurationJSONDefinition>;
	patternProperties?: Record<string, ConfigurationJSONDefinition>;
	dependencies?: Record<string, ConfigurationJSONDefinition | string>;
	propertyNames?: ConfigurationJSONDefinition;
}
