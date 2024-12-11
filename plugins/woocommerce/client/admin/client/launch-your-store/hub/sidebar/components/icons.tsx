/**
 * External dependencies
 */
import {
	percent,
	shipping,
	brush,
	tag,
	payment,
	check,
} from '@wordpress/icons';
/**
 * Internal dependencies
 */

export const taskCompleteIcon = check;

export const taskIcons: Record< string, JSX.Element > = {
	tax: percent,
	shipping,
	'customize-store': brush,
	payments: payment,
	'poocommerce-payments': payment,
	products: tag,
};
