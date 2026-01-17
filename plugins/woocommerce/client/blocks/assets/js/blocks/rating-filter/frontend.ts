/**
 * External dependencies
 */
import { renderFrontend } from '@poocommerce/base-utils';

/**
 * Internal dependencies
 */
import Block from './block';
import { parseAttributes } from './utils';

const getProps = ( el: HTMLElement ) => {
	return {
		attributes: parseAttributes( el.dataset ),
		isEditor: false,
	};
};

renderFrontend( {
	selector:
		'.wp-block-poocommerce-rating-filter:not(.wp-block-poocommerce-filter-wrapper .wp-block-poocommerce-rating-filter)',
	Block,
	getProps,
} );
