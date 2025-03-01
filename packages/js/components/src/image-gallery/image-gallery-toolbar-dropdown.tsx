/**
 * External dependencies
 */
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import {
	Children,
	cloneElement,
	createElement,
	Fragment,
	isValidElement,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { MediaItem, MediaUpload } from '@wordpress/media-utils';

/**
 * Internal dependencies
 */
import { MediaUploadComponentType } from './types';

const POPOVER_PROPS = {
	className: 'poocommerce-image-gallery__toolbar-dropdown-popover',
	placement: 'bottom-start',
};

type ImageGalleryToolbarDropdownProps = {
	onReplace: ( media: { id: number } & MediaItem ) => void;
	onRemove: () => void;
	canRemove?: boolean;
	removeBlockLabel?: string;
	MediaUploadComponent: MediaUploadComponentType;
	children?:
		| React.ReactNode
		| ( ( props: { onClose: () => void } ) => React.ReactNode );
};

export function ImageGalleryToolbarDropdown( {
	children,
	onReplace,
	onRemove,
	canRemove,
	removeBlockLabel,
	MediaUploadComponent = MediaUpload,
	...props
}: ImageGalleryToolbarDropdownProps ) {
	return (
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'Options', 'poocommerce' ) }
			className="poocommerce-image-gallery__toolbar-dropdown"
			popoverProps={ POPOVER_PROPS }
			{ ...props }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						<MediaUploadComponent
							onSelect={ ( media ) => {
								onReplace( media as MediaItem );
								onClose();
							} }
							allowedTypes={ [ 'image' ] }
							render={ ( { open } ) => (
								<MenuItem
									onClick={ () => {
										open();
									} }
								>
									{ __( 'Replace', 'poocommerce' ) }
								</MenuItem>
							) }
						/>
					</MenuGroup>
					{ typeof children === 'function'
						? children( { onClose } )
						: Children.map(
								children,
								( child ) =>
									isValidElement< { onClose: () => void } >(
										child
									) &&
									cloneElement< { onClose: () => void } >(
										child,
										{ onClose }
									)
						  ) }
					{ canRemove && (
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									onClose();
									onRemove();
								} }
							>
								{ removeBlockLabel ||
									__( 'Remove', 'poocommerce' ) }
							</MenuItem>
						</MenuGroup>
					) }
				</>
			) }
		</DropdownMenu>
	);
}
