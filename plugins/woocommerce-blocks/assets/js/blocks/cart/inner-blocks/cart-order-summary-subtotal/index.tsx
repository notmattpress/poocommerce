/**
 * External dependencies
 */
import { totals } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';

registerBlockType( 'poocommerce/cart-order-summary-subtotal-block', {
	icon: {
		src: (
			<Icon
				icon={ totals }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit: Edit,
	save: Save,
} );
