/**
 * External dependencies
 */
import {
	useInnerBlockLayoutContext,
	useProductDataContext,
} from '@poocommerce/shared-context';
import { useStyleProps } from '@poocommerce/base-hooks';
import { withProductDataContext } from '@poocommerce/shared-hocs';
import {
	ProductRating,
	getAverageRating,
	getRatingCount,
} from '@poocommerce/editor-components/product-rating';

/**
 * Internal dependencies
 */
import './style.scss';

interface ProductRatingStarsProps {
	className?: string;
	textAlign?: string;
	isDescendentOfQueryLoop: boolean;
	postId: number;
	productId: number;
	shouldDisplayMockedReviewsWhenProductHasNoReviews: boolean;
}

export const Block = ( props: ProductRatingStarsProps ): JSX.Element | null => {
	const {
		textAlign = '',
		shouldDisplayMockedReviewsWhenProductHasNoReviews,
	} = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext();
	const rating = getAverageRating( product );
	const reviews = getRatingCount( product );
	const className = 'wc-block-components-product-rating-stars';

	return (
		<ProductRating
			className={ className }
			showMockedReviews={
				shouldDisplayMockedReviewsWhenProductHasNoReviews
			}
			styleProps={ styleProps }
			parentClassName={ parentClassName }
			reviews={ reviews }
			rating={ rating }
			textAlign={ textAlign }
		/>
	);
};

export default withProductDataContext( Block );
