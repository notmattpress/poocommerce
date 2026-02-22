/**
 * External dependencies
 */
import { registerProductBlockType } from '@poocommerce/atomic-utils';
import { Icon } from '@wordpress/icons';
import { productMeta } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import metadata from './block.json';

const blockConfig = {
	...metadata,
	icon: {
		src: (
			<Icon
				icon={ productMeta }
				className="wc-block-editor-components-block-icon"
			/>
		),
	},
	edit,
	save,
	ancestor: [ 'poocommerce/single-product' ],
};

registerProductBlockType( blockConfig, {
	isAvailableOnPostEditor: true,
} );
