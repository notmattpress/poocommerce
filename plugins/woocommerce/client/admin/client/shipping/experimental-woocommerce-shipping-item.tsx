/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Button, ExternalLink } from '@wordpress/components';
import { Pill } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './poocommerce-shipping-item.scss';
import WooIcon from './woo-icon.svg';

const WOOCOMMERCE_SHIPPING_PLUGIN_SLUG = 'poocommerce-shipping';

export type ShippingPartnerTrackingProps = {
	context: 'settings';
	country: string;
	plugins: string;
};

const PooCommerceShippingItem = ( {
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
			selected_plugin: WOOCOMMERCE_SHIPPING_PLUGIN_SLUG,
		};

		recordEvent( 'shipping_partner_click', trackingBase );
		recordEvent( 'settings_shipping_recommendation_setup_click', {
			plugin: WOOCOMMERCE_SHIPPING_PLUGIN_SLUG,
			action: isPluginInstalled ? 'activate' : 'install',
		} );

		const action = isPluginInstalled ? onActivateClick : onInstallClick;
		const eventName = isPluginInstalled
			? 'shipping_partner_activate'
			: 'shipping_partner_install';

		action( [ WOOCOMMERCE_SHIPPING_PLUGIN_SLUG ] ).then(
			() => {
				recordEvent( eventName, {
					...trackingBase,
					success: true,
				} );
				createSuccessNotice(
					isPluginInstalled
						? __( 'PooCommerce Shipping activated!', 'poocommerce' )
						: __(
								'PooCommerce Shipping is installed!',
								'poocommerce'
						  ),
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
					src={ WooIcon }
					alt="PooCommerce Shipping Logo"
				/>
			</div>
			<div className="poocommerce-list__item-text">
				<span className="poocommerce-list__item-title">
					{ __( 'PooCommerce Shipping', 'poocommerce' ) }
					<Pill>{ __( 'Recommended', 'poocommerce' ) }</Pill>
				</span>
				<span className="poocommerce-list__item-content">
					{ __(
						'Print USPS, UPS, and DHL Express labels straight from your PooCommerce dashboard and save on shipping.',
						'poocommerce'
					) }
					<br />
					<ExternalLink href="https://poocommerce.com/poocommerce-shipping/">
						{ __( 'Learn more', 'poocommerce' ) }
					</ExternalLink>
				</span>
			</div>
			<div className="poocommerce-list__item-after">
				<Button
					variant={ isPluginInstalled ? 'primary' : 'secondary' }
					onClick={ handleClick }
					isBusy={ pluginsBeingSetup.includes(
						WOOCOMMERCE_SHIPPING_PLUGIN_SLUG
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

export default PooCommerceShippingItem;
