/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

addFilter(
	'poocommerce_admin_analytics_settings',
	'poocommerce-blocks/exclude-draft-status-from-analytics',
	( settings ) => {
		const removeCheckoutDraft = ( optionsGroup ) => {
			if ( optionsGroup.key === 'customStatuses' ) {
				return {
					...optionsGroup,
					options: optionsGroup.options.filter(
						( option ) => option.value !== 'checkout-draft'
					),
				};
			}
			return optionsGroup;
		};

		const actionableStatusesOptions =
			settings.poocommerce_actionable_order_statuses.options.map(
				removeCheckoutDraft
			);
		const excludedStatusesOptions =
			settings.poocommerce_excluded_report_order_statuses.options.map(
				removeCheckoutDraft
			);

		return {
			...settings,
			poocommerce_actionable_order_statuses: {
				...settings.poocommerce_actionable_order_statuses,
				options: actionableStatusesOptions,
			},
			poocommerce_excluded_report_order_statuses: {
				...settings.poocommerce_excluded_report_order_statuses,
				options: excludedStatusesOptions,
			},
		};
	}
);
