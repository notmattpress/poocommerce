/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import interpolateComponents from '@automattic/interpolate-components';
import { Button, Card, CardBody, createSlotFill } from '@wordpress/components';
import { Icon, closeSmall } from '@wordpress/icons';
import { useEffect, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './conflict-error-slotfill.scss';
import warningIcon from './alert-triangle-icon.svg';
import { SETTINGS_SLOT_FILL_CONSTANT } from './settings-slots';

const { Fill } = createSlotFill( SETTINGS_SLOT_FILL_CONSTANT );

const LearnMore = () => (
	<Button
		href="https://poocommerce.com/document/setting-up-taxes-in-poocommerce/"
		target="_blank"
	>
		{ __( 'Learn more', 'poocommerce' ) }
	</Button>
);

const SettingsErrorFill = () => {
	const [ dismissedConflictWarning, setDismissedConflictWarning ] =
		useState( false );

	const [ pricesEnteredWithTaxSetting, setMainVal ] = useState(
		document.forms.mainform.elements.poocommerce_prices_include_tax
			?.value === 'yes'
			? 'incl'
			: 'excl'
	);
	const [ displayPricesInShopWithTaxSetting, setDisplayShop ] = useState(
		/** We're using jQuery in this file because the select boxes are implemented using select2 and can only be interacted with using jQuery */
		window.jQuery( '#poocommerce_tax_display_shop' ).val()
	);
	const [ displayPricesInCartWithTaxSetting, setDisplayCart ] = useState(
		/** We're using jQuery in this file because the select boxes are implemented using select2 and can only be interacted with using jQuery */
		window.jQuery( '#poocommerce_tax_display_cart' ).val()
	);

	const { createNotice } = useDispatch( noticesStore );

	const handleApplyRecommendedSettings = () => {
		/** We're using jQuery in this file because the select boxes are implemented using select2 and can only be interacted with using jQuery */
		// eslint-disable-next-line no-undef
		window
			.jQuery( '#poocommerce_tax_display_shop' )
			.val( pricesEnteredWithTaxSetting )
			.trigger( 'change' );
		window
			.jQuery( '#poocommerce_tax_display_cart' )
			.val( pricesEnteredWithTaxSetting )
			.trigger( 'change' );

		createNotice(
			'success',
			__( 'Recommended settings applied.', 'poocommerce' )
		);

		recordEvent( 'tax_settings_conflict_recommended_settings_clicked' );
	};

	const ApplyRecommendedSettingsButton = () => (
		<Button variant="primary" onClick={ handleApplyRecommendedSettings }>
			{ __( 'Use recommended settings', 'poocommerce' ) }
		</Button>
	);

	useEffect( () => {
		document
			.querySelectorAll( "input[name='poocommerce_prices_include_tax']" )
			.forEach( ( input ) => {
				input.addEventListener( 'change', () =>
					setMainVal(
						document.forms.mainform.elements
							.poocommerce_prices_include_tax.value === 'yes'
							? 'incl'
							: 'excl'
					)
				);
			} );
	}, [] );

	useEffect( () => {
		window
			.jQuery( '#poocommerce_tax_display_shop' )
			.on( 'click change', () =>
				setDisplayShop(
					document.getElementById( 'poocommerce_tax_display_shop' )
						.value
				)
			);
	}, [] );

	useEffect( () => {
		window
			.jQuery( '#poocommerce_tax_display_cart' )
			.on( 'click change', () =>
				setDisplayCart(
					document.getElementById( 'poocommerce_tax_display_cart' )
						.value
				)
			);
	}, [] );

	const [ isConflict, setIsConflict ] = useState( false );

	useEffect( () => {
		if (
			displayPricesInShopWithTaxSetting === pricesEnteredWithTaxSetting &&
			displayPricesInCartWithTaxSetting === pricesEnteredWithTaxSetting
		) {
			setIsConflict( false );
		} else {
			setIsConflict( true );

			recordEvent( 'tax_settings_conflict', {
				main: pricesEnteredWithTaxSetting,
				shop: displayPricesInShopWithTaxSetting,
				cart: displayPricesInCartWithTaxSetting,
			} );
		}
	}, [
		displayPricesInCartWithTaxSetting,
		displayPricesInShopWithTaxSetting,
		pricesEnteredWithTaxSetting,
	] );

	if ( ! isConflict || dismissedConflictWarning ) {
		return <Fill></Fill>;
	}

	return (
		<Fill>
			<div className="poocommerce_tax_settings_conflict_error">
				<Card>
					<CardBody className="poocommerce_tax_settings_conflict_error_card_body">
						<div>
							<img
								className="poocommerce_tax_settings_conflict_error_card_body__warning_icon"
								src={ warningIcon }
								alt="Warning Icon"
							/>
						</div>
						<div>
							<div className="poocommerce_tax_settings_conflict_error_card_body__body_text">
								<p style={ { fontSize: 13 } }>
									{ interpolateComponents( {
										mixedString: __(
											'{{b}}Inconsistent tax settings:{{/b}} To avoid possible rounding errors, prices should be entered and displayed consistently in all locations either including, or excluding taxes.',
											'poocommerce'
										),
										components: {
											b: <b />,
										},
									} ) }
								</p>
							</div>
							<div className="poocommerce_tax_settings_conflict_error_card_body__buttons">
								<ApplyRecommendedSettingsButton /> <LearnMore />
							</div>
						</div>
						<div>
							<Button
								className="poocommerce_tax_settings_conflict_error_card_body__close_icon"
								onClick={ () => {
									setDismissedConflictWarning( true );

									recordEvent(
										'tax_settings_conflict_dismissed'
									);
								} }
							>
								<Icon icon={ closeSmall } />
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		</Fill>
	);
};

export const registerTaxSettingsConflictErrorFill = () => {
	registerPlugin( 'poocommerce-admin-tax-settings-conflict-warning', {
		scope: 'poocommerce-tax-settings',
		render: SettingsErrorFill,
	} );
};
