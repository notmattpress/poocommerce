/**
 * External dependencies
 */
import { lazy, Suspense } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { EmbeddedBodyProps } from '../embedded-body-layout/embedded-body-props';
import RecommendationsEligibilityWrapper from '../settings-recommendations/recommendations-eligibility-wrapper';
import { isFeatureEnabled } from '~/utils/features';

const PaymentRecommendationsChunk = lazy(
	() =>
		import(
			/* webpackChunkName: "payment-recommendations" */ './payment-recommendations'
		)
);

export const PaymentRecommendations = ( {
	page,
	tab,
	section,
}: EmbeddedBodyProps ) => {
	if (
		page === 'wc-settings' &&
		tab === 'checkout' &&
		( ! section || section === 'main' ) &&
		! isFeatureEnabled( 'reactify-classic-payments-settings' ) // don't show this on the new payment settings page.
	) {
		return (
			<RecommendationsEligibilityWrapper>
				<Suspense fallback={ null }>
					<PaymentRecommendationsChunk />
				</Suspense>
			</RecommendationsEligibilityWrapper>
		);
	}
	return null;
};
