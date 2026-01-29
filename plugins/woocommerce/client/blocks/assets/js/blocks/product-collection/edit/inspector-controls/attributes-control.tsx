/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import ProductAttributeTermControl from '@poocommerce/editor-components/product-attribute-term-control';
import { SearchListItem } from '@poocommerce/editor-components/search-list-control/types';
import { ADMIN_URL } from '@poocommerce/settings';
import {
	ExternalLink,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { CoreFilterNames, QueryControlProps } from '../../types';
import { DEFAULT_FILTERS } from '../../constants';

const EDIT_ATTRIBUTES_URL = `${ ADMIN_URL }edit.php?post_type=product&page=product_attributes`;

const AttributesControl = ( {
	query,
	trackInteraction,
	setQueryAttribute,
}: QueryControlProps ) => {
	const poocommerceAttributes = query.poocommerceAttributes || [];
	const selectedAttributes = poocommerceAttributes?.map(
		( { termId: id } ) => ( {
			id,
		} )
	);

	const deselectCallback = () => {
		setQueryAttribute( {
			poocommerceAttributes: DEFAULT_FILTERS.poocommerceAttributes,
		} );
		trackInteraction( CoreFilterNames.ATTRIBUTES );
	};

	return (
		<ToolsPanelItem
			label={ __( 'Product Attributes', 'poocommerce' ) }
			hasValue={ () => !! poocommerceAttributes?.length }
			onDeselect={ deselectCallback }
			resetAllFilter={ deselectCallback }
		>
			<ProductAttributeTermControl
				messages={ {
					search: __( 'Attributes', 'poocommerce' ),
				} }
				selected={ selectedAttributes || [] }
				onChange={ ( searchListItems: SearchListItem[] ) => {
					const newValue = searchListItems.map(
						( { id, value } ) => ( {
							termId: id as number,
							taxonomy: value as string,
						} )
					);

					setQueryAttribute( {
						poocommerceAttributes: newValue,
					} );
					trackInteraction( CoreFilterNames.ATTRIBUTES );
				} }
				operator={ 'any' }
				isCompact={ true }
				type={ 'token' }
			/>
			<ExternalLink
				className="wc-block-editor-product-collection-panel__manage-attributes-link"
				href={ EDIT_ATTRIBUTES_URL }
			>
				{ __( 'Manage attributes', 'poocommerce' ) }
			</ExternalLink>
		</ToolsPanelItem>
	);
};

export default AttributesControl;
