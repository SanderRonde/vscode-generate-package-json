export function isView(view: string): string {
	return `view == ${view}`;
}

export const SCM_PROVIDER_IS_GIT = scmProviderContains('git');
export const EDITOR_TEXT_FOCUS = 'editorTextFocus';

export function and(...conditions: string[]): string {
	return conditions.join(' && ');
}

export function or(...conditions: string[]): string {
	return conditions.join(' || ');
}

export function inParentheses(condition: string): string {
	return `(${condition})`;
}

export function contains(key: string, value: string): string {
	return `${key} =~ /${value}/`;
}

export function commentThreadContains(value: string): string {
	return contains('commentThread', value);
}

export function commentContains(value: string): string {
	return contains('comment', value);
}

export function viewItemContains(value: string): string {
	return contains('viewItem', value);
}

export function resourceContains(value: string): string {
	return contains('resource', value);
}

export function scmProviderContains(value: string): string {
	return contains('scmProvider', value);
}

export function contextProp<C extends Record<string, string>>(
	prop: keyof C
): keyof C {
	return prop;
}
