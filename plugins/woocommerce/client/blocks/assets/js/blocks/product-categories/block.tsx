/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import { Icon, listView } from '@wordpress/icons';
import { isSiteEditorPage, isWidgetEditorPage } from '@poocommerce/utils';
import { useSelect } from '@wordpress/data';
import {
	Disabled,
	PanelBody,
	ToggleControl,
	Placeholder,

	// @ts-expect-error - no types.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,

	// @ts-expect-error - no types.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
/**
 * Internal dependencies
 */
import type { ProductCategoriesBlockProps } from './types';

const EmptyPlaceholder = () => (
	<Placeholder
		icon={ <Icon icon={ listView } /> }
		label={ __( 'Product Categories List', 'poocommerce' ) }
		className="wc-block-product-categories"
	>
		{ __(
			'This block displays the product categories for your store. To use it you first need to create a product and assign it to a category.',
			'poocommerce'
		) }
	</Placeholder>
);

/**
 * Component displaying the categories as dropdown or list.
 *
 * @param {Object}            props               Incoming props for the component.
 * @param {Object}            props.attributes    Incoming block attributes.
 * @param {function(any):any} props.setAttributes Setter for block attributes.
 * @param {string}            props.name          Name for block.
 */
const ProductCategoriesBlock = ( {
	attributes,
	setAttributes,
	name,
}: ProductCategoriesBlockProps ) => {
	const editSiteStore = useSelect( ( select ) => select( 'core/edit-site' ) );
	const editWidgetStore = useSelect( ( select ) =>
		select( 'core/edit-widgets' )
	);
	const isSiteEditor = isSiteEditorPage( editSiteStore );
	const isWidgetEditor = isWidgetEditorPage( editWidgetStore );
	const getInspectorControls = () => {
		const {
			hasCount,
			hasImage,
			hasEmpty,
			isDropdown,
			isHierarchical,
			showChildrenOnly,
		} = attributes;

		return (
			<InspectorControls key="inspector">
				<PanelBody
					title={ __( 'List Settings', 'poocommerce' ) }
					initialOpen
				>
					<ToggleGroupControl
						label={ __( 'Display style', 'poocommerce' ) }
						isBlock
						value={ isDropdown ? 'dropdown' : 'list' }
						onChange={ ( value: string ) =>
							setAttributes( {
								isDropdown: value === 'dropdown',
							} )
						}
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
				</PanelBody>
				<PanelBody title={ __( 'Content', 'poocommerce' ) } initialOpen>
					<ToggleControl
						label={ __( 'Show product count', 'poocommerce' ) }
						checked={ hasCount }
						onChange={ () =>
							setAttributes( { hasCount: ! hasCount } )
						}
					/>
					{ ! isDropdown && (
						<ToggleControl
							label={ __(
								'Show category images',
								'poocommerce'
							) }
							help={
								hasImage
									? __(
											'Category images are visible.',
											'poocommerce'
									  )
									: __(
											'Category images are hidden.',
											'poocommerce'
									  )
							}
							checked={ hasImage }
							onChange={ () =>
								setAttributes( { hasImage: ! hasImage } )
							}
						/>
					) }
					<ToggleControl
						label={ __( 'Show hierarchy', 'poocommerce' ) }
						checked={ isHierarchical }
						onChange={ () =>
							setAttributes( {
								isHierarchical: ! isHierarchical,
							} )
						}
					/>
					<ToggleControl
						label={ __( 'Show empty categories', 'poocommerce' ) }
						checked={ hasEmpty }
						onChange={ () =>
							setAttributes( { hasEmpty: ! hasEmpty } )
						}
					/>
					{ ( isSiteEditor || isWidgetEditor ) && (
						<ToggleControl
							label={ __(
								'Only show children of current category',
								'poocommerce'
							) }
							help={ __(
								'This will affect product category pages',
								'poocommerce'
							) }
							checked={ showChildrenOnly }
							onChange={ () =>
								setAttributes( {
									showChildrenOnly: ! showChildrenOnly,
								} )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>
		);
	};

	const blockProps = useBlockProps( {
		className: 'wc-block-product-categories',
	} );

	return (
		<div { ...blockProps }>
			{ getInspectorControls() }
			<Disabled>
				<ServerSideRender
					block={ name }
					attributes={ attributes }
					EmptyResponsePlaceholder={ EmptyPlaceholder }
				/>
			</Disabled>
		</div>
	);
};

export default ProductCategoriesBlock;
