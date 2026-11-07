/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { Icon } from '@wordpress/icons';
import { sparkles } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import sharedAttributes, {
	sharedAttributeBlockTypes,
} from '../../utils/shared-attributes';
import { Edit } from './edit';
import metadata from './block.json';

registerBlockType( metadata, {
	title: __( 'Newest Products', 'poocommerce' ),
	icon: {
		src: (
			<Icon
				icon={ sparkles }
				className="wc-block-editor-components-block-icon wc-block-editor-components-block-icon--sparkles"
			/>
		),
	},
	attributes: {
		...sharedAttributes,
		...metadata.attributes,
	},
	transforms: {
		from: [
			{
				type: 'block',
				blocks: sharedAttributeBlockTypes.filter(
					( value ) => value !== 'poocommerce/product-new'
				),
				transform: ( attributes ) =>
					createBlock( 'poocommerce/product-new', attributes ),
			},
		],
	},

	/**
	 * Renders and manages the block.
	 *
	 */
	edit: Edit,
	save() {
		return null;
	},
} );
