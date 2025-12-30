/**
 * External dependencies
 */
import { useWooBlockProps } from '@poocommerce/block-templates';
import { DateTimePickerControl } from '@poocommerce/components';
import { Product } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { ToggleControl } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { createElement, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore We need this to get the datetime format for the DateTimePickerControl.
// eslint-disable-next-line @poocommerce/dependency-group
import { getSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import { ScheduleSalePricingBlockAttributes } from './types';
import { useProductEdits } from '../../../hooks/use-product-edits';
import { useValidation } from '../../../contexts/validation-context';
import { ProductEditorBlockEditProps } from '../../../types';

export function Edit( {
	attributes,
	clientId,
	context,
}: ProductEditorBlockEditProps< ScheduleSalePricingBlockAttributes > ) {
	const blockProps = useWooBlockProps( attributes );
	const { hasEdit } = useProductEdits();

	const dateTimeFormat = getSettings().formats.datetime;

	const [ showScheduleSale, setShowScheduleSale ] = useState( false );

	const [ salePrice ] = useEntityProp< string | null >(
		'postType',
		context.postType || 'product',
		'sale_price'
	);

	const isSalePriceGreaterThanZero =
		Number.parseFloat( salePrice || '0' ) > 0;

	const [ dateOnSaleFromGmt, setDateOnSaleFromGmt ] = useEntityProp<
		string | null
	>( 'postType', context.postType || 'product', 'date_on_sale_from_gmt' );

	const [ dateOnSaleToGmt, setDateOnSaleToGmt ] = useEntityProp<
		string | null
	>( 'postType', context.postType || 'product', 'date_on_sale_to_gmt' );

	const today = moment().startOf( 'minute' ).toISOString();

	function handleToggleChange( value: boolean ) {
		recordEvent( 'product_pricing_schedule_sale_toggle_click', {
			enabled: value,
		} );

		setShowScheduleSale( value );

		if ( value ) {
			setDateOnSaleFromGmt( today );
			setDateOnSaleToGmt( '' );
		} else {
			setDateOnSaleFromGmt( '' );
			setDateOnSaleToGmt( '' );
		}
	}

	// Hide and clean date fields if the user manually changes
	// the sale price to zero or less.
	useEffect( () => {
		if ( hasEdit( 'sale_price' ) && ! isSalePriceGreaterThanZero ) {
			setShowScheduleSale( false );
			setDateOnSaleFromGmt( '' );
			setDateOnSaleToGmt( '' );
		}
	}, [ isSalePriceGreaterThanZero ] );

	// Automatically show date fields if `from` or `to` dates have
	// any value.
	useEffect( () => {
		if ( dateOnSaleFromGmt || dateOnSaleToGmt ) {
			setShowScheduleSale( true );
		}
	}, [ dateOnSaleFromGmt, dateOnSaleToGmt ] );

	const _dateOnSaleFrom = moment( dateOnSaleFromGmt, moment.ISO_8601, true );
	const _dateOnSaleTo = moment( dateOnSaleToGmt, moment.ISO_8601, true );

	const {
		ref: dateOnSaleFromGmtRef,
		error: dateOnSaleFromGmtValidationError,
		validate: validateDateOnSaleFromGmt,
	} = useValidation< Product >(
		`date_on_sale_from_gmt-${ clientId }`,
		async function dateOnSaleFromValidator() {
			if ( showScheduleSale && dateOnSaleFromGmt ) {
				if ( ! _dateOnSaleFrom.isValid() ) {
					return {
						message: __(
							'Please enter a valid date.',
							'poocommerce'
						),
					};
				}

				if ( _dateOnSaleFrom.isAfter( _dateOnSaleTo ) ) {
					return {
						message: __(
							'The start date of the sale must be before the end date.',
							'poocommerce'
						),
					};
				}
			}
		},
		[ showScheduleSale, dateOnSaleFromGmt, _dateOnSaleFrom, _dateOnSaleTo ]
	);

	const {
		ref: dateOnSaleToGmtRef,
		error: dateOnSaleToGmtValidationError,
		validate: validateDateOnSaleToGmt,
	} = useValidation< Product >(
		`date_on_sale_to_gmt-${ clientId }`,
		async function dateOnSaleToValidator() {
			if ( showScheduleSale && dateOnSaleToGmt ) {
				if ( ! _dateOnSaleTo.isValid() ) {
					return {
						message: __(
							'Please enter a valid date.',
							'poocommerce'
						),
					};
				}

				if ( _dateOnSaleTo.isBefore( _dateOnSaleFrom ) ) {
					return {
						message: __(
							'The end date of the sale must be after the start date.',
							'poocommerce'
						),
					};
				}
			}
		},
		[ showScheduleSale, dateOnSaleFromGmt, _dateOnSaleFrom, _dateOnSaleTo ]
	);

	return (
		<div { ...blockProps }>
			<ToggleControl
				label={ __( 'Schedule sale', 'poocommerce' ) }
				checked={ showScheduleSale }
				onChange={ handleToggleChange }
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore disabled prop exists
				disabled={ ! isSalePriceGreaterThanZero }
			/>

			{ showScheduleSale && (
				<div className="wp-block-columns wp-block-poocommerce-product-schedule-sale-fields__content">
					<div className="wp-block-column">
						<DateTimePickerControl
							ref={
								dateOnSaleFromGmtRef as React.Ref< HTMLInputElement >
							}
							label={ __( 'From', 'poocommerce' ) }
							placeholder={ __(
								'Sale start date and time (optional)',
								'poocommerce'
							) }
							dateTimeFormat={ dateTimeFormat }
							currentDate={ dateOnSaleFromGmt }
							onChange={ setDateOnSaleFromGmt }
							className={
								dateOnSaleFromGmtValidationError && 'has-error'
							}
							help={ dateOnSaleFromGmtValidationError as string }
							onBlur={ () => validateDateOnSaleFromGmt() }
						/>
					</div>

					<div className="wp-block-column">
						<DateTimePickerControl
							ref={
								dateOnSaleToGmtRef as React.Ref< HTMLInputElement >
							}
							label={ __( 'To', 'poocommerce' ) }
							placeholder={ __(
								'Sale end date and time (optional)',
								'poocommerce'
							) }
							dateTimeFormat={ dateTimeFormat }
							currentDate={ dateOnSaleToGmt }
							onChange={ ( value ) =>
								setDateOnSaleToGmt(
									moment( value )
										.startOf( 'minute' )
										.toISOString()
								)
							}
							onBlur={ () => validateDateOnSaleToGmt() }
							className={
								dateOnSaleToGmtValidationError && 'has-error'
							}
							help={ dateOnSaleToGmtValidationError as string }
						/>
					</div>
				</div>
			) }
		</div>
	);
}
