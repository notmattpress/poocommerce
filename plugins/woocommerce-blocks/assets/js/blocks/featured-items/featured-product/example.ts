/**
 * External dependencies
 */
import { previewProducts } from '@poocommerce/resource-previews';
import type { Block } from '@wordpress/blocks';

type ExampleBlock = Block[ 'example' ] & {
	attributes: {
		productId: 'preview' | number;
		previewProduct: ( typeof previewProducts )[ number ];
		editMode: false;
	};
};

export const example: ExampleBlock = {
	attributes: {
		productId: 'preview',
		previewProduct: previewProducts[ 0 ],
		editMode: false,
	},
} as const;
