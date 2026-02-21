/**
 * External dependencies
 */
import { withCategory } from '@poocommerce/block-hocs';
import { withSpokenMessages } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { folderStarred } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import { withBlockControls } from '../block-controls';
import { withImageEditor } from '../image-editor';
import { withInspectorControls } from '../inspector-controls';
import { withApiError } from '../with-api-error';
import { withEditMode } from '../with-edit-mode';
import { withEditingImage } from '../with-editing-image';
import { withFeaturedItem } from '../with-featured-item';
import { withUpdateButtonAttributes } from '../with-update-button-attributes';

const GENERIC_CONFIG = {
	icon: folderStarred,
	label: __( 'Featured Category', 'poocommerce' ),
};

const BLOCK_CONTROL_CONFIG = {
	...GENERIC_CONFIG,
	cropLabel: __( 'Edit category image', 'poocommerce' ),
	editLabel: __( 'Edit selected category', 'poocommerce' ),
};

const CONTENT_CONFIG = {
	...GENERIC_CONFIG,
	emptyMessage: __( 'No product category is selected.', 'poocommerce' ),
	noSelectionButtonLabel: __( 'Select a category', 'poocommerce' ),
};

const EDIT_MODE_CONFIG = {
	...GENERIC_CONFIG,
	description: __(
		'Visually highlight a product category and encourage prompt action.',
		'poocommerce'
	),
	editLabel: __( 'Showing Featured Product block preview.', 'poocommerce' ),
};

export default compose( [
	withCategory,
	withSpokenMessages,
	withUpdateButtonAttributes,
	withEditingImage,
	withEditMode( EDIT_MODE_CONFIG ),
	withFeaturedItem( CONTENT_CONFIG ),
	withApiError,
	withImageEditor,
	withInspectorControls,
	withBlockControls( BLOCK_CONTROL_CONFIG ),
] )( () => <></> );
