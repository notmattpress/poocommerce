/**
 * External dependencies
 */
import { ComponentProps } from 'react';
import { useState } from '@wordpress/element';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem as OriginalMenuItem,
} from '@wordpress/components';
import { Icon, commentAuthorAvatar, external, linkOff } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './header-account.scss';
import { getAdminSetting } from '../../../utils/admin-settings';
import HeaderAccountModal from './header-account-modal';
import { MARKETPLACE_HOST } from '../constants';
import { connectUrl } from '../../utils/functions';

// Make TS happy: The MenuItem component passes these as an href prop to the underlying button.
interface MenuItemProps extends ComponentProps< typeof OriginalMenuItem > {
	href?: string; // Explicitly declare `href`
}

const MenuItem = ( props: MenuItemProps ) => <OriginalMenuItem { ...props } />;

export default function HeaderAccount(): JSX.Element {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const openModal = () => setIsModalOpen( true );

	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	const isConnected = wccomSettings?.isConnected ?? false;
	const connectionURL = connectUrl();
	const userEmail = wccomSettings?.userEmail;
	const avatarURL = wccomSettings?.userAvatar ?? commentAuthorAvatar;

	const accountURL = MARKETPLACE_HOST + '/my-dashboard/';
	const accountOrConnect = isConnected ? accountURL : connectionURL;

	const avatar = () => {
		if ( ! isConnected ) {
			return commentAuthorAvatar;
		}

		return (
			<img
				src={ avatarURL }
				alt=""
				className="poocommerce-marketplace__menu-avatar-image"
			/>
		);
	};

	const connectionStatusText = isConnected
		? __( 'Connected', 'poocommerce' )
		: __( 'Not Connected', 'poocommerce' );

	const connectionDetails = () => {
		if ( isConnected ) {
			return (
				<>
					<Icon
						icon={ commentAuthorAvatar }
						size={ 24 }
						className="poocommerce-marketplace__menu-icon"
					/>
					<span className="poocommerce-marketplace__main-text">
						{ userEmail }
					</span>
				</>
			);
		}
		return (
			<>
				<Icon
					icon={ commentAuthorAvatar }
					size={ 24 }
					className="poocommerce-marketplace__menu-icon"
				/>
				<div className="poocommerce-marketplace__menu-text">
					{ __( 'Connect account', 'poocommerce' ) }
					<span className="poocommerce-marketplace__sub-text">
						{ __(
							'Manage your subscriptions, get updates and support for your extensions and themes.',
							'poocommerce'
						) }
					</span>
				</div>
			</>
		);
	};

	return (
		<>
			<DropdownMenu
				className="poocommerce-marketplace__user-menu"
				icon={ avatar() }
				label={ __( 'User options', 'poocommerce' ) }
			>
				{ () => (
					<>
						<MenuGroup
							className="poocommerce-layout__homescreen-display-options"
							label={ connectionStatusText }
						>
							<MenuItem
								className="poocommerce-marketplace__menu-item"
								href={ accountOrConnect }
							>
								{ connectionDetails() }
							</MenuItem>
							<MenuItem href={ accountURL }>
								<Icon
									icon={ external }
									size={ 24 }
									className="poocommerce-marketplace__menu-icon"
								/>
								{ __(
									'PooCommerce.com account',
									'poocommerce'
								) }
							</MenuItem>
						</MenuGroup>
						{ isConnected && (
							<MenuGroup className="poocommerce-layout__homescreen-display-options">
								<MenuItem onClick={ openModal }>
									<Icon
										icon={ linkOff }
										size={ 24 }
										className="poocommerce-marketplace__menu-icon"
									/>
									{ __(
										'Disconnect account',
										'poocommerce'
									) }
								</MenuItem>
							</MenuGroup>
						) }
					</>
				) }
			</DropdownMenu>
			{ isModalOpen && (
				<HeaderAccountModal
					setIsModalOpen={ setIsModalOpen }
					disconnectURL={ connectionURL }
				/>
			) }
		</>
	);
}
