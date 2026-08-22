/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Placeholder } from '@wordpress/components';
import { Icon, commentContent } from '@wordpress/icons';

interface NoReviewsPlaceholderProps {
	reason: 'no-reviews' | 'offset';
}

const NoReviewsPlaceholder = ( {
	reason,
}: NoReviewsPlaceholderProps ): JSX.Element => {
	return (
		<Placeholder
			className="wc-block-reviews-by-category"
			icon={
				<Icon
					icon={ commentContent }
					className="block-editor-block-icon"
				/>
			}
			label={ __( 'Reviews by Category', 'poocommerce' ) }
		>
			{ reason === 'offset'
				? __(
						'No reviews are visible with the current offset. Reduce the offset to display reviews.',
						'poocommerce'
				  )
				: __(
						'This block lists reviews for products from selected categories. The selected categories do not have any reviews yet, but they will show up here when they do.',
						'poocommerce'
				  ) }
		</Placeholder>
	);
};

export default NoReviewsPlaceholder;
