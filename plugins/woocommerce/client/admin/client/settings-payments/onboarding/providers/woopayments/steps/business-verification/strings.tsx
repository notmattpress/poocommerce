/* eslint-disable max-len */
/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import interpolateComponents from '@automattic/interpolate-components';
import React from 'react';

const documentationUrls = {
	tos: 'https://wordpress.com/tos/',
	signUpLink:
		'https://poocommerce.com/document/woopayments/startup-guide/#sign-up-process',
	merchantTerms: 'https://wordpress.com/tos/#more-woopay-specifically',
	privacyPolicy: 'https://automattic.com/privacy/',
};

export default {
	steps: {
		activate: {
			heading: __( 'Start accepting real payments', 'poocommerce' ),
			subheading: interpolateComponents( {
				mixedString: __(
					'You are currently testing payments on your store. To activate real payments, you will need to provide some additional details about your business. {{link}}Learn more{{/link}}.',
					'poocommerce'
				),
				components: {
					link: (
						// eslint-disable-next-line jsx-a11y/anchor-has-content
						<a
							rel="external noopener noreferrer"
							target="_blank"
							href={ documentationUrls.signUpLink }
						/>
					),
				},
			} ),
			cta: __( 'Activate payments', 'poocommerce' ),
		},
		business: {
			heading: __(
				'Let’s get your store ready to accept payments',
				'poocommerce'
			),
			subheading: __(
				'We’ll use these details to enable payments for your store. This information can’t be changed after your account is created.',
				'poocommerce'
			),
		},
		store: {
			heading: __( 'Please share a few more details', 'poocommerce' ),
			subheading: __(
				'This info will help us speed up the set up process.',
				'poocommerce'
			),
		},
		loading: {
			heading: __(
				'One last step! Verify your identity with our partner',
				'poocommerce'
			),
			subheading: __(
				'This will take place in a secure environment through our partner. Once your business details are verified, you’ll be redirected back to your store dashboard.',
				'poocommerce'
			),
			cta: __( 'Finish your verification process', 'poocommerce' ),
		},
		embedded: {
			heading: __(
				'One last step! Verify your identity with our partner',
				'poocommerce'
			),
			subheading: __(
				'This info will verify your account',
				'poocommerce'
			),
		},
	},
	fields: {
		country: __( 'Where is your business located?', 'poocommerce' ),
		business_type: __(
			'What type of legal entity is your business?',
			'poocommerce'
		),
		'company.structure': __(
			'What category of legal entity identify your business?',
			'poocommerce'
		),
		mcc: __(
			'What type of goods or services does your business sell? ',
			'poocommerce'
		),
	},
	errors: {
		generic: __( 'Please provide a response', 'poocommerce' ),
		country: __( 'Please provide a country', 'poocommerce' ),
		business_type: __( 'Please provide a business type', 'poocommerce' ),
		mcc: __( 'Please provide a type of goods or services', 'poocommerce' ),
	},
	placeholders: {
		generic: __( 'Select an option', 'poocommerce' ),
		country: __( 'Select a country', 'poocommerce' ),
	},
	tos: interpolateComponents( {
		mixedString: sprintf(
			/* translators: %1$s: WooPayments, %2$s: WooPay  */
			__(
				'By using %1$s, you agree to be bound by our {{tosLink}}Terms of Service{{/tosLink}} (including {{merchantTermsLink}}%2$s merchant terms{{/merchantTermsLink}}) and acknowledge that you have read our {{privacyPolicyLink}}Privacy Policy{{/privacyPolicyLink}}.',
				'poocommerce'
			),
			'WooPayments',
			'WooPay'
		),
		components: {
			tosLink: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					rel="external noopener noreferrer"
					target="_blank"
					href={ documentationUrls.tos }
				/>
			),
			merchantTermsLink: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					rel="external noopener noreferrer"
					target="_blank"
					href={ documentationUrls.merchantTerms }
				/>
			),
			privacyPolicyLink: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					rel="external noopener noreferrer"
					target="_blank"
					href={ documentationUrls.privacyPolicy }
				/>
			),
		},
	} ),
	continue: __( 'Continue', 'poocommerce' ),
	back: __( 'Back', 'poocommerce' ),
	cancel: __( 'Cancel', 'poocommerce' ),
};
