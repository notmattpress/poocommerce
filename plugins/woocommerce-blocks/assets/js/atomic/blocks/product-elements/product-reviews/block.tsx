// We are using anchors as mere placeholders to replicate the front-end look.
/* eslint-disable jsx-a11y/anchor-is-valid */

/**
 * External dependencies
 */
import { WC_BLOCKS_IMAGE_URL } from '@poocommerce/block-settings';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';

export const ProductReviews = () => {
	return (
		<>
			<Notice
				className={ 'wc-block-editor-related-products__notice' }
				status={ 'info' }
				isDismissible={ false }
			>
				<p>
					{ __(
						'The products reviews and the form to add a new review will be displayed here according to your theme. The look you see here is not representative of what is going to look like, this is just a placeholder.',
						'poocommerce'
					) }
				</p>
			</Notice>
			<h2>{ __( '3 reviews for this product', 'poocommerce' ) }</h2>
			<img
				src={ `${ WC_BLOCKS_IMAGE_URL }block-placeholders/product-reviews.svg` }
				alt="Placeholder"
			/>
			<h3>{ __( 'Add a review', 'poocommerce' ) }</h3>
			<div className="wp-block-poocommerce-product-reviews__editor__form-container">
				<div className="wp-block-poocommerce-product-reviews__editor__row">
					<span>{ __( 'Your rating *', 'poocommerce' ) }</span>
					<p className="wp-block-poocommerce-product-reviews__editor__stars"></p>
				</div>
				<div className="wp-block-poocommerce-product-reviews__editor__row">
					<span>{ __( 'Your review *', 'poocommerce' ) }</span>
					<textarea />
				</div>
				<input
					type="submit"
					className="submit wp-block-button__link wp-element-button"
					value={ __( 'Submit', 'poocommerce' ) }
				/>
			</div>
		</>
	);
};

export default ProductReviews;
