/**
 * External dependencies
 */
import { Icon, button } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { Edit, Save } from './edit';
import attributes from './attributes';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- TypeScript expects some required properties which we already
// registered in PHP.
registerBlockType( 'poocommerce/mini-cart-cart-button-block', {
	icon: {
		src: (
			<Icon
				icon={ button }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	attributes,
	edit: Edit,
	save: Save,
} );
