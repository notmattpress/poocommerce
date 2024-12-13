/**
 * External dependencies
 */
import { Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cleanForSlug } from '@wordpress/url';
import { useFormContext } from '@poocommerce/components';
import { Product } from '@poocommerce/data';
import {
	useState,
	createElement,
	createInterpolateElement,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { PRODUCT_DETAILS_SLUG } from '../../constants';
import { EditProductLinkModal } from '../edit-product-link-modal';
import { useProductHelper } from '../../hooks/use-product-helper';
import { getPermalinkParts } from '../../utils';

export const DetailsNameField = ( {} ) => {
	const { updateProductWithStatus } = useProductHelper();
	const [ showProductLinkEditModal, setShowProductLinkEditModal ] =
		useState( false );
	const { getInputProps, values, touched, errors, setValue, resetForm } =
		useFormContext< Product >();

	const { prefix: permalinkPrefix, suffix: permalinkSuffix } =
		getPermalinkParts( values );

	const hasNameError = () => {
		return Boolean( touched.name ) && Boolean( errors.name );
	};

	const setSkuIfEmpty = () => {
		if ( values.sku || ! values.name?.length ) {
			return;
		}
		setValue( 'sku', cleanForSlug( values.name ) );
	};
	return (
		<div>
			<TextControl
				label={ createInterpolateElement(
					__( 'Name <required />', 'poocommerce' ),
					{
						required: (
							<span className="poocommerce-product-form__optional-input">
								{ __( '(required)', 'poocommerce' ) }
							</span>
						),
					}
				) }
				name={ `${ PRODUCT_DETAILS_SLUG }-name` }
				placeholder={ __( 'e.g. 12 oz Coffee Mug', 'poocommerce' ) }
				{ ...getInputProps( 'name', {
					onBlur: setSkuIfEmpty,
				} ) }
			/>
			{ values.id && ! hasNameError() && permalinkPrefix && (
				<span className="poocommerce-product-form__secondary-text product-details-section__product-link">
					{ __( 'Product link', 'poocommerce' ) }
					:&nbsp;
					<a
						href={ values.permalink }
						target="_blank"
						rel="noreferrer"
					>
						{ permalinkPrefix }
						{ values.slug || cleanForSlug( values.name ) }
						{ permalinkSuffix }
					</a>
					<Button
						variant="link"
						onClick={ () => setShowProductLinkEditModal( true ) }
					>
						{ __( 'Edit', 'poocommerce' ) }
					</Button>
				</span>
			) }
			{ showProductLinkEditModal && (
				<EditProductLinkModal
					permalinkPrefix={ permalinkPrefix || '' }
					permalinkSuffix={ permalinkSuffix || '' }
					product={ values }
					onCancel={ () => setShowProductLinkEditModal( false ) }
					onSaved={ () => setShowProductLinkEditModal( false ) }
					saveHandler={ async ( slug ) => {
						const updatedProduct = await updateProductWithStatus(
							values.id,
							{
								slug,
							},
							values.status,
							true
						);
						if ( updatedProduct && updatedProduct.id ) {
							// only reset the updated slug and permalink fields.
							resetForm(
								{
									...values,
									slug: updatedProduct.slug,
									permalink: updatedProduct.permalink,
								},
								touched,
								errors
							);

							return {
								slug: updatedProduct.slug,
								permalink: updatedProduct.permalink,
							};
						}
					} }
				/>
			) }
		</div>
	);
};
