/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ProductEditorDevTools } from './product-editor-dev-tools';
import './index.scss';

export function registerProductEditorDevTools() {
	registerPlugin( 'poocommerce-product-editor-dev-tools', {
		// @ts-expect-error: 'scope' does exist
		scope: 'poocommerce-product-block-editor',
		render: ProductEditorDevTools,
	} );
}
