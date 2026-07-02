/**
 * External dependencies
 */
import type { PooCommerceConfig } from '@poocommerce/stores/poocommerce/cart';

export interface ProductGalleryBlockAttributes {
	hoverZoom: boolean;
	fullScreenOnClick: boolean;
}

export interface ProductGallerySettingsProps {
	attributes: ProductGalleryBlockAttributes;
	setAttributes: (
		attributes: Partial< ProductGalleryBlockAttributes >
	) => void;
}

export type VariationImageSet = {
	image_id?: number;
	image_ids?: number[];
};

export type ProductImageSet = VariationImageSet & {
	variations?: Record< number, VariationImageSet >;
};

export type ProductGalleryConfig = PooCommerceConfig & {
	products?: Record< string, ProductImageSet >;
};

export type LegacyVariationPayload = {
	image_id?: number;
	gallery_image_ids?: number[];
};

export type LegacyJQueryInstance = {
	on: (
		eventName: string,
		handler: ( event?: unknown, variation?: LegacyVariationPayload ) => void
	) => LegacyJQueryInstance;
	off: ( namespace: string ) => LegacyJQueryInstance;
};

export type LegacyJQueryWindow = Window & {
	jQuery?: ( target: Element | string ) => LegacyJQueryInstance;
};

export type LegacyJQueryFormHandlers = {
	onVariationFound: ( imageIds: number[], featuredImageId?: number ) => void;
	onVariationReset: () => void;
};

export interface ProductGalleryContext {
	selectedImageId: number;
	isDialogOpen: boolean;
	productId: string;
	touchStartX: number;
	touchCurrentX: number;
	isDragging: boolean;
	imageData: number[];
	thumbnailsOverflow: {
		top: boolean;
		bottom: boolean;
		left: boolean;
		right: boolean;
	};
	// Next/Previous Buttons block context
	hideNextPreviousButtons: boolean;
	isDisabledPrevious: boolean;
	isDisabledNext: boolean;
	ariaLabelPrevious: string;
	ariaLabelNext: string;
}
