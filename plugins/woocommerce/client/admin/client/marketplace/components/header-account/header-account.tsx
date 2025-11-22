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
import {
	Icon,
	commentAuthorAvatar,
	external,
	linkOff,
	chevronDown,
} from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';

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

interface HeaderAccountProps {
	page?: string;
}

export default function HeaderAccount( {
	page = 'wc-admin',
}: HeaderAccountProps ): JSX.Element {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ useDefaultAvatar, setUseDefaultAvatar ] = useState( false );

	const openModal = () => setIsModalOpen( true );

	const wccomSettings = getAdminSetting( 'wccomHelper', {} );
	const isConnected = wccomSettings?.isConnected ?? false;
	const connectionURL = connectUrl( page );
	const userEmail = wccomSettings?.userEmail;
	const avatarURL = wccomSettings?.userAvatar ?? commentAuthorAvatar;

	const accountURL = MARKETPLACE_HOST + '/my-dashboard/';
	const accountOrConnect = isConnected ? accountURL : connectionURL;
	const isInApp = page === 'wc-addons';

	const avatar = () => {
		if ( ! isConnected || useDefaultAvatar ) {
			return commentAuthorAvatar;
		}

		return (
			<img
				src={ avatarURL }
				alt=""
				className="poocommerce-marketplace__menu-avatar-image"
				onError={ () => setUseDefaultAvatar( true ) }
			/>
		);
	};

	const dropdownTrigger = () => {
		if ( ! isInApp ) {
			return avatar();
		}

		return (
			<span className="poocommerce-marketplace__header-account-trigger">
				{ avatar() }
				<span
					className="poocommerce-marketplace__header-account-trigger__email"
					title={
						isConnected
							? userEmail
							: __( 'Connect to PooCommerce.com', 'poocommerce' )
					}
				>
					{ isConnected
						? userEmail
						: __( 'Connect to PooCommerce.com', 'poocommerce' ) }
				</span>
				<Icon
					icon={ chevronDown }
					size={ 24 }
					className="poocommerce-marketplace__header-account-trigger__expand-icon"
				/>
			</span>
		);
	};

	const connectionStatusText = isConnected
		? __( 'Connected to PooCommerce.com', 'poocommerce' )
		: __( 'Connect to PooCommerce.com', 'poocommerce' );

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
							'Get product updates, manage your subscriptions from your store admin, and get streamlined support.',
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
				className="poocommerce-layout__activity-panel-tab poocommerce-marketplace__user-menu"
				icon={ dropdownTrigger() }
				label={ __( 'User options', 'poocommerce' ) }
				toggleProps={ {
					className: 'poocommerce-layout__activity-panel-tab',
					onClick: () =>
						recordEvent( 'header_account_click', { page } ),
				} }
				popoverProps={ {
					className: 'poocommerce-layout__activity-panel-popover',
				} }
			>
				{ () => (
					<>
						<MenuGroup
							className="poocommerce-layout__homescreen-display-options"
							label={
								isInApp && ! isConnected
									? undefined
									: connectionStatusText
							}
						>
							<MenuItem
								className="poocommerce-marketplace__menu-item"
								href={ accountOrConnect }
								onClick={ () => {
									if ( isConnected ) {
										recordEvent(
											'header_account_view_click',
											{ page }
										);
									} else {
										recordEvent(
											'header_account_connect_click',
											{ page }
										);
									}
								} }
							>
								{ connectionDetails() }
							</MenuItem>
							{ page === 'wc-addons' && ! isConnected && (
								<MenuItem
									href={ accountURL }
									onClick={ () =>
										recordEvent(
											'header_account_view_click',
											{ page }
										)
									}
								>
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
							) }
						</MenuGroup>
						{ isConnected && (
							<MenuGroup className="poocommerce-layout__homescreen-display-options">
								<MenuItem
									onClick={ () => {
										recordEvent(
											'header_account_disconnect_click',
											{ page }
										);
										openModal();
									} }
								>
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
