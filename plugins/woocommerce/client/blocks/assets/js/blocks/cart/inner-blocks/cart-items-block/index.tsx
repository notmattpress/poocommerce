/**
 * External dependencies
 */
import { Icon, column } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import metadata from './block.json';

registerBlockType( 'poocommerce/cart-items-block', {
	apiVersion: metadata.apiVersion,
	title: metadata.title,
	icon: {
		src: (
			<Icon
				icon={ column }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit: Edit,
	save: Save,
} );
