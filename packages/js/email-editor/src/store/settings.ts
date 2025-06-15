/**
 * Internal dependencies
 */
import { EmailEditorSettings, EmailTheme, EmailEditorUrls } from './types';

export function getEditorSettings(): EmailEditorSettings {
	return window.PooCommerceEmailEditor.editor_settings as EmailEditorSettings;
}

export function getEditorTheme(): EmailTheme {
	return window.PooCommerceEmailEditor.editor_theme as EmailTheme;
}

export function getUrls(): EmailEditorUrls {
	return window.PooCommerceEmailEditor.urls as EmailEditorUrls;
}
