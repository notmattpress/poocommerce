/**
 * External dependencies
 */
import { Popover } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { Icon, calendar } from '@wordpress/icons';
import clsx from 'clsx';
import { uniqueId, noop } from 'lodash';
import PropTypes from 'prop-types';

const DateInput = ( {
	disabled = false,
	value,
	onChange,
	dateFormat,
	label,
	describedBy,
	error,
	onFocus = () => {},
	onBlur = () => {},
	onKeyDown = noop,
	errorPosition = 'bottom center',
} ) => {
	const classes = clsx( 'poocommerce-calendar__input', {
		'is-empty': value.length === 0,
		'is-error': error,
	} );
	const id = uniqueId( '_woo-dates-input' );
	return (
		<div className={ classes }>
			<input
				type="text"
				className="poocommerce-calendar__input-text"
				value={ value }
				onChange={ onChange }
				aria-label={ label }
				id={ id }
				aria-describedby={ `${ id }-message` }
				placeholder={ dateFormat.toLowerCase() }
				onFocus={ onFocus }
				onBlur={ onBlur }
				onKeyDown={ onKeyDown }
				disabled={ disabled }
			/>
			{ error && (
				<Popover
					className="poocommerce-calendar__input-error"
					focusOnMount={ false }
					position={ errorPosition }
				>
					{ error }
				</Popover>
			) }
			<Icon icon={ calendar } className="calendar-icon" />
			<p className="screen-reader-text" id={ `${ id }-message` }>
				{ error || describedBy }
			</p>
		</div>
	);
};

DateInput.propTypes = {
	disabled: PropTypes.bool,
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	dateFormat: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	describedBy: PropTypes.string.isRequired,
	error: PropTypes.string,
	errorPosition: PropTypes.string,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onKeyDown: PropTypes.func,
};

export default DateInput;
