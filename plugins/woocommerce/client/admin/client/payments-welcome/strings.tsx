/* eslint-disable max-len */
/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';

export default {
	noThanks: __( 'No thanks', 'poocommerce' ),
	heading: ( firstName?: string ) =>
		sprintf(
			/* translators: %s: first name of the merchant, if it exists. */
			__(
				'Hi%s, run your business and manage your payments all in one place, with no setup costs or monthly fees.',
				'poocommerce'
			),
			firstName ? ` ${ firstName }` : ''
		),
	limitedTimeOffer: __( 'Limited time offer', 'poocommerce' ),
	TosAndPp: createInterpolateElement(
		__(
			'By using WooPayments you agree to our <a1>Terms of Service</a2> and acknowledge that you have read our <a2>Privacy Policy</a2>. Discount will be applied to payments processed via WooPayments upon completion of installation, setup, and connection. ',
			'poocommerce'
		),
		{
			a1: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href="https://wordpress.com/tos"
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
			a2: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href="https://automattic.com/privacy/"
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
		}
	),
	TosAndPpWooPay: createInterpolateElement(
		__(
			'By using WooPayments you agree to our <a1>Terms of Service</a2> (including WooPay <a3>merchant terms</a3>) and acknowledge that you have read our <a2>Privacy Policy</a2>. Discount will be applied to payments processed via WooPayments upon completion of installation, setup, and connection. ',
			'poocommerce'
		),
		{
			a1: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href="https://wordpress.com/tos"
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
			a2: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href="https://automattic.com/privacy/"
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
			a3: (
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<a
					href="https://wordpress.com/tos/#more-woopay-specifically"
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
		}
	),
	termsAndConditions: ( url: string ) =>
		createInterpolateElement(
			__(
				'*See <a>Terms and Conditions</a> for details.',
				'poocommerce'
			),
			{
				a: (
					// eslint-disable-next-line jsx-a11y/anchor-has-content
					<a href={ url } target="_blank" rel="noopener noreferrer" />
				),
			}
		),
	paymentOptions: __(
		'WooPayments is pre-integrated with all popular payment options',
		'poocommerce'
	),
	andMore: __( '& more', 'poocommerce' ),
	learnMore: __( 'Learn more', 'poocommerce' ),
	survey: {
		title: __( 'No thanks, I don’t want WooPayments', 'poocommerce' ),
		intro: __(
			'Note that the extension hasn’t been installed. This will simply dismiss our limited time offer. Please take a moment to tell us why you’d like to dismiss the WooPayments offer.',
			'poocommerce'
		),
		question: __(
			'Why would you like to dismiss the new payments experience?',
			'poocommerce'
		),
		happyLabel: __(
			'I’m already happy with my payments setup',
			'poocommerce'
		),
		installLabel: __(
			'I don’t want to install another plugin',
			'poocommerce'
		),
		moreInfoLabel: __(
			'I need more information about WooPayments',
			'poocommerce'
		),
		anotherTimeLabel: __(
			'I’m open to installing it another time',
			'poocommerce'
		),
		somethingElseLabel: __(
			'It’s something else (Please share below)',
			'poocommerce'
		),
		commentsLabel: __( 'Comments (Optional)', 'poocommerce' ),
		cancelButton: __( 'Just dismiss WooPayments', 'poocommerce' ),
		submitButton: __( 'Dismiss and send feedback', 'poocommerce' ),
	},
	faq: {
		haveQuestions: __( 'Have questions?', 'poocommerce' ),
		getInTouch: __( 'Get in touch', 'poocommerce' ),
	},
	apms: {
		addMoreWaysToPay: __(
			'Add more ways for buyers to pay',
			'poocommerce'
		),
		seeMore: __( 'See more', 'poocommerce' ),
		paypal: {
			title: __( 'PayPal Payments', 'poocommerce' ),
			description: __(
				'Enable PayPal Payments alongside WooPayments. Give your customers another way to pay safely and conveniently via PayPal, PayLater, and Venmo.',
				'poocommerce'
			),
		},
		amazonpay: {
			title: __( 'Amazon Pay', 'poocommerce' ),
			description: __(
				'Enable Amazon Pay alongside WooPayments and give buyers the ability to pay via Amazon Pay. Transactions take place via Amazon embedded widgets, so the buyer never leaves your site.',
				'poocommerce'
			),
		},
		klarna: {
			title: __( 'Klarna', 'poocommerce' ),
			description: __(
				'Enable Klarna alongside WooPayments. With Klarna Payments buyers can choose the payment installment option they want, Pay Now, Pay Later, or Slice It. No credit card numbers, no passwords, no worries.',
				'poocommerce'
			),
		},
		affirm: {
			title: __( 'Affirm', 'poocommerce' ),
			description: __(
				'Enable Affirm alongside WooPayments and give buyers the ability to pick the payment option that works for them and their budget — from 4 interest-free payments every 2 weeks to monthly installments.',
				'poocommerce'
			),
		},
		installText: ( extensionsString: string ) => {
			const extensionsNumber = extensionsString.split( ', ' ).length;
			return createInterpolateElement(
				sprintf(
					/* translators: %s = names of the installed extensions */
					_n(
						'Installing <strong>WooPayments</strong> will automatically activate <strong>%s</strong> extension in your store.',
						'Installing <strong>WooPayments</strong> will automatically activate <strong>%s</strong> extensions in your store.',
						extensionsNumber,
						'poocommerce'
					),
					extensionsString
				),
				{
					strong: <strong />,
				}
			);
		},
		installTextPost: __( 'extension in your store.', 'poocommerce' ),
	},
};
