/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { withProductDataContext } from '@poocommerce/shared-hocs';
import { isNumber, ProductResponseItem } from '@poocommerce/types';
import { Disabled } from '@wordpress/components';

const getRatingCount = ( product: ProductResponseItem ) => {
	const count = isNumber( product.review_count )
		? product.review_count
		: parseInt( product.review_count, 10 );

	return Number.isFinite( count ) && count > 0 ? count : 0;
};

const ReviewsCount = ( props: { reviews: number } ): JSX.Element => {
	const { reviews } = props;

	const reviewsCount = reviews
		? sprintf(
				/* translators: %s is referring to the total of reviews for a product */
				_n(
					'(%s customer review)',
					'(%s customer reviews)',
					reviews,
					'poocommerce'
				),
				reviews
		  )
		: __( '(X customer reviews)', 'poocommerce' );

	return (
		<span className="wc-block-components-product-rating-counter__reviews_count">
			<Disabled>
				<a href="/">{ reviewsCount }</a>
			</Disabled>
		</span>
	);
};

type ProductRatingCounterProps = {
	className?: string;
	textAlign?: string;
	isDescendentOfSingleProductBlock: boolean;
	isDescendentOfQueryLoop: boolean;
	postId: number;
	productId: number;
	shouldDisplayMockedReviewsWhenProductHasNoReviews: boolean;
};

export const Block = (
	props: ProductRatingCounterProps
): JSX.Element | undefined => {
	const { textAlign, shouldDisplayMockedReviewsWhenProductHasNoReviews } =
		props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();
	const reviews = getRatingCount( product );

	const className = clsx(
		styleProps.className,
		'wc-block-components-product-rating-counter',
		{
			[ `${ parentClassName }__product-rating` ]: parentClassName,
			[ `has-text-align-${ textAlign }` ]: textAlign,
		}
	);

	if ( reviews || shouldDisplayMockedReviewsWhenProductHasNoReviews ) {
		return (
			<div className={ className } style={ styleProps.style }>
				<div className="wc-block-components-product-rating-counter__container">
					<ReviewsCount reviews={ reviews } />
				</div>
			</div>
		);
	}
};

export default withProductDataContext( Block );
