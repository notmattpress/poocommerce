/**
 * External dependencies
 */
import { eye } from '@poocommerce/icons';
import { useProductDataContext } from '@poocommerce/shared-context';
import { __ } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';
import {
	Icon,
	ToolbarGroup,

	// @ts-expect-error no exported member.
	ToolbarDropdownMenu,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import useProductTypeSelector from '../../hooks/use-product-type-selector';

export default function ToolbarProductTypeGroup() {
	const {
		current: currentProductType,
		productTypes,
		set,
	} = useProductTypeSelector();

	const { product } = useProductDataContext();

	/*
	 * Do not render the component if the product is not set
	 * or if there is only one product type.
	 */
	if ( product?.id || productTypes?.length < 2 ) {
		return null;
	}

	return (
		<ToolbarGroup>
			<ToolbarDropdownMenu
				icon={ <Icon icon={ eye } /> }
				text={
					currentProductType?.label ||
					__( 'Switch product type', 'poocommerce' )
				}
				value={ currentProductType?.slug }
				controls={ productTypes.map( ( productType ) => ( {
					title: productType.label,
					onClick: () => {
						set( productType.slug );
						if ( currentProductType?.slug !== productType.slug ) {
							recordEvent(
								'blocks_add_to_cart_with_options_product_type_switched',
								{
									context: 'toolbar',
									from: currentProductType?.slug,
									to: productType.slug,
								}
							);
						}
					},
				} ) ) }
			/>
		</ToolbarGroup>
	);
}
