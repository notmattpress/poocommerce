/**
 * External dependencies
 */
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { productFilterOptions } from '@poocommerce/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import './style.scss';

if ( isExperimentalBlocksEnabled() ) {
	registerBlockType( metadata, {
		edit: Edit,
		icon: productFilterOptions,
		save: Save,
	} );
}
