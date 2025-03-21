/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Text } from '@poocommerce/experimental';
import { Flex } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	PaymentCardIcon,
	InternationalMarketIcon,
	EarnManageIcon,
	WooPayIcon,
} from './icons';

export const WCPayBenefits: React.VFC< {
	isWooPayEligible: boolean;
} > = ( { isWooPayEligible = false } ) => {
	return (
		<Flex className="poocommerce-wcpay-benefits" align="top">
			<Flex className="poocommerce-wcpay-benefits-benefit">
				<Flex className="poocommerce-wcpay-benefits-benefit-icon-container">
					<PaymentCardIcon />
				</Flex>
				<Text as="p">
					{ __(
						'Offer your customers card payments, iDeal, and the ability to sell in-person with Woo mobile app.',
						'poocommerce'
					) }
				</Text>
			</Flex>
			<Flex className="poocommerce-wcpay-benefits-benefit">
				<Flex className="poocommerce-wcpay-benefits-benefit-icon-container">
					<InternationalMarketIcon />
				</Flex>
				<Text as="p">
					{ __(
						'Sell to international markets and accept more than 135 currencies with local payment methods.',
						'poocommerce'
					) }
				</Text>
			</Flex>
			<Flex className="poocommerce-wcpay-benefits-benefit">
				<Flex className="poocommerce-wcpay-benefits-benefit-icon-container">
					<EarnManageIcon />
				</Flex>
				<Text as="p">
					{ __(
						'Earn and manage recurring revenue and get automatic deposits into your nominated bank account.',
						'poocommerce'
					) }
				</Text>
			</Flex>
			{ isWooPayEligible && (
				<Flex className="poocommerce-wcpay-benefits-benefit">
					<Flex className="poocommerce-wcpay-benefits-benefit-icon-container">
						<WooPayIcon />
					</Flex>
					<Text as="p">
						{ __(
							'Boost conversions with WooPay, a new express checkout feature included in WooPayments.',
							'poocommerce'
						) }
					</Text>
				</Flex>
			) }
		</Flex>
	);
};
