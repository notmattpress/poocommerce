/**
 * External dependencies
 */
import { createRoot } from '@wordpress/element';
import { createSlotFill, SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';

export const SETTINGS_SLOT_FILL_CONSTANT =
	'__EXPERIMENTAL__WcAdminSettingsSlots';

const { Slot } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );

export const possiblyRenderSettingsSlots = () => {
	const slots = [
		{
			id: 'wc_payments_settings_slotfill',
			scope: 'poocommerce-payments-settings',
		},
		{ id: 'wc_tax_settings_slotfill', scope: 'poocommerce-tax-settings' },
		{ id: 'wc_settings_slotfill', scope: 'poocommerce-settings' },
		{
			id: 'wc_settings_site_visibility_slotfill',
			scope: 'poocommerce-site-visibility-settings',
		},
		{
			id: 'wc_settings_blueprint_slotfill',
			scope: 'poocommerce-blueprint-settings',
		},
		{
			id: 'wc_settings_email_preview_slotfill',
			scope: 'poocommerce-email-preview-settings',
		},
		{
			id: 'wc_settings_email_listing_slotfill',
			scope: 'poocommerce-email-listing',
		},
		{
			id: 'wc_settings_features_email_feedback_slotfill',
			scope: 'poocommerce-email-feedback-settings',
		},
		{
			id: 'wc_settings_email_image_url_slotfill',
			scope: 'poocommerce-email-image-url-settings',
		},
		{
			id: 'wc_settings_email_color_palette_slotfill',
			scope: 'poocommerce-email-color-palette-settings',
		},
	];

	slots.forEach( ( slot ) => {
		const slotDomElement = document.getElementById( slot.id );

		if ( slotDomElement ) {
			createRoot( slotDomElement ).render(
				<>
					<SlotFillProvider>
						<Slot />
						<PluginArea scope={ slot.scope } />
					</SlotFillProvider>
				</>
			);
		}
	} );
};
