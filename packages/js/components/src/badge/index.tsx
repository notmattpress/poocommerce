/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';

export type BadgeProps = {
	count: number;
} & React.HTMLAttributes< HTMLSpanElement >;

export const Badge = ( { count, className = '', ...props }: BadgeProps ) => {
	return (
		<span className={ `poocommerce-badge ${ className }` } { ...props }>
			{ count }
		</span>
	);
};
