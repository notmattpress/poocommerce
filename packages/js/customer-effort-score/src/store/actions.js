/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TYPES from './action-types';

/**
 * Initialize the state
 *
 * @param {Object} queue initial queue
 */
export function setCesSurveyQueue( queue ) {
	return {
		type: TYPES.SET_CES_SURVEY_QUEUE,
		queue,
	};
}

/**
 * Add a new CES track to the state.
 *
 * @param {Object} args                 All arguments.
 * @param {string} args.action          action name for the survey
 * @param {string} args.title           title for the snackback
 * @param {string} args.description     description for feedback modal.
 * @param {string} args.noticeLabel     noticeLabel for notice.
 * @param {string} args.firstQuestion   first question for modal survey
 * @param {string} args.secondQuestion  second question for modal survey
 * @param {string} [args.icon]          optional icon for notice.
 * @param {string} [args.pageNow]       optional value of window.pagenow, default to window.pagenow
 * @param {string} [args.adminPage]     optional value of window.adminpage, default to window.adminpage
 * @param {string} [args.onsubmitLabel] optional label for the snackback onsubmit, default to undefined
 * @param {Object} args.props           object for optional props
 */
export function addCesSurvey( {
	action,
	title,
	description,
	noticeLabel,
	firstQuestion,
	secondQuestion,
	icon,
	pageNow = window.pagenow,
	adminPage = window.adminpage,
	onsubmitLabel = undefined,
	props = {},
} ) {
	return {
		type: TYPES.ADD_CES_SURVEY,
		action,
		title,
		description,
		noticeLabel,
		firstQuestion,
		secondQuestion,
		icon,
		pageNow,
		adminPage,
		onsubmit_label: onsubmitLabel,
		props,
	};
}

/**
 * Add show CES modal.
 *
 * @param {Object} surveyProps         props for CES survey, similar to addCesSurvey.
 * @param {Object} props               object for optional props
 * @param {Object} onSubmitNoticeProps object for on submit notice props.
 */
export function showCesModal(
	surveyProps = {},
	props = {},
	onSubmitNoticeProps = {},
	tracksProps = {}
) {
	return {
		type: TYPES.SHOW_CES_MODAL,
		surveyProps,
		onsubmit_label: surveyProps.onsubmitLabel || '',
		props,
		onSubmitNoticeProps,
		tracksProps,
	};
}

/**
 * Hide CES Modal.
 */
export function hideCesModal() {
	return {
		type: TYPES.HIDE_CES_MODAL,
	};
}

/**
 * Add a new CES survey track for the pages in Analytics menu
 */
export function addCesSurveyForAnalytics() {
	return addCesSurvey( {
		action: 'analytics_filtered',
		title: __(
			'How easy was it to filter your store analytics?',
			'poocommerce'
		),
		firstQuestion: __(
			'The filters in the analytics screen are easy to use.',
			'poocommerce'
		),
		secondQuestion: __(
			`The filters' functionality meets my needs.`,
			'poocommerce'
		),
		pageNow: 'poocommerce_page_wc-admin',
		adminPage: 'poocommerce_page_wc-admin',
	} );
}

/**
 * Add a new CES survey track on searching customers.
 */
export function addCesSurveyForCustomerSearch() {
	return addCesSurvey( {
		action: 'ces_search',
		title: __( 'How easy was it to use search?', 'poocommerce' ),
		firstQuestion: __(
			'The search feature in PooCommerce is easy to use.',
			'poocommerce'
		),
		secondQuestion: __(
			`The search's functionality meets my needs.`,
			'poocommerce'
		),
		pageNow: 'poocommerce_page_wc-admin',
		adminPage: 'poocommerce_page_wc-admin',
		onsubmit_label: undefined,
		props: {
			search_area: 'customer',
		},
	} );
}

/**
 * Add show product MVP Feedback modal.
 */
export function showProductMVPFeedbackModal() {
	return {
		type: TYPES.SHOW_PRODUCT_MVP_FEEDBACK_MODAL,
	};
}

/**
 * Hide product MVP Feedback modal.
 */
export function hideProductMVPFeedbackModal() {
	return {
		type: TYPES.HIDE_PRODUCT_MVP_FEEDBACK_MODAL,
	};
}
