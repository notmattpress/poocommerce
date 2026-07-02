/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Disabled, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import GridContentControl from '@poocommerce/editor-components/grid-content-control';
import GridLayoutControl from '@poocommerce/editor-components/grid-layout-control';
import ProductCategoryControl from '@poocommerce/editor-components/product-category-control';
import ProductStockControl from '@poocommerce/editor-components/product-stock-control';
import { gridBlockPreview } from '@poocommerce/resource-previews';
import { getSetting } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import { Props } from './types';
/**
 * Component to handle edit mode of "Top Rated Products".
 */
export const ProductTopRatedBlock = ( {
	attributes,
	name,
	setAttributes,
}: Props ): JSX.Element => {
	const {
		categories,
		catOperator,
		columns,
		contentVisibility,
		rows,
		alignButtons,
		stockStatus,
		isPreview,
	} = attributes;

	const getInspectorControls = () => {
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

	if ( isPreview ) {
		return gridBlockPreview;
	}

	return (
		<>
			{ getInspectorControls() }
			<Disabled>
				<ServerSideRender block={ name } attributes={ attributes } />
			</Disabled>
		</>
	);
};

export default ProductTopRatedBlock;
