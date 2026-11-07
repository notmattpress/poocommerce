/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { productFilterPrice } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType( metadata, {
	icon: productFilterPrice,
	edit: Edit,
	save: Save,
} );
