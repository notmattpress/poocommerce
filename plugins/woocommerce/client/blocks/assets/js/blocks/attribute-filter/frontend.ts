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
		isEditor: false,
		attributes: parseAttributes( el.dataset ),
	};
};

renderFrontend( {
	selector:
		'.wp-block-poocommerce-attribute-filter:not(.wp-block-poocommerce-filter-wrapper .wp-block-poocommerce-attribute-filter)',
	Block,
	getProps,
} );
