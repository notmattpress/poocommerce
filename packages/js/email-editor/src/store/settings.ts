/**
 * Internal dependencies
 */
import { EmailEditorSettings, EmailTheme, EmailEditorUrls } from './types';

function getEditorSettings(): EmailEditorSettings {
	return window.PooCommerceEmailEditor.editor_settings as EmailEditorSettings;
}

function getEditorTheme(): EmailTheme {
	return window.PooCommerceEmailEditor.editor_theme as EmailTheme;
}

function getUrls(): EmailEditorUrls {
	return window.PooCommerceEmailEditor.urls as EmailEditorUrls;
}

/**
 * Extract editor configuration from the global window object for backward compatibility.
 * This function is used by the initializeEditor function to maintain backward compatibility.
 */
export function getEditorConfigFromWindow() {
	if ( ! window.PooCommerceEmailEditor ) {
		throw new Error(
			'PooCommerceEmailEditor global object is not available. This is required for the email editor to work.'
		);
	}

	const editorSettings = getEditorSettings();
	const editorTheme = getEditorTheme();
	const urls = getUrls();
	const currentWpUserEmail =
		window.PooCommerceEmailEditor.current_wp_user_email;
	const userThemePostId = window.PooCommerceEmailEditor.user_theme_post_id;

	if ( ! editorSettings ) {
		throw new Error(
			'window.PooCommerceEmailEditor.editor_settings is required.'
		);
	}
	if ( ! editorTheme ) {
		throw new Error(
			'window.PooCommerceEmailEditor.editor_theme is required.'
		);
	}
	if (
		! urls ||
		typeof urls.back !== 'string' ||
		typeof urls.listings !== 'string'
	) {
		throw new Error(
			'window.PooCommerceEmailEditor.urls.back and .listings are required strings.'
		);
	}

	return {
		editorSettings,
		theme: editorTheme,
		urls,
		userEmail: currentWpUserEmail as string,
		globalStylesPostId: ( userThemePostId as number | null ) ?? null,
	};
}
