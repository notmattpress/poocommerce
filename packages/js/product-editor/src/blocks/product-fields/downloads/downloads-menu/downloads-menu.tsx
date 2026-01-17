/**
 * External dependencies
 */
import { Button, Dropdown, MenuGroup } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { DownloadsMenuProps } from './types';
import { InsertUrlMenuItem } from '../insert-url-menu-item';
import { UploadFilesMenuItem } from '../upload-files-menu-item';

export function DownloadsMenu( {
	allowedTypes,
	maxUploadFileSize,
	onUploadSuccess,
	onUploadError,
	onLinkError,
}: DownloadsMenuProps ) {
	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-end',
			} }
			contentClassName="poocommerce-downloads-menu__menu-content"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					aria-expanded={ isOpen }
					icon={ isOpen ? chevronUp : chevronDown }
					variant="secondary"
					onClick={ onToggle }
					className="poocommerce-downloads-menu__toggle"
				>
					<span>{ __( 'Add new', 'poocommerce' ) }</span>
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div className="components-dropdown-menu__menu">
					<MenuGroup>
						<UploadFilesMenuItem
							allowedTypes={ allowedTypes }
							maxUploadFileSize={ maxUploadFileSize }
							onUploadSuccess={ ( files ) => {
								onUploadSuccess( files );
								onClose();
							} }
							onUploadError={ ( error ) => {
								onUploadError( error );
								onClose();
							} }
						/>

						<InsertUrlMenuItem
							onLinkSuccess={ ( files ) => {
								onUploadSuccess( files );
								onClose();
							} }
							onLinkError={ ( error ) => {
								onLinkError( error );
								onClose();
							} }
						/>
					</MenuGroup>
				</div>
			) }
		/>
	);
}
