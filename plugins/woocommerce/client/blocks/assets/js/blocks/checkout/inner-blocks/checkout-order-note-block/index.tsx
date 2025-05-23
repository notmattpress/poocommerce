/**
 * External dependencies
 */
import { Icon, page } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import './style.scss';

registerBlockType( 'poocommerce/checkout-order-note-block', {
	icon: {
		src: (
			<Icon
				icon={ page }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit: Edit,
	save: Save,
} );
