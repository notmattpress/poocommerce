/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TimerImage from './shipping-providers/assets/timer.svg';
import DiscountImage from './shipping-providers/assets/discount.svg';
import StarImage from './shipping-providers/assets/star.svg';

export const SinglePartnerFeatures = [
	{
		icon: TimerImage,
		title: __( 'Save time', 'poocommerce' ),
		description: __(
			'Automatically import order information to quickly print your labels.',
			'poocommerce'
		),
	},
	{
		icon: DiscountImage,
		title: __( 'Save money', 'poocommerce' ),
		description: __(
			'Shop for the best shipping rates, and access pre-negotiated discounted rates.',
			'poocommerce'
		),
	},
	{
		icon: StarImage,
		title: __( 'Wow your shoppers', 'poocommerce' ),
		description: __(
			'Keep your customers informed with tracking notifications.',
			'poocommerce'
		),
	},
];
