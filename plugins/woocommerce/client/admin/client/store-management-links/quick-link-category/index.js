/**
 * External dependencies
 */
import React from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

export const QuickLinkCategory = ( { title, children } ) => {
	return (
		<div className="poocommerce-quick-links__category">
			<h3 className="poocommerce-quick-links__category-header">
				{ title }
			</h3>
			{ children }
		</div>
	);
};
