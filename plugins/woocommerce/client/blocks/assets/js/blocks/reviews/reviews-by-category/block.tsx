/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	Placeholder,
	ToggleControl,
	withSpokenMessages,
} from '@wordpress/components';
import ProductCategoryControl from '@poocommerce/editor-components/product-category-control';
import { Icon, commentContent } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import EditorContainerBlock from '../editor-container-block';
import NoReviewsPlaceholder from './no-reviews-placeholder';
import {
	getBlockControls,
	getSharedReviewContentControls,
	getSharedReviewListControls,
} from '../edit-utils.js';
import type { ReviewsByCategoryEditorProps } from './types';

/**
 * Component to handle edit mode of "Reviews by Category".
 *
 * @param {Object}            props                Incoming props for the component.
 * @param {Object}            props.attributes     Incoming block attributes.
 * @param {function(any):any} props.debouncedSpeak
 * @param {function(any):any} props.setAttributes  Setter for block attributes.
 */
const ReviewsByCategoryEditor = ( {
	attributes,
	debouncedSpeak,
	setAttributes,
}: ReviewsByCategoryEditorProps ) => {
	const { editMode, categoryIds } = attributes;

	const getInspectorControls = () => {
		return (
			<InspectorControls key="inspector">
				<PanelBody
					title={ __( 'Category', 'poocommerce' ) }
					initialOpen={ false }
				>
					<ProductCategoryControl
						selected={ attributes.categoryIds }
						onChange={ ( value = [] ) => {
							const ids = value.map( ( { id } ) => id );
							setAttributes( { categoryIds: ids } );
						} }
						isCompact={ true }
						showReviewCount={ true }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Content', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Product name', 'poocommerce' ) }
						checked={ attributes.showProductName }
						onChange={ () =>
							setAttributes( {
								showProductName: ! attributes.showProductName,
							} )
						}
					/>
					{ getSharedReviewContentControls(
						attributes,
						setAttributes
					) }
				</PanelBody>
				<PanelBody title={ __( 'List Settings', 'poocommerce' ) }>
					{ getSharedReviewListControls( attributes, setAttributes ) }
				</PanelBody>
			</InspectorControls>
		);
	};

	const renderEditMode = () => {
		const onDone = () => {
			setAttributes( { editMode: false } );
			debouncedSpeak(
				__(
					'Now displaying a preview of the reviews for the products in the selected categories.',
					'poocommerce'
				)
			);
		};

		return (
			<Placeholder
				icon={
					<Icon
						icon={ commentContent }
						className="block-editor-block-icon"
					/>
				}
				label={ __( 'Reviews by Category', 'poocommerce' ) }
				className="wc-block-reviews-by-category"
			>
				{ __(
					'Show product reviews from specific categories.',
					'poocommerce'
				) }
				<div className="wc-block-reviews__selection">
					<ProductCategoryControl
						selected={ attributes.categoryIds }
						onChange={ ( value = [] ) => {
							const ids = value.map( ( { id } ) => id );
							setAttributes( { categoryIds: ids } );
						} }
						showReviewCount={ true }
					/>
					<Button variant="primary" onClick={ onDone }>
						{ __( 'Done', 'poocommerce' ) }
					</Button>
				</div>
			</Placeholder>
		);
	};

	if ( ! categoryIds || editMode ) {
		return renderEditMode();
	}

	const buttonTitle = __( 'Edit selected categories', 'poocommerce' );

	return (
		<>
			{ getBlockControls( editMode, setAttributes, buttonTitle ) }
			{ getInspectorControls() }
			<EditorContainerBlock
				attributes={ attributes }
				icon={
					<Icon
						icon={ commentContent }
						className="block-editor-block-icon"
					/>
				}
				name={ __( 'Reviews by Category', 'poocommerce' ) }
				noReviewsPlaceholder={ NoReviewsPlaceholder }
			/>
		</>
	);
};

export default withSpokenMessages( ReviewsByCategoryEditor );
