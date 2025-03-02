/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { productFilterRating as icon } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import metadata from './block.json';

if ( isExperimentalBlocksEnabled() ) {
	registerBlockType( metadata, {
		icon,
		attributes: {
			...metadata.attributes,
		},
		edit,
		save,
	} );
}
