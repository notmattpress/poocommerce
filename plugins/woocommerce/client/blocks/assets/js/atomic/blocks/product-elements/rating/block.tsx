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
import { ProductEntityResponse } from '@poocommerce/entities';

/**
 * Internal dependencies
 */
import './style.scss';

type ProductRatingProps = {
	className?: string;
	textAlign?: string;
	isDescendentOfQueryLoop: boolean;
	postId: number;
	productId: number;
	shouldDisplayMockedReviewsWhenProductHasNoReviews: boolean;
	product: ProductEntityResponse;
	isAdmin: boolean;
};

export const Block = ( props: ProductRatingProps ): JSX.Element | undefined => {
	const {
		textAlign = '',
		shouldDisplayMockedReviewsWhenProductHasNoReviews,
		isDescendentOfQueryLoop,
		product: productEntity,
	} = props;
	const styleProps = useStyleProps( props );
	const { parentClassName } = useInnerBlockLayoutContext();
	const { product } = useProductDataContext( {
		product: productEntity,
		isAdmin: props.isAdmin,
	} );
	const rating = product ? getAverageRating( product ) : 0;
	const reviews = product ? getRatingCount( product ) : 0;

	const className = 'wc-block-components-product-rating';

	if ( reviews || shouldDisplayMockedReviewsWhenProductHasNoReviews ) {
		return (
			<ProductRating
				className={ className }
				showReviewCount={ ! isDescendentOfQueryLoop }
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
	}
};

export default withProductDataContext( Block );
