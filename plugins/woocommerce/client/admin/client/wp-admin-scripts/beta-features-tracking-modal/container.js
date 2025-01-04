/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import { Button, Modal, CheckboxControl } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { OPTIONS_STORE_NAME } from '@poocommerce/data';
import { recordEvent } from '@poocommerce/tracks';
import { initializeExPlat } from '@poocommerce/explat';

const BetaFeaturesTrackingModal = ( { updateOptions } ) => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isChecked, setIsChecked ] = useState( false );
	const enableNavigationCheckbox = useRef(
		document.querySelector( '#poocommerce_navigation_enabled' )
	);

	const setTracking = async ( allow ) => {
		if ( typeof window.wcTracks.enable === 'function' ) {
			if ( allow ) {
				window.wcTracks.enable( () => {
					initializeExPlat();
				} );
			} else {
				window.wcTracks.isEnabled = false;
			}
		}

		if ( allow ) {
			recordEvent( 'settings_features_tracking_enabled' );
		}

		return updateOptions( {
			poocommerce_allow_tracking: allow ? 'yes' : 'no',
		} );
	};

	useEffect( () => {
		if ( ! enableNavigationCheckbox.current ) {
			return;
		}
		const listener = ( e ) => {
			if ( e.target.checked ) {
				e.target.checked = false;
				setIsModalOpen( true );
			}
		};

		const checkbox = enableNavigationCheckbox.current;

		checkbox.addEventListener( 'change', listener, false );

		return () => checkbox.removeEventListener( 'change', listener );
	}, [] );

	if ( ! enableNavigationCheckbox.current ) {
		return null;
	}

	if ( ! isModalOpen ) {
		return null;
	}

	return (
		<Modal
			title={ __( 'Build a Better PooCommerce', 'poocommerce' ) }
			onRequestClose={ () => setIsModalOpen( false ) }
			className="poocommerce-beta-features-tracking-modal"
		>
			<p>
				{ __(
					'Testing new features requires sharing non-sensitive data via ',
					'poocommerce'
				) }
				<a href="https://poocommerce.com/usage-tracking?utm_medium=product">
					{ __( 'usage tracking', 'poocommerce' ) }
				</a>
				{ __(
					'. Gathering usage data allows us to make PooCommerce better — your store will be considered as we evaluate new features, judge the quality of an update, or determine if an improvement makes sense. No personal data is tracked or stored and you can opt-out at any time.',
					'poocommerce'
				) }
			</p>
			<div className="poocommerce-beta-features-tracking-modal__checkbox">
				<CheckboxControl
					label="Enable usage tracking"
					onChange={ setIsChecked }
					checked={ isChecked }
				/>
			</div>
			<div className="poocommerce-beta-features-tracking-modal__actions">
				<Button
					isPrimary
					onClick={ async () => {
						if ( isChecked ) {
							await setTracking( true );
							enableNavigationCheckbox.current.checked = true;
						} else {
							await setTracking( false );
						}
						setIsModalOpen( false );
					} }
				>
					{ __( 'Save', 'poocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
};

export const BetaFeaturesTrackingContainer = compose(
	withDispatch( ( dispatch ) => {
		const { updateOptions } = dispatch( OPTIONS_STORE_NAME );
		return { updateOptions };
	} )
)( BetaFeaturesTrackingModal );
