/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { Pill } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';
import { useDispatch } from '@wordpress/data';
import { getAdminLink } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { ProductIcon } from '~/marketing/components';

const MAILPOET_SLUG = 'mailpoet';

type MailPoetItemProps = {
	pluginsBeingSetup: ReadonlyArray< string >;
	onSetupClick: ( slugs: string[] ) => Promise< void >;
};

const MailPoetItem = ( {
	pluginsBeingSetup,
	onSetupClick,
}: MailPoetItemProps ) => {
	const { createSuccessNotice } = useDispatch( 'core/notices' );

	const handleSetupClick = () => {
		recordEvent( 'abandoned_cart_recovery_recommendation_click', {
			plugin: MAILPOET_SLUG,
		} );

		onSetupClick( [ MAILPOET_SLUG ] )
			.then( () => {
				createSuccessNotice(
					__( '🎉 MailPoet is installed!', 'poocommerce' ),
					{
						actions: [
							{
								url: getAdminLink(
									'admin.php?page=mailpoet-newsletters'
								),
								label: __( 'Set up MailPoet', 'poocommerce' ),
							},
						],
					}
				);
			} )
			.catch( () => {
				// Error notice handled by createNoticesFromResponse in the install hook.
			} );
	};

	return (
		<div className="poocommerce-list__item-inner poocommerce-abandoned-cart-recovery-recommendation-item">
			<div className="poocommerce-list__item-before">
				<ProductIcon product="mailpoet" />
			</div>
			<div className="poocommerce-list__item-text">
				<span className="poocommerce-list__item-title">
					{ __( 'MailPoet', 'poocommerce' ) }
					<Pill>{ __( 'Recommended', 'poocommerce' ) }</Pill>
				</span>
				<span className="poocommerce-list__item-content">
					{ __(
						'Send newsletters and automated welcome series from your PooCommerce dashboard. Free and installs in one click.',
						'poocommerce'
					) }
				</span>
			</div>
			<div className="poocommerce-list__item-after">
				<Button
					variant="secondary"
					onClick={ handleSetupClick }
					isBusy={ pluginsBeingSetup.includes( MAILPOET_SLUG ) }
					disabled={ pluginsBeingSetup.length > 0 }
				>
					{ __( 'Get started', 'poocommerce' ) }
				</Button>
			</div>
		</div>
	);
};

export default MailPoetItem;
