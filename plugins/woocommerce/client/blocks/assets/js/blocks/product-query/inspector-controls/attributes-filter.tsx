/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import ProductAttributeTermControl from '@poocommerce/editor-components/product-attribute-term-control';
import {
	ExternalLink,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ProductQueryBlock } from '../types';
import { setQueryAttribute } from '../utils';
import { EDIT_ATTRIBUTES_URL } from '../constants';

export const AttributesFilter = ( props: ProductQueryBlock ) => {
	const { query } = props.attributes;
	const [ selected, setSelected ] = useState< { id: number }[] >( [] );

	useEffect( () => {
		if ( query.__poocommerceAttributes ) {
			setSelected(
				query.__poocommerceAttributes.map( ( { termId: id } ) => ( {
					id,
				} ) )
			);
		}
	}, [ query.__poocommerceAttributes ] );

	return (
		<ToolsPanelItem
			label={ __( 'Product Attributes', 'poocommerce' ) }
			hasValue={ () => query.__poocommerceAttributes?.length }
		>
			<ProductAttributeTermControl
				messages={ {
					search: __( 'Attributes', 'poocommerce' ),
				} }
				selected={ selected }
				onChange={ ( attributes ) => {
					const __poocommerceAttributes = attributes.map(
						// eslint-disable-next-line @typescript-eslint/naming-convention
						( { id, value } ) => ( {
							termId: id,
							taxonomy: value,
						} )
					);

					setQueryAttribute( props, {
						__poocommerceAttributes,
					} );
				} }
				operator={ 'any' }
				isCompact={ true }
				type={ 'token' }
			/>
			<ExternalLink
				className="poocommerce-product-query-panel__external-link"
				href={ EDIT_ATTRIBUTES_URL }
			>
				{ __( 'Manage attributes', 'poocommerce' ) }
			</ExternalLink>
		</ToolsPanelItem>
	);
};
