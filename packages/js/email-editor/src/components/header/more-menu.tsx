/**
 * External dependencies
 */
import { MenuGroup, MenuItem, DropdownMenu } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { displayShortcut } from '@wordpress/keycodes';
import { moreVertical } from '@wordpress/icons';
import { useEntityProp } from '@wordpress/core-data';
import { __, _x } from '@wordpress/i18n';
import { PreferenceToggleMenuItem } from '@wordpress/preferences';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { storeName, editorCurrentPostType } from '../../store';
import { TrashModal } from './trash-modal';
import { recordEvent } from '../../events';

// See:
//   https://github.com/WordPress/gutenberg/blob/9601a33e30ba41bac98579c8d822af63dd961488/packages/edit-post/src/components/header/more-menu/index.js
//   https://github.com/WordPress/gutenberg/blob/0ee78b1bbe9c6f3e6df99f3b967132fa12bef77d/packages/edit-site/src/components/header/more-menu/index.js

export function MoreMenu(): JSX.Element {
	const [ showTrashModal, setShowTrashModal ] = useState( false );
	const { urls, postId } = useSelect(
		( select ) => ( {
			urls: select( storeName ).getUrls(),
			postId: select( storeName ).getEmailPostId(),
		} ),
		[]
	);
	const [ status, setStatus ] = useEntityProp(
		'postType',
		editorCurrentPostType,
		'status'
	);
	const { saveEditedEmail } = useDispatch( storeName );
	const goToListings = () => {
		window.location.href = urls.listings;
	};

	return (
		<>
			<DropdownMenu
				className="edit-site-more-menu"
				popoverProps={ {
					className: 'edit-site-more-menu__content',
				} }
				icon={ moreVertical }
				label={ __( 'More', 'poocommerce' ) }
				onToggle={ ( isOpened ) =>
					recordEvent( 'header_more_menu_dropdown_toggle', {
						isOpened,
					} )
				}
			>
				{ ( { onClose } ) => (
					<>
						<MenuGroup
							label={ _x( 'View', 'noun', 'poocommerce' ) }
						>
							<PreferenceToggleMenuItem
								scope="core"
								name="fixedToolbar"
								label={ __( 'Top toolbar', 'poocommerce' ) }
								info={ __(
									'Access all block and document tools in a single place',
									'poocommerce'
								) }
								messageActivated={ __(
									'Top toolbar activated',
									'poocommerce'
								) }
								messageDeactivated={ __(
									'Top toolbar deactivated',
									'poocommerce'
								) }
								onToggle={ () =>
									recordEvent(
										'header_more_menu_fixed_toolbar_toggle'
									)
								}
							/>
							<PreferenceToggleMenuItem
								scope="core"
								name="focusMode"
								label={ __( 'Spotlight mode', 'poocommerce' ) }
								info={ __(
									'Focus at one block at a time',
									'poocommerce'
								) }
								messageActivated={ __(
									'Spotlight mode activated',
									'poocommerce'
								) }
								messageDeactivated={ __(
									'Spotlight mode deactivated',
									'poocommerce'
								) }
								onToggle={ () =>
									recordEvent(
										'header_more_menu_focus_mode_toggle'
									)
								}
							/>
							<PreferenceToggleMenuItem
								scope={ storeName }
								name="fullscreenMode"
								label={ __( 'Fullscreen mode', 'poocommerce' ) }
								info={ __(
									'Work without distraction',
									'poocommerce'
								) }
								messageActivated={ __(
									'Fullscreen mode activated',
									'poocommerce'
								) }
								messageDeactivated={ __(
									'Fullscreen mode deactivated',
									'poocommerce'
								) }
								shortcut={ displayShortcut.secondary( 'f' ) }
								onToggle={ () =>
									recordEvent(
										'header_more_menu_fullscreen_mode_toggle'
									)
								}
							/>
						</MenuGroup>
						<MenuGroup>
							{ status === 'trash' ? (
								<MenuItem
									onClick={ async () => {
										await setStatus( 'draft' );
										await saveEditedEmail();
										recordEvent(
											'header_more_menu_restore_from_trash_button_clicked'
										);
									} }
								>
									{ __(
										'Restore from trash',
										'poocommerce'
									) }
								</MenuItem>
							) : (
								<MenuItem
									onClick={ () => {
										setShowTrashModal( true );
										recordEvent(
											'header_more_menu_move_to_trash_button_clicked'
										);
										onClose();
									} }
									isDestructive
								>
									{ __( 'Move to trash', 'poocommerce' ) }
								</MenuItem>
							) }
						</MenuGroup>
					</>
				) }
			</DropdownMenu>
			{ showTrashModal && (
				<TrashModal
					onClose={ () => setShowTrashModal( false ) }
					onRemove={ goToListings }
					postId={ postId }
				/>
			) }
		</>
	);
}
