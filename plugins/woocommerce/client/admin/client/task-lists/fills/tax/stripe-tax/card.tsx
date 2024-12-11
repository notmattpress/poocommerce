/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';
import { Plugins } from '@poocommerce/components';
import { dispatch, useDispatch } from '@wordpress/data';
import { SETTINGS_STORE_NAME } from '@poocommerce/data';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { PartnerCard } from '../components/partner-card';
import { TaxChildProps } from '../utils';
import StripeTaxLogo from './stripe-tax-logo.svg';
import { createNoticesFromResponse } from '~/lib/notices';

const STRIPE_TAX_PLUGIN_SLUG = 'stripe-tax-for-poocommerce';

const redirectToStripeTaxSettings = () => {
	window.location.href = getAdminLink(
		'/admin.php?page=wc-settings&tab=stripe_tax_for_poocommerce'
	);
};

export const Card: React.FC< TaxChildProps > = ( {
	task: {
		additionalData: { stripeTaxActivated } = {
			stripeTaxActivated: false,
		},
	},
} ) => {
	const { createSuccessNotice } = useDispatch( 'core/notices' );

	return (
		<PartnerCard
			name={ __( 'Stripe Tax', 'poocommerce' ) }
			logo={ StripeTaxLogo }
			description={ __( 'Powerful global tax tool', 'poocommerce' ) }
			benefits={ [
				__( 'Real-time sales tax calculation', 'poocommerce' ),
				__( 'Multi-economic nexus compliance', 'poocommerce' ),
				__( 'Detailed tax transaction reports', 'poocommerce' ),
				__( 'Coverage in over 55 countries', 'poocommerce' ),
			] }
			terms={ __(
				'Free to install, then pay as you go.',
				'poocommerce'
			) }
			onClick={ () => {} }
		>
			{ stripeTaxActivated ? (
				<Button
					variant="secondary"
					onClick={ () => {
						recordEvent(
							'tasklist_tax_setup_stripe_tax_to_settings'
						);
						redirectToStripeTaxSettings();
					} }
				>
					{ __( 'Continue to setttings', 'poocommerce' ) }
				</Button>
			) : (
				<Plugins
					installText={ __( 'Install for free', 'poocommerce' ) }
					onClick={ () => {
						recordEvent( 'tasklist_tax_select_option', {
							selected_option: STRIPE_TAX_PLUGIN_SLUG,
						} );
					} }
					onComplete={ () => {
						recordEvent( 'tasklist_tax_install_plugin_success', {
							selected_option: STRIPE_TAX_PLUGIN_SLUG,
						} );
						const { updateAndPersistSettingsForGroup } =
							dispatch( SETTINGS_STORE_NAME );
						updateAndPersistSettingsForGroup( 'general', {
							general: {
								poocommerce_calc_taxes: 'yes', // Stripe tax requires tax calculation to be enabled so let's do it here to save the user from doing it manually
							},
						} ).then( () => {
							createSuccessNotice(
								__(
									"Stripe Tax for Woocommerce has been successfully installed. Let's configure it now.",
									'poocommerce'
								)
							);
							redirectToStripeTaxSettings();
						} );
					} }
					onError={ ( errors, response ) => {
						recordEvent( 'tasklist_tax_install_plugin_error', {
							selected_option: STRIPE_TAX_PLUGIN_SLUG,
							errors,
						} );
						createNoticesFromResponse( response );
					} }
					installButtonVariant="secondary"
					pluginSlugs={ [ STRIPE_TAX_PLUGIN_SLUG ] }
				/>
			) }
		</PartnerCard>
	);
};
