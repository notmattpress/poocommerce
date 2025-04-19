/**
 * External dependencies
 */
import { optionsStore } from '@poocommerce/data';
import { resolveSelect } from '@wordpress/data';

export const fetchSurveyCompletedOption = async () =>
	resolveSelect( optionsStore ).getOption(
		'poocommerce_admin_customize_store_survey_completed'
	);
