/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { BlockEditProps } from '@wordpress/blocks';

import { Disabled } from '@wordpress/components';
import { ProductShortDescriptionSkeleton } from '@poocommerce/base-components/skeleton/patterns/product-short-description';
import { useProductDataContext } from '@poocommerce/shared-context';
import {
	BlockControls,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ToolbarProductTypeGroup from '../components/toolbar-type-product-selector-group';
import { DowngradeNotice } from '../components/downgrade-notice';
import { useProductTypeSelector } from '../../../shared/stores/product-type-template-state';
import type { Attributes } from '../types';
import { AddToCartWithOptionsEditTemplatePart } from './edit-template-part';

const AddToCartOptionsEdit = ( props: BlockEditProps< Attributes > ) => {
	const { product } = useProductDataContext();

	const blockProps = useBlockProps();
	const blockClientId = blockProps?.id;

	const {
		current: currentProductType,
		registerListener,
		unregisterListener,
	} = useProductTypeSelector();

	useEffect( () => {
		registerListener( blockClientId );
		return () => {
			unregisterListener( blockClientId );
		};
	}, [ blockClientId, registerListener, unregisterListener ] );

	const productType =
		product.id === 0 ? currentProductType?.slug : product.type;
	const isCoreProductType =
		productType &&
		[ 'simple', 'variable', 'external', 'grouped' ].includes( productType );

	return (
		<>
			<InspectorControls>
				<DowngradeNotice blockClientId={ props?.clientId } />
			</InspectorControls>
			<BlockControls>
				<ToolbarProductTypeGroup />
			</BlockControls>
			{ isCoreProductType ? (
				<AddToCartWithOptionsEditTemplatePart
					productType={ productType }
				/>
			) : (
				<div { ...blockProps }>
					<div className="wp-block-poocommerce-add-to-cart-with-options__skeleton-wrapper">
						<ProductShortDescriptionSkeleton />
					</div>
					<Disabled>
						<button
							className={ `alt wp-element-button ${ productType }_add_to_cart_button` }
						>
							{ __( 'Add to cart', 'poocommerce' ) }
						</button>
					</Disabled>
				</div>
			) }
		</>
	);
};

export default AddToCartOptionsEdit;
