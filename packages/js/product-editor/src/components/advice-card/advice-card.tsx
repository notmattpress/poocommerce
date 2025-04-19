/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { createElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useUserPreferences } from '@poocommerce/data';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { AdviceCardProps } from './types';

export function AdviceCard( {
	tip,
	isDismissible = true,
	dismissPreferenceId,
	className,
	children,
	onDismiss,
	...props
}: AdviceCardProps ) {
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { updateUserPreferences, product_advice_card_dismissed } =
		useUserPreferences();

	function handleDismissButtonClick() {
		if ( dismissPreferenceId ) {
			updateUserPreferences( {
				product_advice_card_dismissed: {
					...product_advice_card_dismissed,
					[ dismissPreferenceId ]: 'yes',
				},
			} );
		} else {
			setIsDismissed( ( current ) => ! current );
		}

		if ( onDismiss ) {
			onDismiss();
		}
	}

	// Check if the advice card has been dismissed.
	if ( isDismissible ) {
		if (
			dismissPreferenceId &&
			product_advice_card_dismissed &&
			product_advice_card_dismissed?.[ dismissPreferenceId ] === 'yes'
		) {
			return null;
		}

		if ( isDismissed ) {
			return null;
		}
	}

	return (
		<div
			role="group"
			{ ...props }
			className={ classNames( className, 'poocommerce-advice-card', {
				'is-dismissible': isDismissible,
			} ) }
		>
			{ isDismissible && (
				<div className="poocommerce-advice-card__header">
					<Button
						className="poocommerce-advice-card__dismiss-button"
						onClick={ handleDismissButtonClick }
						icon={ close }
						label={ __( 'Dismiss', 'poocommerce' ) }
						isSmall={ true }
					/>
				</div>
			) }
			<div className="poocommerce-advice-card__body">{ children }</div>
			{ tip && tip.length > 0 && (
				<div className="poocommerce-advice-card__footer">{ tip }</div>
			) }
		</div>
	);
}
