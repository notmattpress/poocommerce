/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { createElement, Component, createRef } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getFormatter } from './utils/index';
import { getColor } from './utils/color';
import { selectionLimit } from '../constants';

/**
 * A legend specifically designed for the PooCommerce admin charts.
 */
class D3Legend extends Component {
	constructor() {
		super();

		this.listRef = createRef();

		this.state = {
			isScrollable: false,
		};
	}

	componentDidMount() {
		this.updateListScroll();
		window.addEventListener( 'resize', this.updateListScroll );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.updateListScroll );
	}

	updateListScroll() {
		if ( ! this || ! this.listRef ) {
			return;
		}
		const list = this.listRef.current;
		const scrolledToEnd =
			list.scrollHeight - list.scrollTop <= list.offsetHeight;
		this.setState( {
			isScrollable: ! scrolledToEnd,
		} );
	}

	render() {
		const {
			colorScheme,
			data,
			handleLegendHover,
			handleLegendToggle,
			interactive,
			legendDirection,
			legendValueFormat,
			instanceId,
			totalLabel,
		} = this.props;
		const { isScrollable } = this.state;
		const visibleData = data.filter( ( key ) => key.visible );
		const numberOfRowsVisible = visibleData.length;
		const showTotalLabel =
			legendDirection === 'column' &&
			data.length > selectionLimit &&
			totalLabel;

		const keys = data.length > selectionLimit ? visibleData : data;

		return (
			<div
				className={ classNames(
					'poocommerce-legend',
					`poocommerce-legend__direction-${ legendDirection }`,
					{
						'has-total': showTotalLabel,
						'is-scrollable': isScrollable,
					},
					this.props.className
				) }
			>
				<ul
					className="poocommerce-legend__list"
					ref={ this.listRef }
					onScroll={ showTotalLabel ? this.updateListScroll : null }
				>
					{ data.map( ( row ) => (
						<li
							className={ classNames(
								'poocommerce-legend__item',
								{
									'poocommerce-legend__item-checked':
										row.visible,
								}
							) }
							key={ row.key }
							id={ `poocommerce-legend-${ instanceId }__item__${ row.key }` }
							onMouseEnter={ handleLegendHover }
							onMouseLeave={ handleLegendHover }
							onBlur={ handleLegendHover }
							onFocus={ handleLegendHover }
						>
							<button
								role="checkbox"
								aria-checked={ row.visible ? 'true' : 'false' }
								onClick={ handleLegendToggle }
								id={ `poocommerce-legend-${ instanceId }__item-button__${ row.key }` }
								disabled={
									( row.visible &&
										numberOfRowsVisible <= 1 ) ||
									( ! row.visible &&
										numberOfRowsVisible >=
											selectionLimit ) ||
									! interactive
								}
								title={
									numberOfRowsVisible >= selectionLimit
										? sprintf(
												/* translators: %d: number of items selected */
												__(
													'You may select up to %d items.',
													'poocommerce'
												),
												selectionLimit
										  )
										: ''
								}
							>
								<div className="poocommerce-legend__item-container">
									<span
										className={ classNames(
											'poocommerce-legend__item-checkmark',
											{
												'poocommerce-legend__item-checkmark-checked':
													row.visible,
											}
										) }
										style={
											row.visible
												? {
														color: getColor(
															keys,
															colorScheme
														)( row.key ),
												  }
												: null
										}
									/>
									<span className="poocommerce-legend__item-title">
										{ row.label }
									</span>
									<span className="poocommerce-legend__item-total">
										{ getFormatter( legendValueFormat )(
											row.total
										) }
									</span>
								</div>
							</button>
						</li>
					) ) }
				</ul>
				{ showTotalLabel && (
					<div className="poocommerce-legend__total">
						{ totalLabel }
					</div>
				) }
			</div>
		);
	}
}

D3Legend.propTypes = {
	/**
	 * Additional CSS classes.
	 */
	className: PropTypes.string,
	/**
	 * A chromatic color function to be passed down to d3.
	 */
	colorScheme: PropTypes.func,
	/**
	 * An array of `orderedKeys`.
	 */
	data: PropTypes.array.isRequired,
	/**
	 * Handles `onClick` event.
	 */
	handleLegendToggle: PropTypes.func,
	/**
	 * Handles `onMouseEnter`/`onMouseLeave` events.
	 */
	handleLegendHover: PropTypes.func,
	/**
	 * Determines whether or not you can click on the legend
	 */
	interactive: PropTypes.bool,
	/**
	 * Display legend items as a `row` or `column` inside a flex-box.
	 */
	legendDirection: PropTypes.oneOf( [ 'row', 'column' ] ),
	/**
	 * A number formatting string or function to format the value displayed in the legend.
	 */
	legendValueFormat: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.func,
	] ),
	/**
	 * Label to describe the legend items. It will be displayed in the legend of
	 * comparison charts when there are many.
	 */
	totalLabel: PropTypes.string,
	// from withInstanceId
	instanceId: PropTypes.number,
};

D3Legend.defaultProps = {
	interactive: true,
	legendDirection: 'row',
	legendValueFormat: ',',
};

export default withInstanceId( D3Legend );
