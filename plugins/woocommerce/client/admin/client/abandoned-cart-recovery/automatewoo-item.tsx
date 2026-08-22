/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { ProductIcon } from '~/marketing/components';

const AUTOMATEWOO_URL =
	'https://poocommerce.com/products/automatewoo/?utm_source=poocommerce&utm_medium=product&utm_campaign=abandoned-cart-recovery-recommendation';

const AutomateWooItem = () => {
	const handleClick = () => {
		recordEvent( 'abandoned_cart_recovery_recommendation_click', {
			plugin: 'automatewoo',
		} );
	};

	return (
		<div className="poocommerce-list__item-inner poocommerce-abandoned-cart-recovery-recommendation-item">
			<div className="poocommerce-list__item-before">
				<ProductIcon product="automatewoo" />
			</div>
			<div className="poocommerce-list__item-text">
				<span className="poocommerce-list__item-title">
					{ __( 'AutomateWoo', 'poocommerce' ) }
				</span>
				<span className="poocommerce-list__item-content">
					{ __(
						'Set up multi-step abandoned cart sequences, win-back flows, and review requests. Track exactly which campaigns earn the most revenue.',
						'poocommerce'
					) }
				</span>
			</div>
			<div className="poocommerce-list__item-after">
				<Button
					variant="secondary"
					href={ AUTOMATEWOO_URL }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ handleClick }
				>
					{ __( 'Learn more', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default AutomateWooItem;
