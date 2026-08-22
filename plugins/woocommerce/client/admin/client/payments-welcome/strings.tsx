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
		sprintf(
			/* translators: 1: Payment provider name (e.g., WooPayments) */
			__(
				'By using %1$s you agree to our <a1>Terms of Service</a1> and acknowledge that you have read our <a2>Privacy Policy</a2>. Discount will be applied to payments processed via %1$s upon completion of installation, setup, and connection. ',
				'poocommerce'
			),
			'WooPayments'
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
		sprintf(
			/* translators: 1: Payment provider name (e.g., WooPayments) */
			__(
				'By using %1$s you agree to our <a1>Terms of Service</a1> (including WooPay <a3>merchant terms</a3>) and acknowledge that you have read our <a2>Privacy Policy</a2>. Discount will be applied to payments processed via %1$s upon completion of installation, setup, and connection. ',
				'poocommerce'
			),
			'WooPayments'
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
	paymentOptions: sprintf(
		/* translators: %s: Payment provider name (e.g., WooPayments) */
		__(
			'%s is pre-integrated with all popular payment options',
			'poocommerce'
		),
		'WooPayments'
	),
	andMore: __( '& more', 'poocommerce' ),
	learnMore: __( 'Learn more', 'poocommerce' ),
	survey: {
		title: sprintf(
			/* translators: %s: Payment provider name (e.g., WooPayments) */
			__( 'No thanks, I don’t want %s', 'poocommerce' ),
			'WooPayments'
		),
		intro: sprintf(
			/* translators: %s: Payment provider name (e.g., WooPayments) */
			__(
				'Note that the extension hasn’t been installed. This will simply dismiss our limited time offer. Please take a moment to tell us why you’d like to dismiss the %s offer.',
				'poocommerce'
			),
			'WooPayments'
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
		moreInfoLabel: sprintf(
			/* translators: %s: Payment provider name (e.g., WooPayments) */
			__( 'I need more information about %s', 'poocommerce' ),
			'WooPayments'
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
		cancelButton: sprintf(
			/* translators: %s: Payment provider name (e.g., WooPayments) */
			__( 'Just dismiss %s', 'poocommerce' ),
			'WooPayments'
		),
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
			description: sprintf(
				/* translators: %s: Payment provider name (e.g., WooPayments) */
				__(
					'Enable PayPal Payments alongside %s. Give your customers another way to pay safely and conveniently via PayPal, PayLater, and Venmo.',
					'poocommerce'
				),
				'WooPayments'
			),
		},
		amazonpay: {
			title: __( 'Amazon Pay', 'poocommerce' ),
			description: sprintf(
				/* translators: %s: Payment provider name (e.g., WooPayments) */
				__(
					'Enable Amazon Pay alongside %s and give buyers the ability to pay via Amazon Pay. Transactions take place via Amazon embedded widgets, so the buyer never leaves your site.',
					'poocommerce'
				),
				'WooPayments'
			),
		},
		klarna: {
			title: __( 'Klarna', 'poocommerce' ),
			description: sprintf(
				/* translators: %s: Payment provider name (e.g., WooPayments) */
				__(
					'Enable Klarna alongside %s. With Klarna Payments buyers can choose the payment installment option they want, Pay Now, Pay Later, or Slice It. No credit card numbers, no passwords, no worries.',
					'poocommerce'
				),
				'WooPayments'
			),
		},
		affirm: {
			title: __( 'Affirm', 'poocommerce' ),
			description: sprintf(
				/* translators: %s: Payment provider name (e.g., WooPayments) */
				__(
					'Enable Affirm alongside %s and give buyers the ability to pick the payment option that works for them and their budget — from 4 interest-free payments every 2 weeks to monthly installments.',
					'poocommerce'
				),
				'WooPayments'
			),
		},
		installText: ( extensionsString: string ) => {
			const extensionsNumber = extensionsString.split( ', ' ).length;
			return createInterpolateElement(
				sprintf(
					/* translators: 1: Payment provider name (e.g., WooPayments), 2: names of the installed extensions */
					_n(
						'Installing <strong>%1$s</strong> will automatically activate <strong>%2$s</strong> extension in your store.',
						'Installing <strong>%1$s</strong> will automatically activate <strong>%2$s</strong> extensions in your store.',
						extensionsNumber,
						'poocommerce'
					),
					'WooPayments',
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
