/**
 * External dependencies
 */
import { Button, ButtonGroup, Modal, Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getNewPath, navigateTo, useQuery } from '@poocommerce/navigation';
import {
	useCallback,
	useContext,
	useEffect,
	useState,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Subscription } from '../../types';
import { getAdminSetting } from '../../../../../utils/admin-settings';
import Install from './install';
import { SubscriptionsContext } from '../../../../contexts/subscriptions-context';
import { MARKETPLACE_PATH, WP_ADMIN_PLUGIN_LIST_URL } from '../../../constants';
import ConnectAccountButton from './connect-account-button';
import ProductCard from '../../../product-card/product-card';
import { addNotice, subscriptionToProduct } from '../../../../utils/functions';
import { NoticeStatus } from '../../../../contexts/types';

export default function InstallModal() {
	const query = useQuery();
	const installingProductKey = query?.install;

	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	const isConnected = !! wccomSettings?.isConnected;

	const [ showModal, setShowModal ] = useState< boolean >( false );
	const [ isInstalled, setIsInstalled ] = useState< boolean >( false );

	const { subscriptions, isLoading } = useContext( SubscriptionsContext );

	const subscription: Subscription | undefined = subscriptions.find(
		( s: Subscription ) => s.product_key === installingProductKey
	);

	const removeInstallQuery = useCallback( () => {
		navigateTo( {
			url: getNewPath(
				{
					...query,
					install: undefined,
				},
				MARKETPLACE_PATH,
				{}
			),
		} );
	}, [ query ] );

	useEffect( () => {
		if ( isLoading ) {
			return;
		}

		// If subscriptions loaded, but we don't have a subscription for the product key, show an error.
		if (
			installingProductKey &&
			isConnected &&
			! isLoading &&
			! subscription
		) {
			addNotice(
				installingProductKey,
				sprintf(
					/* translators: %s is the product key */
					__(
						'Could not find subscription with product key %s.',
						'poocommerce'
					),
					installingProductKey
				),
				NoticeStatus.Error
			);
			removeInstallQuery();
		} else {
			setShowModal( !! installingProductKey );
		}
	}, [
		isConnected,
		isLoading,
		installingProductKey,
		removeInstallQuery,
		subscription,
	] );

	useEffect( () => {
		if ( subscription && subscription.local.installed ) {
			setIsInstalled( true );
		}
	}, [ subscription ] );

	const onClose = () => {
		removeInstallQuery();
		setShowModal( false );
	};

	const modalTitle = () => {
		if ( isInstalled ) {
			return __( 'You are ready to go!', 'poocommerce' );
		}

		return __( 'Add to store', 'poocommerce' );
	};

	const modalContent = () => {
		if ( ! isConnected ) {
			return (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'In order to install a product, you need to first connect your account.',
						'poocommerce'
					) }
				</Notice>
			);
		} else if ( subscription ) {
			const installContent = isInstalled
				? __(
						'Keep the momentum going and start setting up your extension.',
						'poocommerce'
				  )
				: __(
						'Would you like to install this extension?',
						'poocommerce'
				  );
			return (
				<>
					<p className="poocommerce-marketplace__header-account-modal-text">
						{ installContent }
					</p>
					<ProductCard
						product={ subscriptionToProduct( subscription ) }
						small={ true }
						tracksData={ {
							position: 1,
							group: 'subscriptions',
							label: 'install',
						} }
					/>
				</>
			);
		}
	};
	const modalButtons = () => {
		const buttons = [];
		if ( isInstalled ) {
			buttons.push(
				<Button
					variant="secondary"
					href={ subscription?.documentation_url }
					target="_blank"
					className="poocommerce-marketplace__header-account-modal-button"
					key={ 'docs' }
				>
					{ __( 'View docs', 'poocommerce' ) }
				</Button>
			);
			buttons.push(
				<Button
					variant="primary"
					href={ WP_ADMIN_PLUGIN_LIST_URL }
					className="poocommerce-marketplace__header-account-modal-button"
					key={ 'plugin-list' }
				>
					{ __( 'View in Plugins', 'poocommerce' ) }
				</Button>
			);
		} else {
			buttons.push(
				<Button
					variant="tertiary"
					onClick={ onClose }
					className="poocommerce-marketplace__header-account-modal-button"
					key={ 'cancel' }
				>
					{ __( 'Cancel', 'poocommerce' ) }
				</Button>
			);

			if ( ! isConnected ) {
				buttons.push(
					<ConnectAccountButton
						variant="primary"
						install={ installingProductKey }
						key={ 'connect' }
					/>
				);
			} else if ( subscription ) {
				buttons.push(
					<Install
						subscription={ subscription }
						variant="primary"
						onError={ onClose }
						key={ 'install' }
					/>
				);
			}
		}
		return (
			<ButtonGroup className="poocommerce-marketplace__header-account-modal-button-group">
				{ buttons }
			</ButtonGroup>
		);
	};

	if ( ! showModal ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitle() }
			onRequestClose={ onClose }
			focusOnMount={ true }
			className="poocommerce-marketplace__header-account-modal has-size-medium"
			style={ { borderRadius: 4 } }
			overlayClassName="poocommerce-marketplace__header-account-modal-overlay"
		>
			{ modalContent() }
			{ modalButtons() }
		</Modal>
	);
}
