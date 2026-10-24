/**
 * External dependencies
 */
import { previewCategories } from '@poocommerce/resource-previews';
import type { Block } from '@wordpress/blocks';

type ExampleBlock = Block[ 'example' ] & {
	attributes: {
		categoryId: 'preview' | number;
		previewCategory: ( typeof previewCategories )[ number ];
	};
};

export const example: ExampleBlock = {
	attributes: {
		categoryId: 'preview',
		previewCategory: previewCategories[ 0 ],
	},
} as const;
