/**
 * External dependencies
 */
import { getSetting } from '@poocommerce/settings';

export function getGutenbergVersion() {
	const adminSettings: { gutenberg_version?: string } = getSetting( 'admin' );
	if ( adminSettings.gutenberg_version ) {
		return parseFloat( adminSettings?.gutenberg_version );
	}
	return 0;
}
