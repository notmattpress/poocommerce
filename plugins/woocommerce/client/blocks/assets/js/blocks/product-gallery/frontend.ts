/**
 * External dependencies
 */
import {
	store,
	getContext as getContextFn,
	getElement,
	withScope,
} from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import type { ProductGalleryContext } from './types';
import { checkOverflow } from './utils';

const getContext = ( ns?: string ) =>
	getContextFn< ProductGalleryContext >( ns );

const getArrowsState = ( imageNumber: number, totalImages: number ) => ( {
	// One-based index so it ranges from 1 to imagesIds.length.
	disableLeft: imageNumber === 1,
	disableRight: imageNumber === totalImages,
} );

/**
 * Scrolls the image into view for the main image.
 *
 * We use getElement to get the current element that triggered the action
 * to find the closest gallery container and scroll the image into view.
 * This is necessary because if you have two galleries on the same page with the same image IDs,
 * then we need to query the image in the correct gallery to avoid scrolling the wrong image into view.
 *
 * @param {string} imageId - The ID of the image to scroll into view.
 */
const scrollImageIntoView = ( imageId: number ) => {
	if ( ! imageId ) {
		return;
	}

	// Get the current element that triggered the action
	const element = getElement()?.ref as HTMLElement;

	if ( ! element ) {
		return;
	}

	// Find the closest gallery container
	const galleryContainer = element.closest(
		'.wp-block-poocommerce-product-gallery'
	);

	if ( ! galleryContainer ) {
		return;
	}

	const imageElement = galleryContainer.querySelector(
		`.wp-block-poocommerce-product-gallery-large-image img[data-image-id="${ imageId }"]`
	);

	if ( imageElement ) {
		imageElement.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	}
};

/**
 * Gets the number of the active image.
 *
 * @param {number[]} imageIds        - The IDs of the images.
 * @param {number}   selectedImageId - The ID of the selected image.
 * @return {number} The number of the active image.
 */
const getSelectedImageNumber = (
	imageIds: number[],
	selectedImageId: number
) => imageIds.indexOf( selectedImageId ) + 1;

const productGallery = {
	state: {
		/**
		 * The number of the active image. Not to be confused with the index of the active image in the imageIds array.
		 *
		 * @return {number} The number of the active image.
		 */
		get selectedImageNumber(): number {
			const { imageData, selectedImageId } = getContext();
			const allImageIds = imageData?.image_ids || [];
			return getSelectedImageNumber( allImageIds, selectedImageId );
		},
		/**
		 * The index of the active image in the imageIds array.
		 *
		 * @return {number} The index of the active image.
		 */
		get imageIndex(): number {
			const { imageData, selectedImageId } = getContext();
			const allImageIds = imageData?.image_ids || [];
			return allImageIds.indexOf( selectedImageId );
		},
		/**
		 * The processed image data.
		 *
		 * @return {Object} The processed image data.
		 */
		get processedImageData() {
			// The thumbnail block preloads all required images into cache. Without thumbnails, only the first two images load initially,
			// as users navigate one at a time, with more loading on interaction. If thumbnails later use smaller, separate images, this
			// logic will need adjustment, as users could jump to an unloaded image by clicking a thumbnail.
			const { imageData, userHasInteracted, selectedImageId } =
				getContext();

			const allImageIds = imageData?.image_ids || [];
			const selectedImageNumber = getSelectedImageNumber(
				allImageIds,
				selectedImageId
			);

			const processedImageData = allImageIds.map( ( imageId, index ) => {
				const isActive = selectedImageNumber === index + 1;
				const tabIndex = isActive ? '0' : '-1';
				const imageObject = imageData?.images[ imageId ];

				if ( ! userHasInteracted && index >= 2 ) {
					// Return a copy with empty src and srcSet for images beyond the first two
					return {
						...imageObject,
						isActive,
						tabIndex,
						src: '',
						srcset: '',
					};
				}
				return {
					...imageObject,
					isActive,
					tabIndex,
				};
			} );

			return processedImageData;
		},
		/**
		 * The subset of processedImageData that is displayed in the thumbnails block.
		 *
		 * @return Array The subset of processed image data.
		 */
		get thumbnails() {
			const { imageData } = getContext();
			const allImageIds = imageData?.image_ids || [];
			// Map the image IDs to the image data. imageData?.images is an object and it's sorted by image ID - which we don't want.
			return allImageIds.map(
				( imageId ) => imageData?.images[ imageId ]
			);
		},
	},
	actions: {
		userHasInteracted: () => {
			const context = getContext();
			context.userHasInteracted = true;
		},
		selectImage: ( newImageNumber: number ) => {
			const context = getContext();
			const { imageData } = context;

			const allImageIds = imageData?.image_ids || [];
			const { disableLeft, disableRight } = getArrowsState(
				newImageNumber,
				allImageIds.length
			);
			actions.userHasInteracted();
			context.disableLeft = disableLeft;
			context.disableRight = disableRight;

			const imageIndex = newImageNumber - 1;
			const imageId = allImageIds[ imageIndex ];

			context.selectedImageId = imageId;

			if ( imageIndex !== -1 ) {
				scrollImageIntoView( imageId );
			}
		},
		selectCurrentImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}
			const element = getElement()?.ref as HTMLElement;
			if ( ! element ) {
				return;
			}
			const imageIdValue = element.getAttribute( 'data-image-id' );
			if ( ! imageIdValue ) {
				return;
			}
			const imageId = parseInt( imageIdValue, 10 );
			const context = getContext();
			const { imageData } = context;
			const allImageIds = imageData?.image_ids || [];
			const newImageNumber = allImageIds.indexOf( imageId ) + 1;
			actions.selectImage( newImageNumber );
		},
		selectNextImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}
			const { imageData, selectedImageId } = getContext();
			const allImageIds = imageData?.image_ids || [];
			const selectedImageNumber = getSelectedImageNumber(
				allImageIds,
				selectedImageId
			);
			const newImageNumber = Math.min(
				allImageIds.length,
				selectedImageNumber + 1
			);

			actions.selectImage( newImageNumber );
		},
		selectPreviousImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}

			const { imageData, selectedImageId } = getContext();
			const allImageIds = imageData?.image_ids || [];
			const selectedImageNumber = getSelectedImageNumber(
				allImageIds,
				selectedImageId
			);
			const newImageNumber = Math.max( 1, selectedImageNumber - 1 );

			actions.selectImage( newImageNumber );
		},
		onSelectedLargeImageKeyDown: ( event: KeyboardEvent ) => {
			if (
				event.code === 'Enter' ||
				event.code === 'Space' ||
				event.code === 'NumpadEnter'
			) {
				if ( event.code === 'Space' ) {
					event.preventDefault();
				}
				actions.openDialog();
			}

			if ( event.code === 'ArrowRight' ) {
				actions.selectNextImage();
			}

			if ( event.code === 'ArrowLeft' ) {
				actions.selectPreviousImage();
			}
		},
		onThumbnailKeyDown: ( event: KeyboardEvent ) => {
			if (
				event.code === 'Enter' ||
				event.code === 'Space' ||
				event.code === 'NumpadEnter'
			) {
				if ( event.code === 'Space' ) {
					event.preventDefault();
				}
				actions.selectCurrentImage();
			}
		},
		onDialogKeyDown: ( event: KeyboardEvent ) => {
			if ( event.code === 'Escape' ) {
				actions.closeDialog();
			}
		},
		openDialog: () => {
			const context = getContext();
			context.isDialogOpen = true;
			document.body.classList.add(
				'wc-block-product-gallery-dialog-open'
			);
		},
		closeDialog: () => {
			const context = getContext();
			context.isDialogOpen = false;
			document.body.classList.remove(
				'wc-block-product-gallery-dialog-open'
			);
		},
		onTouchStart: ( event: TouchEvent ) => {
			const context = getContext();
			const { clientX } = event.touches[ 0 ];
			context.touchStartX = clientX;
			context.touchCurrentX = clientX;
			context.isDragging = true;
		},
		onTouchMove: ( event: TouchEvent ) => {
			const context = getContext();
			if ( ! context.isDragging ) {
				return;
			}
			const { clientX } = event.touches[ 0 ];
			context.touchCurrentX = clientX;
			event.preventDefault();
		},
		onTouchEnd: () => {
			const context = getContext();
			if ( ! context.isDragging ) {
				return;
			}

			const SNAP_THRESHOLD = 0.2;
			const delta = context.touchCurrentX - context.touchStartX;
			const element = getElement()?.ref as HTMLElement;
			const imageWidth = element?.offsetWidth || 0;

			// Only trigger swipe actions if there was significant movement
			if ( Math.abs( delta ) > imageWidth * SNAP_THRESHOLD ) {
				if ( delta > 0 && ! context.disableLeft ) {
					actions.selectPreviousImage();
				} else if ( delta < 0 && ! context.disableRight ) {
					actions.selectNextImage();
				}
			}

			// Reset touch state
			context.isDragging = false;
			context.touchStartX = 0;
			context.touchCurrentX = 0;
		},
		onScroll: () => {
			const scrollableElement = getElement()?.ref;
			if ( ! scrollableElement ) {
				return;
			}
			const context = getContext();
			const overflowState = checkOverflow( scrollableElement );

			context.thumbnailsOverflow = overflowState;
		},
	},
	callbacks: {
		watchForChangesOnAddToCartForm: () => {
			const context = getContext();
			const variableProductCartForm = document.querySelector(
				`form[data-product_id="${ context.productId }"]`
			);

			if ( ! variableProductCartForm ) {
				return;
			}

			const selectFirstImage = () =>
				withScope( () => actions.selectImage( 1 ) );

			// Initial mutation is triggered when the page is loaded.
			// We don't want to set `userHasInteracted` to true on initial mutation
			let isInitialMutation = true;

			const observer = new MutationObserver(
				withScope( function ( mutations ) {
					for ( const mutation of mutations ) {
						if ( ! isInitialMutation ) {
							actions.userHasInteracted();
						}

						if ( isInitialMutation ) {
							isInitialMutation = false;
						}

						const { imageData } = getContext();
						const allImageIds = imageData?.image_ids || [];

						const mutationTarget = mutation.target as HTMLElement;
						const currentImageAttribute =
							mutationTarget.getAttribute( 'current-image' );
						const currentImageId = currentImageAttribute
							? parseInt( currentImageAttribute, 10 )
							: null;
						if (
							mutation.type === 'attributes' &&
							currentImageId &&
							allImageIds.includes( currentImageId )
						) {
							const nextImageNumber =
								allImageIds.indexOf( currentImageId ) + 1;

							actions.selectImage( nextImageNumber );
						} else {
							actions.selectImage( 1 );
						}
					}
				} )
			);

			observer.observe( variableProductCartForm, {
				attributes: true,
			} );

			const clearVariationsLink = document.querySelector(
				'.wp-block-add-to-cart-form .reset_variations'
			);

			if ( clearVariationsLink ) {
				clearVariationsLink.addEventListener(
					'click',
					selectFirstImage
				);
			}

			return () => {
				observer.disconnect();
				document.removeEventListener( 'click', selectFirstImage );
			};
		},
		dialogStateChange: () => {
			const { selectedImageId, isDialogOpen } = getContext();
			const { ref: dialogRef } = getElement() || {};

			if ( isDialogOpen && dialogRef instanceof HTMLElement ) {
				dialogRef.focus();
				const selectedImage = dialogRef.querySelector(
					`[data-image-id="${ selectedImageId }"]`
				);

				if ( selectedImage instanceof HTMLElement ) {
					selectedImage.scrollIntoView( {
						behavior: 'auto',
						block: 'center',
					} );
					selectedImage.focus();
				}
			}
		},
	},
};

const { actions } = store( 'poocommerce/product-gallery', productGallery, {
	lock: true,
} );

export type Store = typeof productGallery;
