/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { chevronRight, chevronLeft, trash } from '@wordpress/icons';
import { MediaItem, MediaUpload } from '@wordpress/media-utils';
import { __ } from '@wordpress/i18n';
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SortableHandle } from '../sortable';
import { MediaUploadComponentType } from './types';
import { ImageGalleryToolbarDropdown } from './image-gallery-toolbar-dropdown';

export type ImageGalleryToolbarProps = {
	childIndex: number;
	allowDragging?: boolean;
	value?: number;
	moveItem: ( fromIndex: number, toIndex: number ) => void;
	removeItem: ( removeIndex: number ) => void;
	replaceItem: (
		replaceIndex: number,
		media: { id: number } & MediaItem
	) => void;
	setToolBarItem: ( key: string | null ) => void;
	lastChild: boolean;
	MediaUploadComponent: MediaUploadComponentType;
} & React.HTMLAttributes< HTMLDivElement >;

export const ImageGalleryToolbar = ( {
	childIndex,
	allowDragging = true,
	moveItem,
	removeItem,
	replaceItem,
	setToolBarItem,
	lastChild,
	value,
	MediaUploadComponent = MediaUpload,
}: ImageGalleryToolbarProps ) => {
	const moveNext = () => {
		moveItem( childIndex, childIndex + 1 );
	};

	const movePrevious = () => {
		moveItem( childIndex, childIndex - 1 );
	};

	const setAsCoverImage = ( coverIndex: number ) => {
		moveItem( coverIndex, 0 );
		setToolBarItem( null );
	};

	const isCoverItem = childIndex === 0;

	return (
		<div className="poocommerce-image-gallery__toolbar">
			<Toolbar
				onClick={ ( e ) => e.stopPropagation() }
				label={ __( 'Options', 'poocommerce' ) }
				id="options-toolbar"
			>
				{ ! isCoverItem && (
					<ToolbarGroup>
						{ allowDragging && (
							<ToolbarButton
								icon={ () => (
									<SortableHandle itemIndex={ childIndex } />
								) }
								label={ __( 'Drag to reorder', 'poocommerce' ) }
							/>
						) }
						<ToolbarButton
							disabled={ childIndex < 2 }
							onClick={ () => movePrevious() }
							icon={ chevronLeft }
							label={ __( 'Move previous', 'poocommerce' ) }
						/>
						<ToolbarButton
							onClick={ () => moveNext() }
							icon={ chevronRight }
							label={ __( 'Move next', 'poocommerce' ) }
							disabled={ lastChild }
						/>
					</ToolbarGroup>
				) }
				{ ! isCoverItem && (
					<ToolbarGroup>
						<ToolbarButton
							onClick={ () => setAsCoverImage( childIndex ) }
							label={ __( 'Set as cover', 'poocommerce' ) }
						>
							{ __( 'Set as cover', 'poocommerce' ) }
						</ToolbarButton>
					</ToolbarGroup>
				) }
				{ isCoverItem && (
					<ToolbarGroup className="poocommerce-image-gallery__toolbar-media">
						<MediaUploadComponent
							value={ value }
							onSelect={ ( media ) =>
								replaceItem( childIndex, media as MediaItem )
							}
							allowedTypes={ [ 'image' ] }
							render={ ( { open } ) => (
								<ToolbarButton onClick={ open }>
									{ __( 'Replace', 'poocommerce' ) }
								</ToolbarButton>
							) }
						/>
					</ToolbarGroup>
				) }
				{ isCoverItem && (
					<ToolbarGroup>
						<ToolbarButton
							onClick={ () => removeItem( childIndex ) }
							icon={ trash }
							label={ __( 'Remove', 'poocommerce' ) }
						/>
					</ToolbarGroup>
				) }
				{ ! isCoverItem && (
					<ToolbarGroup>
						<ToolbarItem>
							{ ( toggleProps ) => (
								<ImageGalleryToolbarDropdown
									canRemove={ true }
									onRemove={ () => removeItem( childIndex ) }
									onReplace={ ( media ) =>
										replaceItem( childIndex, media )
									}
									MediaUploadComponent={
										MediaUploadComponent
									}
									{ ...toggleProps }
								/>
							) }
						</ToolbarItem>
					</ToolbarGroup>
				) }
			</Toolbar>
		</div>
	);
};
