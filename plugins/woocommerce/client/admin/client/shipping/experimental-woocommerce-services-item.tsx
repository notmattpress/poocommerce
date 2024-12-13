/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, ExternalLink } from '@wordpress/components';
import { Pill } from '@poocommerce/components';
import { getNewPath, navigateTo } from '@poocommerce/navigation';
import { recordEvent } from '@poocommerce/tracks';
import { useLayoutContext } from '@poocommerce/admin-layout';

/**
 * Internal dependencies
 */
import './poocommerce-services-item.scss';
import WooIcon from './woo-icon.svg';

const PooCommerceServicesItem: React.FC< {
	isWCSInstalled: boolean | undefined;
} > = ( { isWCSInstalled } ) => {
	const { layoutString } = useLayoutContext();

	const handleSetupClick = () => {
		recordEvent( 'tasklist_click', {
			task_name: 'shipping-recommendation',
			context: `${ layoutString }/wc-settings`,
		} );
		navigateTo( {
			url: getNewPath( { task: 'shipping-recommendation' }, '/', {} ),
		} );
	};

	return (
		<div className="poocommerce-list__item-inner poocommerce-services-item">
			<div className="poocommerce-list__item-before">
				<img
					className="poocommerce-services-item__logo"
					src={ WooIcon }
					alt="PooCommerce Service Logo"
				/>
			</div>
			<div className="poocommerce-list__item-text">
				<span className="poocommerce-list__item-title">
					{ __( 'PooCommerce Shipping', 'poocommerce' ) }
					<Pill>{ __( 'Recommended', 'poocommerce' ) }</Pill>
				</span>
				<span className="poocommerce-list__item-content">
					{ __(
						'Print USPS and DHL Express labels straight from your PooCommerce dashboard and save on shipping.',
						'poocommerce'
					) }
					<br />
					<ExternalLink href="https://poocommerce.com/poocommerce-shipping/">
						{ __( 'Learn more', 'poocommerce' ) }
					</ExternalLink>
				</span>
			</div>
			<div className="poocommerce-list__item-after">
				<Button isSecondary onClick={ handleSetupClick }>
					{ isWCSInstalled
						? __( 'Activate', 'poocommerce' )
						: __( 'Get started', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default PooCommerceServicesItem;
