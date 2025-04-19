/**
 * External dependencies
 */
import { createElement, Component } from '@wordpress/element';
import classnames from 'classnames';
import { range } from 'lodash';
import PropTypes from 'prop-types';
import { withViewportMatch } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import { getHasItemsClass } from './utils';

export const SummaryNumberPlaceholder = ( { className } ) => (
	<li
		data-testid="summary-placeholder"
		className={ classnames(
			'poocommerce-summary__item-container is-placeholder',
			className
		) }
	>
		<div className="poocommerce-summary__item">
			<div className="poocommerce-summary__item-label" />
			<div className="poocommerce-summary__item-data">
				<div className="poocommerce-summary__item-value" />
				<div className="poocommerce-summary__item-delta" />
			</div>
		</div>
	</li>
);

/**
 * `SummaryListPlaceholder` behaves like `SummaryList` but displays placeholder summary items instead of data.
 * This can be used while loading data.
 */
class SummaryListPlaceholder extends Component {
	render() {
		const { isDropdownBreakpoint } = this.props;
		const numberOfItems = isDropdownBreakpoint
			? 1
			: this.props.numberOfItems;

		const hasItemsClass = getHasItemsClass( numberOfItems );
		const classes = classnames( 'poocommerce-summary', {
			[ hasItemsClass ]: ! isDropdownBreakpoint,
			'is-placeholder': true,
		} );

		return (
			<ul className={ classes } aria-hidden="true">
				{ range( numberOfItems ).map( ( i ) => {
					return <SummaryNumberPlaceholder key={ i } />;
				} ) }
			</ul>
		);
	}
}

SummaryListPlaceholder.propTypes = {
	/**
	 * An integer with the number of summary items to display.
	 */
	numberOfItems: PropTypes.number.isRequired,
};

SummaryListPlaceholder.defaultProps = {
	numberOfRows: 5,
};

export default withViewportMatch( {
	isDropdownBreakpoint: '< large',
} )( SummaryListPlaceholder );
