/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Disabled } from '@wordpress/components';
import { MultiLineTextSkeleton } from '@poocommerce/base-components/skeleton/patterns/multi-line-text-skeleton';

export const Skeleton = ( {
	buttonText,
	productType,
	isLoading = false,
}: {
	buttonText?: string | undefined;
	productType?: string | undefined;
	isLoading?: boolean;
} ) => {
	return (
		<div
			aria-label={
				isLoading
					? __(
							'Loading the Add to Cart + Options template part',
							'poocommerce'
					  )
					: __( 'Add to Cart + Options form', 'poocommerce' )
			}
		>
			<div className="wp-block-poocommerce-add-to-cart-with-options__skeleton-wrapper">
				<MultiLineTextSkeleton isStatic={ ! isLoading } />
			</div>
			<Disabled>
				<button
					className={ `alt wp-element-button ${
						productType || 'simple'
					}_add_to_cart_button` }
				>
					{ buttonText || __( 'Add to cart', 'poocommerce' ) }
				</button>
			</Disabled>
		</div>
	);
};
