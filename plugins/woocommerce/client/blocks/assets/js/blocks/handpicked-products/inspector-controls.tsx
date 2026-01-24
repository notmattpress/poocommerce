/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
import GridContentControl from '@poocommerce/editor-components/grid-content-control';
import ProductOrderbyControl from '@poocommerce/editor-components/product-orderby-control';
import ProductsControl from '@poocommerce/editor-components/products-control';

/**
 * Internal dependencies
 */
import { Props } from './types';

export const HandpickedProductsInspectorControls = (
	props: Props
): JSX.Element => {
	const { attributes, setAttributes } = props;
	const { columns, contentVisibility, orderby, alignButtons } = attributes;

	return (
		<InspectorControls key="inspector">
			<PanelBody title={ __( 'Layout', 'poocommerce' ) } initialOpen>
				<RangeControl
					label={ __( 'Columns', 'poocommerce' ) }
					value={ columns }
					onChange={ ( value ) =>
						setAttributes( { columns: value } )
					}
					min={ getSetting( 'minColumns', 1 ) }
					max={ getSetting( 'maxColumns', 6 ) }
				/>
				<ToggleControl
					label={ __( 'Align Buttons', 'poocommerce' ) }
					help={
						alignButtons
							? __(
									'Buttons are aligned vertically.',
									'poocommerce'
							  )
							: __( 'Buttons follow content.', 'poocommerce' )
					}
					checked={ alignButtons }
					onChange={ () =>
						setAttributes( { alignButtons: ! alignButtons } )
					}
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
				title={ __( 'Products', 'poocommerce' ) }
				initialOpen={ false }
			>
				<ProductsControl
					selected={ attributes.products }
					onChange={ ( value = [] ) => {
						const ids = value.map( ( { id } ) => id );
						setAttributes( { products: ids } );
					} }
					isCompact={ true }
				/>
			</PanelBody>
		</InspectorControls>
	);
};
