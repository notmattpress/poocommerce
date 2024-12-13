/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { isExperimentalBlocksEnabled } from '@poocommerce/block-settings';
import { filterThreeLines } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { Edit } from './edit';
import { Save } from './save';
import './style.scss';

if ( isExperimentalBlocksEnabled() ) {
	registerBlockType( metadata, {
		icon: <Icon icon={ filterThreeLines } />,
		edit: Edit,
		save: Save,
	} );
}
