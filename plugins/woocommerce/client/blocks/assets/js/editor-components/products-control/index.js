/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { SearchListControl } from '@poocommerce/editor-components/search-list-control';
import PropTypes from 'prop-types';
import { withSearchedProducts } from '@poocommerce/block-hocs';
import ErrorMessage from '@poocommerce/editor-components/error-placeholder/error-message';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * The products control exposes a custom selector for searching and selecting
 * products.
 *
 * @param {Object}   props           Component props.
 * @param {string}   props.error
 * @param {Function} props.onChange  Callback fired when the selected item changes
 * @param {Function} props.onSearch  Callback fired when a search is triggered
 * @param {Array}    props.selected  An array of selected products.
 * @param {Array}    props.products  An array of products to select from.
 * @param {boolean}  props.isLoading Whether or not the products are being loaded.
 * @param {boolean}  props.isCompact Whether or not the control should have compact styles.
 *
 * @return {Function} A functional component.
 */
const ProductsControl = ( {
	error,
	onChange,
	onSearch,
	selected = [],
	products = [],
	isLoading = true,
	isCompact = false,
} ) => {
	const messages = {
		clear: __( 'Clear all products', 'poocommerce' ),
		list: __( 'Products', 'poocommerce' ),
		noItems: __( "Your store doesn't have any products.", 'poocommerce' ),
		search: __( 'Search for products to display', 'poocommerce' ),
		selected: ( n ) =>
			sprintf(
				/* translators: %d is the number of selected products. */
				_n(
					'%d product selected',
					'%d products selected',
					n,
					'poocommerce'
				),
				n
			),
		updated: __( 'Product search results updated.', 'poocommerce' ),
	};

	if ( error ) {
		return <ErrorMessage error={ error } />;
	}

	return (
		<SearchListControl
			className="poocommerce-products"
			list={ products.map( ( product ) => {
				const formattedSku = product.sku
					? ' (' + product.sku + ')'
					: '';
				return {
					...product,
					name: `${ decodeEntities(
						product.name
					) }${ formattedSku }`,
				};
			} ) }
			isCompact={ isCompact }
			isLoading={ isLoading }
			selected={ products.filter( ( { id } ) =>
				selected.includes( id )
			) }
			onSearch={ onSearch }
			onChange={ onChange }
			messages={ messages }
		/>
	);
};

ProductsControl.propTypes = {
	onChange: PropTypes.func.isRequired,
	onSearch: PropTypes.func,
	selected: PropTypes.array,
	products: PropTypes.array,
	isCompact: PropTypes.bool,
	isLoading: PropTypes.bool,
};

export default withSearchedProducts( ProductsControl );
