/**
 * External dependencies
 */
import {
	BlockInstance,
	createBlock,
	getBlockType,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';
import type { BlockEditProps } from '@wordpress/blocks';
import { WC_BLOCKS_IMAGE_URL } from '@poocommerce/block-settings';
import {
	useBlockProps,
	BlockPreview,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Placeholder, Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { box, Icon } from '@wordpress/icons';
import { useDispatch, subscribe, useSelect, select } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { useEntityRecord } from '@wordpress/core-data';
import { woo } from '@poocommerce/icons';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { BLOCK_SLUG, TEMPLATES, TYPES } from './constants';
import {
	isClassicTemplateBlockRegisteredWithAnotherTitle,
	hasTemplateSupportForClassicTemplateBlock,
	getTemplateDetailsBySlug,
} from './utils';
import {
	blockifiedProductCatalogConfig,
	blockifiedProductTaxonomyConfig,
} from './archive-product';
import * as blockifiedSingleProduct from './single-product';
import * as blockifiedProductSearchResults from './product-search-results';
import * as blockifiedOrderConfirmation from './order-confirmation';

import type { BlockifiedTemplateConfig } from './types';

type Attributes = {
	template: string;
	align: string;
};

const blockifiedFallbackConfig = {
	isConversionPossible: () => false,
	getBlockifiedTemplate: () => [],
	getDescription: () => '',
	onClickCallback: () => void 0,
};

const conversionConfig: { [ key: string ]: BlockifiedTemplateConfig } = {
	[ TYPES.productCatalog ]: blockifiedProductCatalogConfig,
	[ TYPES.productTaxonomy ]: blockifiedProductTaxonomyConfig,
	[ TYPES.singleProduct ]: blockifiedSingleProduct,
	[ TYPES.productSearchResults ]: blockifiedProductSearchResults,
	[ TYPES.orderConfirmation ]: blockifiedOrderConfirmation,
	fallback: blockifiedFallbackConfig,
};

const pickBlockClientIds = ( blocks: Array< BlockInstance > ) =>
	blocks.reduce< Array< string > >( ( acc, block ) => {
		if ( block.name === 'core/template-part' ) {
			return acc;
		}

		return [ ...acc, block.clientId ];
	}, [] );

const ConvertTemplate = ( { blockifyConfig, clientId, attributes } ) => {
	const { getButtonLabel, onClickCallback, getBlockifiedTemplate } =
		blockifyConfig;

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const { replaceBlock, selectBlock, replaceBlocks } =
		useDispatch( blockEditorStore );

	const { getBlocks } = useSelect( ( sel ) => {
		return {
			getBlocks: sel( blockEditorStore ).getBlocks,
		};
	}, [] );

	const { createInfoNotice } = useDispatch( noticesStore );

	return (
		<div className="wp-block-poocommerce-classic-template__placeholder-migration-button-container">
			<Button
				variant="primary"
				onClick={ () => {
					onClickCallback( {
						clientId,
						getBlocks,
						attributes,
						replaceBlock,
						selectBlock,
					} );
					createInfoNotice(
						__(
							'Template transformed into blocks!',
							'poocommerce'
						),
						{
							actions: [
								{
									label: __( 'Undo', 'poocommerce' ),
									onClick: () => {
										const clientIds = pickBlockClientIds(
											getBlocks()
										);

										replaceBlocks(
											clientIds,
											createBlock(
												'core/group',
												{
													layout: {
														inherit: true,
														type: 'constrained',
													},
												},
												[
													createBlock(
														'poocommerce/legacy-template',
														{
															template:
																attributes.template,
														}
													),
												]
											)
										);
									},
								},
							],
							type: 'snackbar',
						}
					);
				} }
				onMouseEnter={ () => setIsPopoverOpen( true ) }
				onMouseLeave={ () => setIsPopoverOpen( false ) }
				text={ getButtonLabel ? getButtonLabel() : '' }
			>
				{ isPopoverOpen && (
					<Popover resize={ false } placement="right-end">
						<div
							style={ {
								minWidth: '250px',
								width: '250px',
								maxWidth: '250px',
								minHeight: '300px',
								height: '300px',
								maxHeight: '300px',
								cursor: 'pointer',
							} }
						>
							<BlockPreview
								blocks={ getBlockifiedTemplate( {
									...attributes,
									isPreview: true,
								} ) }
								viewportWidth={ 1200 }
								additionalStyles={ [
									{
										css: 'body { padding: 20px !important; height: fit-content !important; overflow:hidden}',
									},
								] }
							/>
						</div>
					</Popover>
				) }
			</Button>
		</div>
	);
};

const Edit = ( {
	clientId,
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) => {
	const blockProps = useBlockProps();
	const { editedPostId } = useSelect( ( sel ) => {
		return {
			editedPostId: sel( 'core/edit-site' ).getEditedPostId(),
		};
	}, [] );

	const template = useEntityRecord< {
		slug: string;
		title: {
			rendered?: string;
			row: string;
		};
	} >( 'postType', 'wp_template', editedPostId );

	const templateDetails = getTemplateDetailsBySlug(
		attributes.template,
		TEMPLATES
	);
	const templateTitle =
		template.record?.title.rendered?.toLowerCase() ?? attributes.template;
	const templatePlaceholder = templateDetails?.placeholder ?? 'fallback';
	const templateType = templateDetails?.type ?? 'fallback';

	useEffect(
		() =>
			setAttributes( {
				template: attributes.template,
				align: attributes.align ?? 'wide',
			} ),
		[ attributes.align, attributes.template, setAttributes ]
	);

	const {
		isConversionPossible,
		getDescription,
		getSkeleton,
		blockifyConfig,
	} = conversionConfig[ templateType ];

	const skeleton = getSkeleton ? (
		getSkeleton()
	) : (
		<img
			className="wp-block-poocommerce-classic-template__placeholder-image"
			src={ `${ WC_BLOCKS_IMAGE_URL }template-placeholders/${ templatePlaceholder }.svg` }
			alt={ templateTitle }
		/>
	);

	const canConvert = isConversionPossible();
	const placeholderDescription = getDescription( templateTitle, canConvert );

	return (
		<div { ...blockProps }>
			<Placeholder className="wp-block-poocommerce-classic-template__placeholder">
				<div className="wp-block-poocommerce-classic-template__placeholder-wireframe">
					{ skeleton }
				</div>
				<div className="wp-block-poocommerce-classic-template__placeholder-copy">
					<div className="wp-block-poocommerce-classic-template__placeholder-copy__icon-container">
						<span className="woo-icon">
							<Icon icon={ woo } />{ ' ' }
							{ __( 'PooCommerce', 'poocommerce' ) }
						</span>
						<span>
							{ __(
								'Classic Template Placeholder',
								'poocommerce'
							) }
						</span>
					</div>
					<p
						dangerouslySetInnerHTML={ {
							__html: placeholderDescription,
						} }
					/>
					<p>
						{ __(
							'You cannot edit the content of this block. However, you can move it and place other blocks around it.',
							'poocommerce'
						) }
					</p>
					{ canConvert && blockifyConfig && (
						<ConvertTemplate
							clientId={ clientId }
							blockifyConfig={ blockifyConfig }
							attributes={ attributes }
						/>
					) }
				</div>
			</Placeholder>
		</div>
	);
};

const registerClassicTemplateBlock = ( {
	template,
	inserter,
}: {
	template?: string | null;
	inserter: boolean;
} ) => {
	/**
	 * The 'PooCommerce Legacy Template' block was renamed to 'PooCommerce Classic Template', however, the internal block
	 * name 'poocommerce/legacy-template' needs to remain the same. Otherwise, it would result in a corrupt block when
	 * loaded for users who have customized templates using the legacy-template (since the internal block name is
	 * stored in the database).
	 *
	 * See https://github.com/poocommerce/poocommerce-gutenberg-products-block/issues/5861 for more context
	 */
	registerBlockType( BLOCK_SLUG, {
		title:
			template && TEMPLATES[ template ]
				? TEMPLATES[ template ].title
				: __( 'PooCommerce Classic Template', 'poocommerce' ),
		icon: (
			<Icon
				icon={ box }
				className="wc-block-editor-components-block-icon"
			/>
		),
		category: 'poocommerce',
		apiVersion: 3,
		keywords: [ __( 'PooCommerce', 'poocommerce' ) ],
		description:
			template && TEMPLATES[ template ]
				? TEMPLATES[ template ].description
				: __(
						'Renders classic PooCommerce PHP templates.',
						'poocommerce'
				  ),
		supports: {
			align: [ 'wide', 'full' ],
			html: false,
			multiple: false,
			reusable: false,
			inserter,
		},
		attributes: {
			/**
			 * Template attribute is used to determine which core PHP template gets rendered.
			 */
			template: {
				type: 'string',
				default: 'any',
			},
			align: {
				type: 'string',
				default: 'wide',
			},
		},
		edit: ( {
			attributes,
			clientId,
			setAttributes,
		}: BlockEditProps< Attributes > ) => {
			const newTemplate = template ?? attributes.template;

			return (
				<Edit
					attributes={ {
						...attributes,
						template: newTemplate,
					} }
					setAttributes={ setAttributes }
					clientId={ clientId }
				/>
			);
		},
		save: () => null,
	} );
};

// @todo Refactor when there will be possible to show a block according on a template/post with a Gutenberg API. https://github.com/WordPress/gutenberg/pull/41718
let previousEditedTemplate: string | number | null = null;
let isBlockRegistered = false;
let isBlockInInserter = false;
const handleRegisterClassicTemplateBlock = ( {
	template,
	inserter,
}: {
	template: string | null;
	inserter: boolean;
} ) => {
	if ( isBlockRegistered ) {
		unregisterBlockType( BLOCK_SLUG );
	}
	isBlockInInserter = inserter;
	isBlockRegistered = true;
	registerClassicTemplateBlock( {
		template,
		inserter,
	} );
};

subscribe( () => {
	const editorStore = select( 'core/editor' );
	// We use blockCount to know if we are editing a template or in the navigation.
	const blockCount = editorStore?.getBlockCount() as number;
	const templateSlug = editorStore?.getEditedPostSlug() as string | null;
	const editedTemplate = blockCount && blockCount > 0 ? templateSlug : null;

	// Skip if we are in the same template, except if the block hasn't been registered yet.
	if ( isBlockRegistered && previousEditedTemplate === editedTemplate ) {
		return;
	}
	previousEditedTemplate = editedTemplate;

	// Handle the case when we are not editing a template (ie: in the navigation screen).
	if ( ! editedTemplate ) {
		if ( ! isBlockRegistered ) {
			handleRegisterClassicTemplateBlock( {
				template: editedTemplate,
				inserter: false,
			} );
		}
		return;
	}

	const templateSupportsClassicTemplateBlock =
		hasTemplateSupportForClassicTemplateBlock( editedTemplate, TEMPLATES );

	// Handle the case when we are editing a template that doesn't support the Classic Template block (ie: Blog Home).
	if ( ! templateSupportsClassicTemplateBlock && isBlockInInserter ) {
		handleRegisterClassicTemplateBlock( {
			template: editedTemplate,
			inserter: false,
		} );
		return;
	}

	// Handle the case when we are editing a template that does support the Classic Template block (ie: Product Catalog).
	if ( templateSupportsClassicTemplateBlock && ! isBlockInInserter ) {
		handleRegisterClassicTemplateBlock( {
			template: editedTemplate,
			inserter: true,
		} );
		return;
	}

	// Handle the case when we are editing a template that does support the Classic Template block but it's currently registered with another title (ie: navigating from the Product Catalog template to the Product Search Results template).
	if (
		templateSupportsClassicTemplateBlock &&
		isClassicTemplateBlockRegisteredWithAnotherTitle(
			getBlockType( BLOCK_SLUG ),
			editedTemplate
		)
	) {
		handleRegisterClassicTemplateBlock( {
			template: editedTemplate,
			inserter: true,
		} );
	}
}, 'core/blocks-editor' );
