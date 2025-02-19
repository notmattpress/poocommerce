/**
 * External dependencies
 */
import { createElement, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DataForm } from '@wordpress/dataviews';
import { getNewPath } from '@poocommerce/navigation';

/**
 * Internal dependencies
 */
import { useSettingsForm } from '../hooks/use-settings-form';
import { CustomView } from '../components/custom-view';

export const Form = ( {
	settings,
	settingsData,
	settingsPage,
	activeSection,
}: {
	settings: SettingsField[];
	settingsData: SettingsData;
	settingsPage: SettingsPage;
	activeSection: string;
} ) => {
	const { data, fields, form, updateField } = useSettingsForm( settings );
	const formRef = useRef< HTMLFormElement >( null );

	const getFormData = () => {
		if ( ! formRef.current ) {
			return {};
		}
		const formElements = formRef.current.querySelectorAll<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>( 'input, select, textarea' );

		const formData: Record< string, string > = {};

		formElements.forEach( ( input ) => {
			const key = input.name || input.id;
			// Avoid generic Gutenberg input ids. This will require upstream fixes.
			if ( ! key || input.id?.startsWith( 'inspector-' ) ) {
				return;
			}

			formData[ key ] = input.value;
		} );

		return formData;
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const query: Record< string, string > = {
			page: 'wc-settings',
			tab: settingsPage.slug,
		};
		if ( activeSection !== 'default' ) {
			query.section = activeSection;
		}

		const formData = getFormData();
		formData.save = 'Save changes';
		formData._wpnonce = settingsData._wpnonce;
		formData._w_http_referer = '/wp-admin/' + getNewPath( query );

		// eslint-disable-next-line no-console
		console.log(
			'tab: ',
			settingsPage.slug,
			'section: ',
			activeSection,
			formData
		);
	};

	return (
		<form ref={ formRef } id="mainform" onSubmit={ handleSubmit }>
			{ settingsData.start && (
				<CustomView html={ settingsData.start.content } />
			) }
			{ settingsPage.start && (
				<CustomView html={ settingsPage.start.content } />
			) }
			<div className="poocommerce-settings-content">
				<DataForm
					fields={ fields }
					form={ form }
					data={ data }
					onChange={ updateField }
				/>
			</div>
			<div className="poocommerce-settings-content-footer">
				<Button variant="primary" type="submit">
					{ __( 'Save', 'poocommerce' ) }
				</Button>
			</div>
			{ settingsPage.end && (
				<CustomView html={ settingsPage.end.content } />
			) }
		</form>
	);
};
