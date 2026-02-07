/**
 * External dependencies
 */
import { renderFrontend } from '@poocommerce/base-utils';

/**
 * Internal dependencies
 */
import Block from './block';

/**
 * Wrapper component to supply the notice provider.
 *
 * @param {*} props
 */
const AllProductsFrontend = ( props ) => {
	return <Block { ...props } />;
};

const getProps = ( el ) => ( {
	attributes: JSON.parse( el.dataset.attributes ),
} );

renderFrontend( {
	selector: '.wp-block-poocommerce-all-products',
	Block: AllProductsFrontend,
	getProps,
} );
