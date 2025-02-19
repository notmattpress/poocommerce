/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { check, commentContent, shield, people } from '@wordpress/icons';
import { createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './footer.scss';
import IconWithText from '../icon-with-text/icon-with-text';
import { MARKETPLACE_HOST } from '../constants';

const refundPolicyTitle = createInterpolateElement(
	__( '30-day <a>money-back guarantee</a>', 'poocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_HOST + '/refund-policy/' } />,
	}
);

const supportTitle = createInterpolateElement(
	__( '<a>Get help</a> when you need it', 'poocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_HOST + '/docs/' } />,
	}
);

const paymentTitle = createInterpolateElement(
	__( '<a>Products</a> you can trust', 'poocommerce' ),
	{
		// eslint-disable-next-line jsx-a11y/anchor-has-content
		a: <a href={ MARKETPLACE_HOST + '/products/' } />,
	}
);

function FooterContent(): JSX.Element {
	return (
		<div className="poocommerce-marketplace__footer-content">
			<h2 className="poocommerce-marketplace__footer-title">
				{ __(
					'Hundreds of vetted products and services. Unlimited potential.',
					'poocommerce'
				) }
			</h2>
			<div className="poocommerce-marketplace__footer-columns">
				<IconWithText
					icon={ check }
					title={ refundPolicyTitle }
					description={ __(
						"If you change your mind within 30 days of your purchase, we'll give you a full refund — hassle-free.",
						'poocommerce'
					) }
				/>
				<IconWithText
					icon={ commentContent }
					title={ supportTitle }
					description={ __(
						'With detailed documentation and a global support team, help is always available if you need it.',
						'poocommerce'
					) }
				/>
				<IconWithText
					icon={ shield }
					title={ paymentTitle }
					description={ __(
						'Everything in the Marketplace has been built by our own team or by our trusted partners, so you can be sure of its quality.',
						'poocommerce'
					) }
				/>
				<IconWithText
					icon={ people }
					title={ __( 'Support the ecosystem', 'poocommerce' ) }
					description={ __(
						'Our team and partners are continuously improving your extensions, themes, and PooCommerce experience.',
						'poocommerce'
					) }
				/>
			</div>
		</div>
	);
}

export default function Footer(): JSX.Element {
	return (
		<div className="poocommerce-marketplace__footer">
			<FooterContent />
		</div>
	);
}
