/**
 * External dependencies
 */
import { renderFrontend } from '@poocommerce/base-utils';

/**
 * Internal dependencies
 */
import FrontendContainerBlock from './frontend-container-block';

const selector = `
	.wp-block-poocommerce-all-reviews,
	.wp-block-poocommerce-reviews-by-product,
	.wp-block-poocommerce-reviews-by-category
`;

const getProps = ( el: HTMLElement ) => {
	const showOrderby = el.dataset.showOrderby === 'true';
	const showLoadMore = el.dataset.showLoadMore === 'true';

	return {
		attributes: {
			showOrderby,
			showLoadMore,
			showReviewDate: el.classList.contains( 'has-date' ),
			showReviewerName: el.classList.contains( 'has-name' ),
			showReviewImage: el.classList.contains( 'has-image' ),
			showReviewRating: el.classList.contains( 'has-rating' ),
			showReviewContent: el.classList.contains( 'has-content' ),
			showProductName: el.classList.contains( 'has-product-name' ),
		},
	};
};

renderFrontend( { selector, Block: FrontendContainerBlock, getProps } );
