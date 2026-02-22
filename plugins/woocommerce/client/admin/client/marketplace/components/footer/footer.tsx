/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { check, commentContent, shield, people } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './footer.scss';
import IconWithText from '../icon-with-text/icon-with-text';
import { MARKETPLACE_HOST } from '../constants';
import { TrackedLink } from '../../../components/tracked-link/tracked-link';

export const refundPolicyTitle = ( location: string ) => {
	return (
		<TrackedLink
			targetUrl={ MARKETPLACE_HOST + '/refund-policy/' }
			linkType="external"
			eventName={ `marketplace_${ location }_link_click` }
			eventProperties={ {
				feature_clicked: 'money_back_guarantee',
			} }
			message={ __(
				'30-day {{Link}}money-back guarantee{{/Link}}',
				'poocommerce'
			) }
			target="_blank"
		/>
	);
};

export const supportTitle = ( location: string ) => {
	return (
		<TrackedLink
			targetUrl={ MARKETPLACE_HOST + '/docs/' }
			linkType="external"
			eventName={ `marketplace_${ location }_link_click` }
			eventProperties={ {
				feature_clicked: 'get_help',
			} }
			message={ __(
				'{{Link}}Get help{{/Link}} when you need it',
				'poocommerce'
			) }
			target="_blank"
		/>
	);
};

export const paymentTitle = ( location: string ) => {
	return (
		<TrackedLink
			targetUrl={ MARKETPLACE_HOST + '/products/' }
			linkType="external"
			eventName={ `marketplace_${ location }_link_click` }
			eventProperties={ {
				feature_clicked: 'products_you_can_trust',
			} }
			message={ __(
				'{{Link}}Products{{/Link}} you can trust',
				'poocommerce'
			) }
			target="_blank"
		/>
	);
};

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
					title={ refundPolicyTitle( 'footer' ) }
					description={ __(
						"If you change your mind within 30 days of your purchase, we'll give you a full refund — hassle-free.",
						'poocommerce'
					) }
				/>
				<IconWithText
					icon={ commentContent }
					title={ supportTitle( 'footer' ) }
					description={ __(
						'With detailed documentation and a global support team, help is always available if you need it.',
						'poocommerce'
					) }
				/>
				<IconWithText
					icon={ shield }
					title={ paymentTitle( 'footer' ) }
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
