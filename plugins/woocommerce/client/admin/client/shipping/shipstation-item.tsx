/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Button, ExternalLink } from '@wordpress/components';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './poocommerce-shipping-item.scss';
import type { ShippingPartnerTrackingProps } from './experimental-poocommerce-shipping-item';

const SHIPSTATION_PLUGIN_SLUG = 'poocommerce-shipstation-integration';

const ShipStationItem = ( {
	isPluginInstalled,
	onInstallClick,
	onActivateClick,
	pluginsBeingSetup,
	tracking,
}: {
	isPluginInstalled: boolean;
	pluginsBeingSetup: Array< string >;
	onInstallClick: ( slugs: string[] ) => PromiseLike< void >;
	onActivateClick: ( slugs: string[] ) => PromiseLike< void >;
	tracking?: ShippingPartnerTrackingProps;
} ) => {
	const { createSuccessNotice } = useDispatch( 'core/notices' );

	const handleClick = () => {
		const trackingBase = {
			...( tracking ?? {} ),
			selected_plugin: SHIPSTATION_PLUGIN_SLUG,
		};

		recordEvent( 'shipping_partner_click', trackingBase );
		recordEvent( 'settings_shipping_recommendation_setup_click', {
			plugin: SHIPSTATION_PLUGIN_SLUG,
			action: isPluginInstalled ? 'activate' : 'install',
		} );

		const action = isPluginInstalled ? onActivateClick : onInstallClick;
		const eventName = isPluginInstalled
			? 'shipping_partner_activate'
			: 'shipping_partner_install';

		action( [ SHIPSTATION_PLUGIN_SLUG ] ).then(
			() => {
				recordEvent( eventName, {
					...trackingBase,
					success: true,
				} );
				createSuccessNotice(
					isPluginInstalled
						? __( 'ShipStation activated!', 'poocommerce' )
						: __( 'ShipStation is installed!', 'poocommerce' ),
					{}
				);
			},
			() => {
				recordEvent( eventName, {
					...trackingBase,
					success: false,
				} );
			}
		);
	};

	return (
		<div className="poocommerce-list__item-inner poocommerce-shipping-plugin-item">
			<div className="poocommerce-list__item-before">
				<img
					className="poocommerce-shipping-plugin-item__logo"
					src="https://ps.w.org/poocommerce-shipstation-integration/assets/icon-128x128.png"
					alt=""
				/>
			</div>
			<div className="poocommerce-list__item-text">
				<span className="poocommerce-list__item-title">
					{ __( 'ShipStation', 'poocommerce' ) }
				</span>
				<span className="poocommerce-list__item-content">
					{ __(
						'Ship your PooCommerce orders with confidence, save on top carriers, and automate your processes with ShipStation.',
						'poocommerce'
					) }
					<br />
					<ExternalLink href="https://poocommerce.com/products/shipstation-integration/">
						{ __( 'Learn more', 'poocommerce' ) }
					</ExternalLink>
				</span>
			</div>
			<div className="poocommerce-list__item-after">
				<Button
					onClick={ handleClick }
					variant={ isPluginInstalled ? 'primary' : 'secondary' }
					isBusy={ pluginsBeingSetup.includes(
						SHIPSTATION_PLUGIN_SLUG
					) }
					disabled={ pluginsBeingSetup.length > 0 }
				>
					{ isPluginInstalled
						? __( 'Activate', 'poocommerce' )
						: __( 'Install', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default ShipStationItem;
