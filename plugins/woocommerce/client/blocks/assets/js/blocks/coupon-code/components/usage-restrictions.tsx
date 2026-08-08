/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { CouponCodeAttributes } from '../types';
import { ProductSearch } from './product-search';

interface UsageRestrictionsProps {
	attributes: CouponCodeAttributes;
	setAttributes: ( attrs: Partial< CouponCodeAttributes > ) => void;
}

export function UsageRestrictions( {
	attributes,
	setAttributes,
}: UsageRestrictionsProps ): JSX.Element {
	return (
		<PanelBody
			title={ __( 'Usage restrictions', 'poocommerce' ) }
			initialOpen={ false }
		>
			<TextControl
				label={ __( 'Minimum spend', 'poocommerce' ) }
				value={ attributes.minimumAmount }
				onChange={ ( value ) =>
					setAttributes( { minimumAmount: value } )
				}
				type="number"
				min={ 0 }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
			<TextControl
				label={ __( 'Maximum spend', 'poocommerce' ) }
				value={ attributes.maximumAmount }
				onChange={ ( value ) =>
					setAttributes( { maximumAmount: value } )
				}
				type="number"
				min={ 0 }
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
			<ToggleControl
				label={ __( 'Individual use only', 'poocommerce' ) }
				help={ __(
					'If checked, this coupon cannot be used in conjunction with other coupons.',
					'poocommerce'
				) }
				checked={ attributes.individualUse }
				onChange={ ( value ) =>
					setAttributes( { individualUse: value } )
				}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={ __( 'Exclude sale items', 'poocommerce' ) }
				help={ __(
					'If checked, this coupon will not apply to items on sale.',
					'poocommerce'
				) }
				checked={ attributes.excludeSaleItems }
				onChange={ ( value ) =>
					setAttributes( { excludeSaleItems: value } )
				}
				__nextHasNoMarginBottom
			/>
			<ProductSearch
				label={ __( 'Products', 'poocommerce' ) }
				value={ attributes.productIds }
				onChange={ ( items ) => setAttributes( { productIds: items } ) }
				endpoint="products"
			/>
			<ProductSearch
				label={ __( 'Excluded products', 'poocommerce' ) }
				value={ attributes.excludedProductIds }
				onChange={ ( items ) =>
					setAttributes( { excludedProductIds: items } )
				}
				endpoint="products"
			/>
			<ProductSearch
				label={ __( 'Product categories', 'poocommerce' ) }
				value={ attributes.productCategoryIds }
				onChange={ ( items ) =>
					setAttributes( { productCategoryIds: items } )
				}
				endpoint="products/categories"
			/>
			<ProductSearch
				label={ __( 'Excluded product categories', 'poocommerce' ) }
				value={ attributes.excludedProductCategoryIds }
				onChange={ ( items ) =>
					setAttributes( {
						excludedProductCategoryIds: items,
					} )
				}
				endpoint="products/categories"
			/>
			<TextControl
				label={ __( 'Allowed emails', 'poocommerce' ) }
				help={ __(
					"Comma-separated list of allowed emails to check against the customer's billing email.",
					'poocommerce'
				) }
				value={ attributes.emailRestrictions }
				onChange={ ( value ) =>
					setAttributes( { emailRestrictions: value } )
				}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			/>
		</PanelBody>
	);
}
