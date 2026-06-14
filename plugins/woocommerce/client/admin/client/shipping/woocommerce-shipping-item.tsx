/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button, ExternalLink } from '@wordpress/components';
import { Pill } from '@poocommerce/components';
import { pluginsStore } from '@poocommerce/data';
import { getAdminLink } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import './poocommerce-shipping-item.scss';
import WooIcon from './woo-icon.svg';

const WoocommerceShippingItem = ( {
	onSetupClick,
	pluginsBeingSetup,
}: {
	pluginsBeingSetup: Array< string >;
	onSetupClick: ( slugs: string[] ) => PromiseLike< void >;
} ) => {
	const { createSuccessNotice } = useDispatch( 'core/notices' );

	const isSiteConnectedToJetpack = useSelect(
		( select ) => select( pluginsStore ).isJetpackConnected(),
		[]
	);

	const handleSetupClick = () => {
		onSetupClick( [ 'poocommerce-shipping' ] ).then( () => {
			const actions = [];
			if ( ! isSiteConnectedToJetpack ) {
				actions.push( {
					url: getAdminLink(
						'admin.php?page=wc-settings&tab=shipping&section=poocommerce-shipping-settings'
					),
					label: __(
						'Finish the setup by connecting your store to WordPress.com.',
						'poocommerce'
					),
				} );
			}

			createSuccessNotice(
				__( '🎉 PooCommerce Shipping is installed!', 'poocommerce' ),
				{
					actions,
				}
			);
		} );
	};

	return (
		<div className="poocommerce-list__item-inner poocommerce-shipping-plugin-item">
			<div className="poocommerce-list__item-before">
				<img
					className="poocommerce-shipping-plugin-item__logo"
					src={ WooIcon }
					alt=""
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
					isSecondary
					onClick={ handleSetupClick }
					isBusy={ pluginsBeingSetup.includes(
						'poocommerce-shipping'
					) }
					disabled={ pluginsBeingSetup.length > 0 }
				>
					{ __( 'Get started', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default WoocommerceShippingItem;
