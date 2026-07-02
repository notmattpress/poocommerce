/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';
import { trash, Icon } from '@wordpress/icons';
import ChevronUpIcon from 'gridicons/dist/chevron-up';
import ChevronDownIcon from 'gridicons/dist/chevron-down';
import { Component, Fragment } from '@wordpress/element';
import { MenuItem } from '@poocommerce/components';

class SectionControls extends Component {
	constructor( props ) {
		super( props );
		this.onMoveUp = this.onMoveUp.bind( this );
		this.onMoveDown = this.onMoveDown.bind( this );
	}

	onMoveUp() {
		const { onMove, onToggle } = this.props;
		onMove( -1 );
		// Close the dropdown
		onToggle();
	}

	onMoveDown() {
		const { onMove, onToggle } = this.props;
		onMove( 1 );
		// Close the dropdown
		onToggle();
	}

	render() {
		const {
			onRemove,
			isFirst,
			isLast,
			onTitleBlur,
			onTitleChange,
			titleInput,
		} = this.props;

		return (
			<Fragment>
				<div className="poocommerce-ellipsis-menu__item">
					<TextControl
						label={ __( 'Section title', 'poocommerce' ) }
						onBlur={ onTitleBlur }
						onChange={ onTitleChange }
						required
						value={ titleInput }
					/>
				</div>
				<div className="poocommerce-dashboard-section-controls">
					{ ! isFirst && (
						<MenuItem isClickable onInvoke={ this.onMoveUp }>
							<Icon
								icon={ <ChevronUpIcon /> }
								label={ __( 'Move up', 'poocommerce' ) }
								size={ 20 }
								className="icon-control"
							/>
							{ __( 'Move up', 'poocommerce' ) }
						</MenuItem>
					) }
					{ ! isLast && (
						<MenuItem isClickable onInvoke={ this.onMoveDown }>
							<Icon
								icon={ <ChevronDownIcon /> }
								size={ 20 }
								label={ __( 'Move down', 'poocommerce' ) }
								className="icon-control"
							/>
							{ __( 'Move down', 'poocommerce' ) }
						</MenuItem>
					) }
					<MenuItem isClickable onInvoke={ onRemove }>
						<Icon
							icon={ trash }
							size={ 20 }
							label={ __( 'Remove block', 'poocommerce' ) }
							className="icon-control"
						/>
						{ __( 'Remove section', 'poocommerce' ) }
					</MenuItem>
				</div>
			</Fragment>
		);
	}
}

export default SectionControls;
