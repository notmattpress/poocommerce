/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ProductEditorDevTools } from './product-editor-dev-tools';
import './index.scss';

function registerProductEditorDevTools() {
	registerPlugin( 'poocommerce-product-editor-dev-tools', {
		scope: 'poocommerce-product-block-editor',
		render: ProductEditorDevTools,
	} );
}
registerProductEditorDevTools();
