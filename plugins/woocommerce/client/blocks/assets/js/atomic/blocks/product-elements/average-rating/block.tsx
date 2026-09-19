/**
 * External dependencies
 */
import clsx from 'clsx';
import { useProductDataContext } from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { __ } from '@wordpress/i18n';
import { withProductDataContext } from '@poocommerce/shared-hocs';

type ProductAverageRatingProps = {
	className?: string;
	textAlign?: string;
};

export const Block = ( props: ProductAverageRatingProps ): JSX.Element => {
	const { textAlign } = props;
	const styleProps = useStyleProps( props );
	const { product } = useProductDataContext();

	const className = clsx(
		styleProps.className,
		'wc-block-components-product-average-rating',
		{
			[ `has-text-align-${ textAlign }` ]: textAlign,
		}
	);

	return (
		<div className={ className } style={ styleProps.style }>
			{ Number( product.average_rating ) > 0
				? product.average_rating
				: __( 'No ratings', 'poocommerce' ) }
		</div>
	);
};

export default withProductDataContext( Block );
