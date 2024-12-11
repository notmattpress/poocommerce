/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Rating from './index';

type ReviewRatingProps = {
	review: {
		rating?: number;
	};
};

/**
 * Display a set of stars representing the review's rating.
 */
const ReviewRating: React.VFC< ReviewRatingProps > = ( {
	review,
	...props
} ) => {
	return <Rating rating={ review.rating || 0 } { ...props } />;
};

ReviewRating.propTypes = {
	/**
	 * A review object containing a `rating`.
	 * See https://poocommerce.github.io/poocommerce-rest-api-docs/#retrieve-product-reviews.
	 */
	review: PropTypes.object.isRequired,
};

export default ReviewRating;
