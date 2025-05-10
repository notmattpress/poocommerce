/**
 * External dependencies
 */
import { Button, DateTimePicker, Modal } from '@wordpress/components';
import { createElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	getSiteDatetime,
	isSiteSettingsTime12HourFormatted,
} from '../../utils';
import { SchedulePublishModalProps } from './types';

export function SchedulePublishModal( {
	postType,
	title = __( 'Schedule product', 'poocommerce' ),
	description = __(
		'Decide when this product should become visible to customers.',
		'poocommerce'
	),
	value,
	className,
	onCancel,
	onSchedule,
	isScheduling,
	...props
}: SchedulePublishModalProps ) {
	const [ date, setDate ] = useState< string | undefined >(
		() => value ?? getSiteDatetime()
	);

	function handleDateTimePickerChange( newDate?: string | null ) {
		setDate( newDate ?? '' );
	}

	return (
		<Modal
			{ ...props }
			title={ title }
			className={ classNames(
				className,
				'poocommerce-schedule-publish-modal'
			) }
			onRequestClose={ () => onCancel?.() }
		>
			<p className="poocommerce-schedule-publish-modal__description">
				{ description }
			</p>

			<div className="poocommerce-schedule-publish-modal__content">
				<div className="poocommerce-schedule-publish-modal__button-now">
					<strong>{ __( 'Publish', 'poocommerce' ) }</strong>

					<Button
						variant="link"
						onClick={ () =>
							handleDateTimePickerChange( getSiteDatetime() )
						}
					>
						{ __( 'Now', 'poocommerce' ) }
					</Button>
				</div>

				<DateTimePicker
					currentDate={ date }
					onChange={ handleDateTimePickerChange }
					is12Hour={ isSiteSettingsTime12HourFormatted() }
				/>
			</div>

			<div className="poocommerce-schedule-publish-modal__buttons">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel', 'poocommerce' ) }
				</Button>
				<Button
					variant="primary"
					isBusy={ isScheduling }
					disabled={ isScheduling }
					onClick={ () => onSchedule?.( date ) }
				>
					{ __( 'Schedule', 'poocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
}
