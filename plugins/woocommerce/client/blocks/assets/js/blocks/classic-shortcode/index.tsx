/**
 * External dependencies
 */
import {
	BlockInstance,
	createBlock,
	registerBlockType,
} from '@wordpress/blocks';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	useBlockProps,
	BlockPreview,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Button,
	Placeholder,
	Popover,
	ExternalLink,
	TabbableContainer,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { shortcode, Icon } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, createInterpolateElement } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { findBlock } from '@poocommerce/utils';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { CartPlaceholder, CheckoutPlaceholder } from './placeholder';
import { TEMPLATES, TYPES } from './constants';
import { getTemplateDetailsBySlug } from './utils';
import * as blockifiedCheckout from './checkout';
import * as blockifiedCart from './cart';
import metadata from './block.json';
import type { BlockifiedTemplateConfig } from './types';

type Attributes = {
	shortcode: string;
	align: string;
};

const blockifiedFallbackConfig = {
	getBlockifiedTemplate: () => [],
	getDescription: () => '',
	onClickCallback: () => void 0,
};

const conversionConfig: { [ key: string ]: BlockifiedTemplateConfig } = {
	[ TYPES.cart ]: blockifiedCart,
	[ TYPES.checkout ]: blockifiedCheckout,
	fallback: blockifiedFallbackConfig,
};

const ConvertTemplate = ( { blockifyConfig, clientId, attributes } ) => {
	const { getButtonLabel, onClickCallback, getBlockifiedTemplate } =
		blockifyConfig;

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const { replaceBlock, selectBlock } = useDispatch( blockEditorStore );
	const { createInfoNotice } = useDispatch( noticesStore );

	const { getBlocks } = useSelect( ( sel ) => {
		return {
			getBlocks: sel( blockEditorStore ).getBlocks,
		};
	}, [] );

	return (
		<TabbableContainer className="wp-block-poocommerce-classic-shortcode__placeholder-migration-button-container">
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
							'Classic shortcode transformed to blocks.',
							'poocommerce'
						),
						{
							actions: [
								{
									label: __( 'Undo', 'poocommerce' ),
									onClick: () => {
										const targetBlocks = [
											'poocommerce/cart',
											'poocommerce/checkout',
										];
										const cartCheckoutBlock = findBlock( {
											blocks: getBlocks(),
											findCondition: (
												foundBlock: BlockInstance
											) =>
												targetBlocks.includes(
													foundBlock.name
												),
										} );
										if ( ! cartCheckoutBlock ) {
											return;
										}
										replaceBlock(
											cartCheckoutBlock.clientId,
											createBlock(
												'poocommerce/classic-shortcode',
												{
													shortcode:
														attributes.shortcode,
												}
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
				tabIndex={ 0 }
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
			<Button
				variant="secondary"
				href="https://poocommerce.com/document/poocommerce-store-editing/customizing-cart-and-checkout/"
				target="_blank"
				tabIndex={ 0 }
			>
				{ __( 'Learn more', 'poocommerce' ) }
			</Button>
		</TabbableContainer>
	);
};
const Edit = ( { clientId, attributes }: BlockEditProps< Attributes > ) => {
	const blockProps = useBlockProps();

	const templateDetails = getTemplateDetailsBySlug(
		attributes.shortcode,
		TEMPLATES
	);
	const templateTitle = attributes.shortcode;
	const templatePlaceholder = templateDetails?.placeholder ?? 'cart';
	const templateType = templateDetails?.type ?? 'fallback';

	const { getDescription, getTitle, blockifyConfig } =
		conversionConfig[ templateType ];

	const canConvert = !! templateDetails?.type;
	const placeholderTitle = getTitle
		? getTitle()
		: __( 'Classic Shortcode Placeholder', 'poocommerce' );
	const placeholderDescription = getDescription( templateTitle );

	const learnMoreContent = createInterpolateElement(
		__(
			'You can learn more about the benefits of switching to blocks, compatibility with extensions, and how to switch back to shortcodes <a>in our documentation</a>.',
			'poocommerce'
		),
		{
			a: (
				// Suppress the warning as this <a> will be interpolated into the string with content.
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				<ExternalLink href="https://poocommerce.com/document/poocommerce-store-editing/customizing-cart-and-checkout/" />
			),
		}
	);

	return (
		<div { ...blockProps }>
			<Placeholder className="wp-block-poocommerce-classic-shortcode__placeholder">
				<div className="wp-block-poocommerce-classic-shortcode__placeholder-wireframe">
					{ templatePlaceholder === 'cart' ? (
						<CartPlaceholder />
					) : (
						<CheckoutPlaceholder />
					) }
				</div>
				<div className="wp-block-poocommerce-classic-shortcode__placeholder-copy">
					<div className="wp-block-poocommerce-classic-shortcode__placeholder-copy__icon-container">
						<h1>{ __( 'PooCommerce', 'poocommerce' ) }</h1>
						<span>{ placeholderTitle }</span>
					</div>
					{ canConvert && <p>{ placeholderDescription }</p> }
					<p>{ learnMoreContent }</p>
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

const settings = {
	icon: (
		<Icon
			icon={ shortcode }
			className="wc-block-editor-components-block-icon"
		/>
	),
	edit: ( {
		attributes,
		clientId,
		setAttributes,
	}: BlockEditProps< Attributes > ) => {
		return (
			<Edit
				attributes={ attributes }
				setAttributes={ setAttributes }
				clientId={ clientId }
			/>
		);
	},
	save: () => null,
	variations: [
		{
			name: 'checkout',
			title: __( 'Classic Checkout', 'poocommerce' ),
			attributes: {
				shortcode: 'checkout',
			},
			isActive: ( blockAttributes, variationAttributes ) =>
				blockAttributes.shortcode === variationAttributes.shortcode,
			scope: [ 'inserter' ],
		},
		{
			name: 'cart',
			title: __( 'Classic Cart', 'poocommerce' ),
			attributes: {
				shortcode: 'cart',
			},
			isActive: ( blockAttributes, variationAttributes ) =>
				blockAttributes.shortcode === variationAttributes.shortcode,
			scope: [ 'inserter' ],
			isDefault: true,
		},
	],
	apiVersion: 3,
};

registerBlockType( metadata, settings );
