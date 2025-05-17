/**
 * External dependencies
 */
import { select, dispatch } from '@wordpress/data';
import { store as coreDataStore, useEntityProp } from '@wordpress/core-data';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import { NAME_SPACE } from './constants';
import { EmailStatus } from './email-status';

const previewTextMaxLength = 150;
const previewTextRecommendedLength = 80;

// @ts-expect-error RichTextWithButton has default any type and is not exported yet.
const SidebarSettings = ( { RichTextWithButton } ) => {
	const [ poocommerce_email_data ] = useEntityProp(
		'postType',
		'woo_email',
		'poocommerce_data'
	);

	const updateWooMailProperty = ( name: string, value: string ) => {
		const editedPost = select( coreDataStore ).getEditedEntityRecord(
			'postType',
			'woo_email',
			window.PooCommerceEmailEditor.current_post_id
		);

		// @ts-expect-error Property 'mailpoet_data' does not exist on type 'Updatable<Attachment<any>>'.
		const poocommerce_data = editedPost?.poocommerce_data || {};
		void dispatch( coreDataStore ).editEntityRecord(
			'postType',
			'woo_email',
			window.PooCommerceEmailEditor.current_post_id,
			{
				poocommerce_data: {
					...poocommerce_data,
					[ name ]: value,
				},
			}
		);
	};

	const previewTextLength = poocommerce_email_data?.preheader?.length ?? 0;

	return (
		<>
			<br />
			{ poocommerce_email_data.email_type ===
			'customer_refunded_order' ? (
				<>
					<RichTextWithButton
						attributeName="subject_full"
						attributeValue={ poocommerce_email_data.subject_full }
						updateProperty={ updateWooMailProperty }
						label={ __( 'Full Refund Subject', 'poocommerce' ) }
						placeholder={ poocommerce_email_data.default_subject }
					/>
					<br />
					<RichTextWithButton
						attributeName="subject_partial"
						attributeValue={
							poocommerce_email_data.subject_partial
						}
						updateProperty={ updateWooMailProperty }
						label={ __( 'Partial Refund Subject', 'poocommerce' ) }
						placeholder={ poocommerce_email_data.default_subject }
					/>
				</>
			) : (
				<RichTextWithButton
					attributeName="subject"
					attributeValue={ poocommerce_email_data.subject }
					updateProperty={ updateWooMailProperty }
					label={ __( 'Subject', 'poocommerce' ) }
					placeholder={ poocommerce_email_data.default_subject }
				/>
			) }

			<br />
			<RichTextWithButton
				attributeName="preheader"
				attributeValue={ poocommerce_email_data.preheader }
				updateProperty={ updateWooMailProperty }
				label={ __( 'Preview text', 'poocommerce' ) }
				help={
					<span
						className={ clsx(
							'poocommerce-settings-panel__preview-text-length',
							{
								'poocommerce-settings-panel__preview-text-length-warning':
									previewTextLength >
									previewTextRecommendedLength,
								'poocommerce-settings-panel__preview-text-length-error':
									previewTextLength > previewTextMaxLength,
							}
						) }
					>
						{ previewTextLength }/{ previewTextMaxLength }
					</span>
				}
				placeholder={ __(
					'Shown as a preview in the inbox, next to the subject line.',
					'poocommerce'
				) }
			/>
		</>
	);
};

export function modifySidebar() {
	addFilter(
		'poocommerce_email_editor_setting_sidebar_email_status_component',
		NAME_SPACE,
		() => EmailStatus
	);
	addFilter(
		'poocommerce_email_editor_setting_sidebar_extension_component',
		NAME_SPACE,
		( RichTextWithButton ) => {
			return () => (
				<SidebarSettings RichTextWithButton={ RichTextWithButton } />
			);
		}
	);
}
