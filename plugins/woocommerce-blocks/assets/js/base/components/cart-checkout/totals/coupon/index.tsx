/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useRef } from '@wordpress/element';
import Button from '@poocommerce/base-components/button';
import LoadingMask from '@poocommerce/base-components/loading-mask';
import {
	ValidatedTextInput,
	ValidationInputError,
	ValidatedTextInputHandle,
	Panel,
} from '@poocommerce/blocks-components';
import { useSelect } from '@wordpress/data';
import { VALIDATION_STORE_KEY } from '@poocommerce/block-data';
import type { MouseEvent, MouseEventHandler } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

export interface TotalsCouponProps {
	/**
	 * Instance id of the input
	 */
	instanceId: string;
	/**
	 * Whether the component is in a loading state
	 */
	isLoading?: boolean;
	/**
	 * Whether the coupon form is hidden
	 */
	displayCouponForm?: boolean;
	/**
	 * Submit handler
	 */
	onSubmit?: ( couponValue: string ) => Promise< boolean > | undefined;
}

export const TotalsCoupon = ( {
	instanceId,
	isLoading = false,
	onSubmit,
	displayCouponForm = false,
}: TotalsCouponProps ): JSX.Element => {
	const [ couponValue, setCouponValue ] = useState( '' );
	const [ isCouponFormVisible, setIsCouponFormVisible ] =
		useState( displayCouponForm );
	const textInputId = `wc-block-components-totals-coupon__input-${ instanceId }`;
	const { validationErrorId } = useSelect( ( select ) => {
		const store = select( VALIDATION_STORE_KEY );
		return {
			validationErrorId: store.getValidationErrorId( instanceId ),
		};
	} );
	const inputRef = useRef< ValidatedTextInputHandle >( null );

	const handleCouponSubmit: MouseEventHandler< HTMLButtonElement > = (
		e: MouseEvent< HTMLButtonElement >
	) => {
		e.preventDefault();
		if ( typeof onSubmit !== 'undefined' ) {
			onSubmit( couponValue )?.then( ( result ) => {
				if ( result ) {
					setCouponValue( '' );
					setIsCouponFormVisible( false );
				} else if ( inputRef.current?.focus ) {
					inputRef.current.focus();
				}
			} );
		} else {
			setCouponValue( '' );
			setIsCouponFormVisible( true );
		}
	};

	return (
		<Panel
			className="wc-block-components-totals-coupon"
			initialOpen={ isCouponFormVisible }
			hasBorder={ false }
			headingLevel={ 2 }
			title={ __( 'Add a coupon', 'poocommerce' ) }
			state={ [ isCouponFormVisible, setIsCouponFormVisible ] }
		>
			<LoadingMask
				screenReaderLabel={ __( 'Applying coupon…', 'poocommerce' ) }
				isLoading={ isLoading }
				showSpinner={ false }
			>
				<div className="wc-block-components-totals-coupon__content">
					<form
						className="wc-block-components-totals-coupon__form"
						id="wc-block-components-totals-coupon__form"
					>
						<ValidatedTextInput
							id={ textInputId }
							errorId="coupon"
							className="wc-block-components-totals-coupon__input"
							label={ __( 'Enter code', 'poocommerce' ) }
							value={ couponValue }
							ariaDescribedBy={ validationErrorId }
							onChange={ ( newCouponValue ) => {
								setCouponValue( newCouponValue );
							} }
							focusOnMount={ true }
							validateOnMount={ false }
							showError={ false }
							ref={ inputRef }
						/>
						<Button
							className="wc-block-components-totals-coupon__button"
							disabled={ isLoading || ! couponValue }
							showSpinner={ isLoading }
							onClick={ handleCouponSubmit }
							type="submit"
						>
							{ __( 'Apply', 'poocommerce' ) }
						</Button>
					</form>
					<ValidationInputError
						propertyName="coupon"
						elementId={ instanceId }
					/>
				</div>
			</LoadingMask>
		</Panel>
	);
};

export default TotalsCoupon;
