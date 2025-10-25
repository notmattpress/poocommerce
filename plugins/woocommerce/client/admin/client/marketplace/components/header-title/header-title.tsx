/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

export default function HeaderTitle() {
	return (
		<h1 className="poocommerce-marketplace__header-title">
			{ __( 'The PooCommerce Marketplace', 'poocommerce' ) }
		</h1>
	);
}
