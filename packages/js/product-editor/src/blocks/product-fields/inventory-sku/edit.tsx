/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockAttributes } from '@wordpress/blocks';
import { useInstanceId } from '@wordpress/compose';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useWooBlockProps } from '@poocommerce/block-templates';
import { Product } from '@poocommerce/data';
import {
	BaseControl,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { ProductEditorBlockEditProps } from '../../../types';
import { useValidation } from '../../../contexts/validation-context';

/**
 * Internal dependencies
 */

export function Edit( {
	attributes,
	context,
}: ProductEditorBlockEditProps< BlockAttributes > ) {
	const blockProps = useWooBlockProps( attributes );

	const [ sku, setSku ] = useEntityProp< string >(
		'postType',
		context.postType,
		'sku'
	);

	const { ref: skuRef } = useValidation< Product >(
		'sku',
		async function skuValidator() {
			return undefined;
		},
		[ sku ]
	);

	const inputControlId = useInstanceId(
		BaseControl,
		'product_sku'
	) as string;

	return (
		<div { ...blockProps }>
			<BaseControl
				id={ inputControlId }
				className="poocommerce-product-form_inventory-sku"
				label={ createInterpolateElement(
					__( 'Sku <description />', 'poocommerce' ),
					{
						description: (
							<span className="poocommerce-product-form__optional-input">
								{ __( '(STOCK KEEPING UNIT)', 'poocommerce' ) }
							</span>
						),
					}
				) }
			>
				<InputControl
					ref={ skuRef }
					id={ inputControlId }
					name={ 'poocommerce-product-sku' }
					onChange={ ( nextValue ) => {
						setSku( nextValue ?? '' );
					} }
					value={ sku || '' }
					disabled={ attributes.disabled }
				/>
			</BaseControl>
		</div>
	);
}
