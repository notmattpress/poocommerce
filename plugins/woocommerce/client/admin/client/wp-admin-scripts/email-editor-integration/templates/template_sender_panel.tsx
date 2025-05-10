/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Panel, PanelBody, PanelRow, TextControl } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useCallback, useRef } from '@wordpress/element';

function TemplateSenderPanel() {
	const [ poocommerce_template_data, setWoocommerceTemplateData ] =
		useEntityProp( 'postType', 'wp_template', 'poocommerce_data' );
	const emailInputRef = useRef< HTMLInputElement >( null );

	const handleFromNameChange = useCallback(
		( value: string ) => {
			setWoocommerceTemplateData( {
				...poocommerce_template_data,
				sender_settings: {
					...poocommerce_template_data?.sender_settings,
					from_name: value,
				},
			} );
		},
		[ poocommerce_template_data, setWoocommerceTemplateData ]
	);
	const handleFromAddressChange = useCallback(
		( value: string ) => {
			setWoocommerceTemplateData( {
				...poocommerce_template_data,
				sender_settings: {
					...poocommerce_template_data?.sender_settings,
					from_address: value,
				},
			} );

			// Use HTML5 validation
			if ( emailInputRef.current ) {
				emailInputRef.current.checkValidity();
				emailInputRef.current.reportValidity();
			}
		},
		[ poocommerce_template_data, setWoocommerceTemplateData ]
	);

	return (
		<Panel className="poocommerce-email-sidebar-template-settings-sender-options">
			<PanelBody>
				<PanelRow>
					<div>
						<h2>{ __( 'Sender Options', 'poocommerce' ) }</h2>
						<p>
							{ __(
								'This is how your sender name and email address would appear in outgoing PooCommerce emails.',
								'poocommerce'
							) }
						</p>
					</div>
				</PanelRow>
				<PanelRow>
					<TextControl
						className="poocommerce-email-sidebar-template-settings-sender-options-input"
						/* translators: Label for the sender's `“from” name` in email settings. */
						label={ __( '“from” name', 'poocommerce' ) }
						name="from_name"
						type="text"
						value={
							poocommerce_template_data?.sender_settings
								?.from_name || ''
						}
						onChange={ handleFromNameChange }
					/>
				</PanelRow>
				<PanelRow>
					<TextControl
						ref={ emailInputRef }
						className="poocommerce-email-sidebar-template-settings-sender-options-input"
						/* translators: Label for the sender's `“from” email` in email settings. */
						label={ __( '“from” email', 'poocommerce' ) }
						name="from_email"
						type="email"
						value={
							poocommerce_template_data?.sender_settings
								?.from_address || ''
						}
						onChange={ handleFromAddressChange }
						required
					/>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
}

export { TemplateSenderPanel };
