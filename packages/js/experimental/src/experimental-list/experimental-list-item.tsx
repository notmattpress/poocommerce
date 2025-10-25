/**
 * External dependencies
 */
import { CSSTransition } from 'react-transition-group';
import { createElement } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import clsx from 'clsx';

function handleKeyDown(
	event: React.KeyboardEvent< HTMLElement >,
	onClick?:
		| React.MouseEventHandler< HTMLElement >
		| React.KeyboardEventHandler< HTMLElement >
) {
	if ( typeof onClick === 'function' && event.keyCode === ENTER ) {
		( onClick as React.KeyboardEventHandler< HTMLElement > )( event );
	}
}

type CSSTransitionProps = {
	in: boolean;
	exit: boolean;
	enter: boolean;
	onExited: () => void;
};

type ListItemProps = {
	// control whether to display padding on list item or not.
	disableGutters?: boolean;
	animation?: ListAnimation;
	className?: string;
} & Partial< CSSTransitionProps > &
	React.AllHTMLAttributes< HTMLElement >;

export type ListAnimation = 'slide-right' | 'none' | 'custom';

export const ExperimentalListItem = ( {
	children,
	disableGutters = false,
	animation = 'none',
	className = '',

	// extract out the props that must be passed down from TransitionGroup
	exit,

	enter,
	onExited,

	// in is a TS reserved keyword so can't be a variable name
	in: transitionIn,

	...otherProps
}: ListItemProps ): JSX.Element => {
	// for styling purposes only
	const hasAction = !! otherProps?.onClick;

	const roleProps = hasAction
		? {
				role: 'button',
				onKeyDown: ( e: React.KeyboardEvent< HTMLElement > ) =>
					handleKeyDown( e, otherProps.onClick ),
				tabIndex: 0,
		  }
		: {};

	const tagClasses = clsx( {
		'has-action': hasAction,
		'has-gutters': ! disableGutters,
		// since there is only one valid animation right now, any other value disables them.
		'transitions-disabled': animation !== 'slide-right',
	} );

	return (
		<CSSTransition
			timeout={ 500 }
			classNames={ className || 'poocommerce-list__item' }
			in={ transitionIn }
			exit={ exit }
			enter={ enter }
			onExited={ onExited }
		>
			<li
				// spread role props first, in case it is desired to override them
				{ ...roleProps }
				{ ...otherProps }
				className={ `poocommerce-experimental-list__item ${ tagClasses } ${ className }` }
			>
				{ children }
			</li>
		</CSSTransition>
	);
};
