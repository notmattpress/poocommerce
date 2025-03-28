/**
 * External dependencies
 */
import { sort } from 'fast-sort';
import { __, sprintf, _n, _x } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	InspectorControls,
	BlockControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { Icon, category, external } from '@wordpress/icons';
import { SearchListControl } from '@poocommerce/editor-components/search-list-control';
import { getAdminLink, getSetting } from '@poocommerce/settings';
import BlockTitle from '@poocommerce/editor-components/block-title';
import clsx from 'clsx';
import { SearchListItem } from '@poocommerce/editor-components/search-list-control/types';
import { AttributeSetting } from '@poocommerce/types';
import {
	Placeholder,
	Disabled,
	PanelBody,
	ToggleControl,
	Button,
	ToolbarGroup,
	Notice,
	withSpokenMessages,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import Block from './block';
import './editor.scss';
import type { EditProps, GetNotice } from './types';
import { UpgradeNotice } from '../filter-wrapper/upgrade';

const ATTRIBUTES = getSetting< AttributeSetting[] >( 'attributes', [] );

const noticeContent = {
	noAttributes: __(
		'Please select an attribute to use this filter!',
		'poocommerce'
	),
	noProducts: __(
		'There are no products with the selected attributes.',
		'poocommerce'
	),
};

const getNotice: GetNotice = ( type ) => {
	const content = noticeContent[ type ];
	return content ? (
		<Notice status="warning" isDismissible={ false }>
			<p>{ content }</p>
		</Notice>
	) : null;
};

const Edit = ( {
	attributes,
	setAttributes,
	debouncedSpeak,
	clientId,
}: EditProps ) => {
	const {
		attributeId,
		displayStyle,
		heading,
		headingLevel,
		isPreview,
		queryType,
		showCounts,
		showFilterButton,
		selectType,
	} = attributes;

	const [ isEditing, setIsEditing ] = useState(
		! attributeId && ! isPreview
	);

	const blockProps = useBlockProps();

	const getBlockControls = () => {
		return (
			<BlockControls>
				<ToolbarGroup
					controls={ [
						{
							icon: 'edit',
							title: __( 'Edit', 'poocommerce' ),
							onClick: () => setIsEditing( ! isEditing ),
							isActive: isEditing,
						},
					] }
				/>
			</BlockControls>
		);
	};

	const onChange = ( selected: SearchListItem[] ) => {
		if ( ! selected || ! selected.length ) {
			return;
		}

		const selectedId = selected[ 0 ].id;
		const productAttribute = ATTRIBUTES.find(
			( attribute ) => attribute.attribute_id === selectedId.toString()
		);

		if ( ! productAttribute || attributeId === selectedId ) {
			return;
		}

		setAttributes( {
			attributeId: selectedId as number,
		} );
	};

	const renderAttributeControl = ( {
		isCompact,
	}: {
		isCompact: boolean;
	} ) => {
		const messages = {
			clear: __( 'Clear selected attribute', 'poocommerce' ),
			list: __( 'Product Attributes', 'poocommerce' ),
			noItems: __(
				"Your store doesn't have any product attributes.",
				'poocommerce'
			),
			search: __( 'Search for a product attribute:', 'poocommerce' ),
			selected: ( n: number ) =>
				sprintf(
					/* translators: %d is the number of attributes selected. */
					_n(
						'%d attribute selected',
						'%d attributes selected',
						n,
						'poocommerce'
					),
					n
				),
			updated: __(
				'Product attribute search results updated.',
				'poocommerce'
			),
		};

		const list = sort(
			ATTRIBUTES.map( ( item ) => {
				return {
					id: parseInt( item.attribute_id, 10 ),
					name: item.attribute_label,
				};
			} )
		).asc( 'name' );

		return (
			<SearchListControl
				className="poocommerce-product-attributes"
				list={ list }
				selected={ list.filter( ( { id } ) => id === attributeId ) }
				onChange={ onChange }
				messages={ messages }
				isSingle
				isCompact={ isCompact }
			/>
		);
	};

	const getInspectorControls = () => {
		return (
			<InspectorControls key="inspector">
				<PanelBody>
					<UpgradeNotice clientId={ clientId } />
				</PanelBody>
				<PanelBody title={ __( 'Display Settings', 'poocommerce' ) }>
					<ToggleControl
						label={ __( 'Display product count', 'poocommerce' ) }
						checked={ showCounts }
						onChange={ () =>
							setAttributes( {
								showCounts: ! showCounts,
							} )
						}
					/>
					<ToggleGroupControl
						label={ __(
							'Allow selecting multiple options?',
							'poocommerce'
						) }
						isBlock
						value={ selectType || 'multiple' }
						onChange={ ( value: string ) =>
							setAttributes( {
								selectType: value,
							} )
						}
						className="wc-block-attribute-filter__multiple-toggle"
					>
						<ToggleGroupControlOption
							value="multiple"
							label={ _x(
								'Multiple',
								'Number of filters',
								'poocommerce'
							) }
						/>
						<ToggleGroupControlOption
							value="single"
							label={ _x(
								'Single',
								'Number of filters',
								'poocommerce'
							) }
						/>
					</ToggleGroupControl>
					{ selectType === 'multiple' && (
						<ToggleGroupControl
							label={ __( 'Filter Conditions', 'poocommerce' ) }
							isBlock
							help={
								queryType === 'and'
									? __(
											'Choose to return filter results for all of the attributes selected.',
											'poocommerce'
									  )
									: __(
											'Choose to return filter results for any of the attributes selected.',
											'poocommerce'
									  )
							}
							value={ queryType }
							onChange={ ( value: string ) =>
								setAttributes( {
									queryType: value,
								} )
							}
							className="wc-block-attribute-filter__conditions-toggle"
						>
							<ToggleGroupControlOption
								value="or"
								label={ __( 'Any', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value="and"
								label={ __( 'All', 'poocommerce' ) }
							/>
						</ToggleGroupControl>
					) }
					<ToggleGroupControl
						label={ __( 'Display Style', 'poocommerce' ) }
						isBlock
						value={ displayStyle }
						onChange={ ( value: string ) =>
							setAttributes( {
								displayStyle: value,
							} )
						}
						className="wc-block-attribute-filter__display-toggle"
					>
						<ToggleGroupControlOption
							value="list"
							label={ __( 'List', 'poocommerce' ) }
						/>
						<ToggleGroupControlOption
							value="dropdown"
							label={ __( 'Dropdown', 'poocommerce' ) }
						/>
					</ToggleGroupControl>
					<ToggleControl
						label={ __(
							"Show 'Apply filters' button",
							'poocommerce'
						) }
						help={ __(
							'Products will update when the button is clicked.',
							'poocommerce'
						) }
						checked={ showFilterButton }
						onChange={ ( value ) =>
							setAttributes( {
								showFilterButton: value,
							} )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Content Settings', 'poocommerce' ) }
					initialOpen={ false }
				>
					{ renderAttributeControl( { isCompact: true } ) }
				</PanelBody>
			</InspectorControls>
		);
	};

	const noAttributesPlaceholder = () => (
		<Placeholder
			className="wc-block-attribute-filter"
			icon={ <Icon icon={ category } /> }
			label={ __( 'Filter by Attribute', 'poocommerce' ) }
			instructions={ __(
				'Display a list of filters based on the selected attributes.',
				'poocommerce'
			) }
		>
			<p>
				{ __(
					"Attributes are needed for filtering your products. You haven't created any attributes yet.",
					'poocommerce'
				) }
			</p>
			<Button
				className="wc-block-attribute-filter__add-attribute-button"
				variant="secondary"
				href={ getAdminLink(
					'edit.php?post_type=product&page=product_attributes'
				) }
				target="_top"
			>
				{ __( 'Add new attribute', 'poocommerce' ) + ' ' }
				<Icon icon={ external } />
			</Button>
			<Button
				className="wc-block-attribute-filter__read_more_button"
				variant="tertiary"
				href="https://poocommerce.com/document/managing-product-taxonomies/"
				target="_blank"
			>
				{ __( 'Learn more', 'poocommerce' ) }
			</Button>
		</Placeholder>
	);

	const onDone = () => {
		setIsEditing( false );
		debouncedSpeak(
			__(
				'Now displaying a preview of the Filter Products by Attribute block.',
				'poocommerce'
			)
		);
	};

	const renderEditMode = () => {
		return (
			<Placeholder
				className="wc-block-attribute-filter"
				icon={ <Icon icon={ category } /> }
				label={ __( 'Filter by Attribute', 'poocommerce' ) }
			>
				<div className="wc-block-attribute-filter__instructions">
					{ __(
						'Display a list of filters based on the selected attributes.',
						'poocommerce'
					) }
				</div>
				<div className="wc-block-attribute-filter__selection">
					{ renderAttributeControl( { isCompact: false } ) }
					<Button variant="primary" onClick={ onDone }>
						{ __( 'Done', 'poocommerce' ) }
					</Button>
				</div>
			</Placeholder>
		);
	};

	return Object.keys( ATTRIBUTES ).length === 0 ? (
		noAttributesPlaceholder()
	) : (
		<div { ...blockProps }>
			{ getBlockControls() }
			{ getInspectorControls() }
			{ isEditing ? (
				renderEditMode()
			) : (
				<div className={ clsx( 'wc-block-attribute-filter' ) }>
					{ heading && (
						<BlockTitle
							className="wc-block-attribute-filter__title"
							headingLevel={ headingLevel }
							heading={ heading }
							onChange={ ( value: string ) =>
								setAttributes( { heading: value } )
							}
						/>
					) }
					<Disabled>
						<Block
							attributes={ attributes }
							isEditor={ true }
							getNotice={ getNotice }
						/>
					</Disabled>
				</div>
			) }
		</div>
	);
};

export default withSpokenMessages( Edit );
