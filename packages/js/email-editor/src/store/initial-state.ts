/**
 * Internal dependencies
 */
import { State } from './types';
import { getEditorSettings, getEditorTheme, getUrls } from './settings';

export function getInitialState(): State {
	if ( ! window.PooCommerceEmailEditor ) {
		throw new Error(
			'PooCommerceEmailEditor global object is not available. This is required for the email editor to work.'
		);
	}

	return {
		editorSettings: getEditorSettings(),
		theme: getEditorTheme(),
		styles: {
			globalStylesPostId:
				window.PooCommerceEmailEditor.user_theme_post_id,
		},
		urls: getUrls(),
		preview: {
			toEmail: window.PooCommerceEmailEditor.current_wp_user_email,
			isModalOpened: false,
			isSendingPreviewEmail: false,
			sendingPreviewStatus: null,
		},
		personalizationTags: {
			list: [],
			isFetching: false,
		},
		contentValidation: undefined,
	};
}
