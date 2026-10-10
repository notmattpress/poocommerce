/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import GridContentControl from '@poocommerce/editor-components/grid-content-control';
import GridLayoutControl from '@poocommerce/editor-components/grid-layout-control';
import ProductCategoryControl from '@poocommerce/editor-components/product-category-control';
import ProductOrderbyControl from '@poocommerce/editor-components/product-orderby-control';
import ProductStockControl from '@poocommerce/editor-components/product-stock-control';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { Attributes } from './types';

interface ProductOnSaleInspectorControlsProps {
	attributes: Attributes;
	setAttributes: ( attributes: Record< string, unknown > ) => void;
}

export const ProductOnSaleInspectorControls = (
	props: ProductOnSaleInspectorControlsProps
) => {
	const { attributes, setAttributes } = props;
	const {
		categories,
		catOperator,
		columns,
		contentVisibility,
		rows,
		orderby,
		alignButtons,
		stockStatus,
	} = attributes;

	return (
		<InspectorControls key="inspector">
			<PanelBody title={ __( 'Layout', 'poocommerce' ) } initialOpen>
				<GridLayoutControl
					columns={ columns }
					rows={ rows }
					alignButtons={ alignButtons }
					setAttributes={ setAttributes }
					minColumns={ getSetting< number >( 'minColumns', 1 ) }
					maxColumns={ getSetting< number >( 'maxColumns', 6 ) }
					minRows={ getSetting< number >( 'minRows', 1 ) }
					maxRows={ getSetting< number >( 'maxRows', 6 ) }
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
				title={ __( 'Order By', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductOrderbyControl
					setAttributes={ setAttributes }
					value={ orderby }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Filter by Product Category', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductCategoryControl
					selected={ categories }
					onChange={ ( value = [] ) => {
						const ids = value.map( ( { id } ) => id );
						setAttributes( { categories: ids } );
					} }
					operator={ catOperator }
					onOperatorChange={ ( value = 'any' ) =>
						setAttributes( { catOperator: value } )
					}
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
