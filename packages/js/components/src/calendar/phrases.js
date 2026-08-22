/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

export default {
	calendarLabel: __( 'Calendar', 'poocommerce' ),
	closeDatePicker: __( 'Close', 'poocommerce' ),
	focusStartDate: __(
		'Interact with the calendar and select start and end dates.',
		'poocommerce'
	),
	clearDate: __( 'Clear Date', 'poocommerce' ),
	clearDates: __( 'Clear Dates', 'poocommerce' ),
	jumpToPrevMonth: __(
		'Move backward to switch to the previous month.',
		'poocommerce'
	),
	jumpToNextMonth: __(
		'Move forward to switch to the next month.',
		'poocommerce'
	),
	enterKey: __( 'Enter key', 'poocommerce' ),
	leftArrowRightArrow: __( 'Right and left arrow keys', 'poocommerce' ),
	upArrowDownArrow: __( 'up and down arrow keys', 'poocommerce' ),
	pageUpPageDown: __( 'page up and page down keys', 'poocommerce' ),
	homeEnd: __( 'Home and end keys', 'poocommerce' ),
	escape: __( 'Escape key', 'poocommerce' ),
	questionMark: __( 'Question mark', 'poocommerce' ),
	selectFocusedDate: __( 'Select the date in focus.', 'poocommerce' ),
	moveFocusByOneDay: __(
		'Move backward (left) and forward (right) by one day.',
		'poocommerce'
	),
	moveFocusByOneWeek: __(
		'Move backward (up) and forward (down) by one week.',
		'poocommerce'
	),
	moveFocusByOneMonth: __( 'Switch months.', 'poocommerce' ),
	moveFocustoStartAndEndOfWeek: __(
		'Go to the first or last day of a week.',
		'poocommerce'
	),
	returnFocusToInput: __( 'Return to the date input field.', 'poocommerce' ),
	keyboardNavigationInstructions: __(
		'Press the down arrow key to interact with the calendar and select a date.',
		'poocommerce'
	),
	chooseAvailableStartDate: ( { date } ) =>
		/* translators: %s: start date */
		sprintf( __( 'Select %s as a start date.', 'poocommerce' ), date ),
	chooseAvailableEndDate: ( { date } ) =>
		/* translators: %s: end date */
		sprintf( __( 'Select %s as an end date.', 'poocommerce' ), date ),
	chooseAvailableDate: ( { date } ) => date,
	dateIsUnavailable: ( { date } ) =>
		/* translators: %s: unavailable date which was selected */
		sprintf( __( '%s is not selectable.', 'poocommerce' ), date ),
	dateIsSelected: ( { date } ) =>
		/* translators: %s: selected date successfully */
		sprintf( __( 'Selected. %s', 'poocommerce' ), date ),
};
