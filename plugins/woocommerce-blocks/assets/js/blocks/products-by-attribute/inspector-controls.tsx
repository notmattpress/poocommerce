/**
 * External dependencies
 */
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import GridLayoutControl from '@poocommerce/editor-components/grid-layout-control';
import { getSetting } from '@poocommerce/settings';
import GridContentControl from '@poocommerce/editor-components/grid-content-control';
import ProductAttributeTermControl from '@poocommerce/editor-components/product-attribute-term-control';
import ProductOrderbyControl from '@poocommerce/editor-components/product-orderby-control';
import ProductStockControl from '@poocommerce/editor-components/product-stock-control';
import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { Props } from './types';

export const ProductsByAttributeInspectorControls = (
	props: Props
): JSX.Element => {
	const { setAttributes } = props;
	const {
		attributes,
		attrOperator,
		columns,
		contentVisibility,
		orderby,
		rows,
		alignButtons,
		stockStatus,
	} = props.attributes;

	return (
		<InspectorControls key="inspector">
			<PanelBody title={ __( 'Layout', 'poocommerce' ) } initialOpen>
				<GridLayoutControl
					columns={ columns }
					rows={ rows }
					alignButtons={ alignButtons }
					setAttributes={ setAttributes }
					minColumns={ getSetting( 'minColumns', 1 ) }
					maxColumns={ getSetting( 'maxColumns', 6 ) }
					minRows={ getSetting( 'minRows', 1 ) }
					maxRows={ getSetting( 'maxRows', 6 ) }
				/>
			</PanelBody>
			<PanelBody title={ __( 'Content', 'poocommerce' ) } initialOpen>
				<GridContentControl
					settings={ contentVisibility }
					onChange={ ( value ) =>
						setAttributes( { contentVisibility: value } )
					}
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Filter by Product Attribute', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductAttributeTermControl
					selected={ attributes }
					onChange={ ( value = [] ) => {
						const result = value.map(
							( { id, value: attributeSlug } ) => ( {
								id,
								attr_slug: attributeSlug,
							} )
						);
						setAttributes( { attributes: result } );
					} }
					operator={ attrOperator }
					onOperatorChange={ ( value = 'any' ) =>
						setAttributes( { attrOperator: value } )
					}
					isCompact={ true }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Order By', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductOrderbyControl
					setAttributes={ setAttributes }
					value={ orderby }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Filter by stock status', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductStockControl
					setAttributes={ setAttributes }
					value={ stockStatus }
				/>
			</PanelBody>
		</InspectorControls>
	);
};
