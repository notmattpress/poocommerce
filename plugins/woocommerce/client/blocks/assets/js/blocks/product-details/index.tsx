/**
 * External dependencies
 */
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { registerProductBlockType } from '@poocommerce/atomic-utils';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import save from './save';
import edit from './edit';
import icon from './icon';

if ( isExperimentalBlocksEnabled() ) {
	const blockConfig = {
		...metadata,
		icon,
		edit,
		save,
	};
	// @ts-expect-error blockConfig is not typed.
	registerProductBlockType( blockConfig, {
		isAvailableOnPostEditor: true,
	} );
}
