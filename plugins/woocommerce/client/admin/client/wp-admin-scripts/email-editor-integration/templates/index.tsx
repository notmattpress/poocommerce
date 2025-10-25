/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { TemplateSenderPanel } from './template_sender_panel';
import './style.scss';

function modifyTemplateSidebar() {
	addFilter(
		'poocommerce_email_editor_template_sections',
		'my-plugin/template-settings',
		( sections, tracking ) => [
			...sections,
			{
				id: 'my-custom-section',
				render: () => {
					return (
						<TemplateSenderPanel
							debouncedRecordEvent={
								tracking.debouncedRecordEvent
							}
						/>
					);
				},
			},
		]
	);
}

export { modifyTemplateSidebar };
