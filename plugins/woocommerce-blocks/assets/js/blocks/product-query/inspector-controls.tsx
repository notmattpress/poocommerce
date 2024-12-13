/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { type ElementType } from '@wordpress/element';
import { ProductQueryFeedbackPrompt } from '@poocommerce/editor-components/feedback-prompt';
import { EditorBlock, isNumber } from '@poocommerce/types';
import { usePrevious } from '@poocommerce/base-hooks';
import {
	manualUpdate,
	MANUAL_REPLACE_PRODUCTS_WITH_PRODUCT_COLLECTION,
} from '@poocommerce/blocks/migration-products-to-product-collection';
import { getSettingWithCoercion } from '@poocommerce/settings';
import { ProductQueryBlockQuery } from '@poocommerce/blocks/product-query/types';
import {
	FormTokenField,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	ProductQueryArguments,
	ProductQueryBlock,
	QueryBlockAttributes,
} from './types';
import {
	isCustomInheritGlobalQueryImplementationEnabled,
	isWooQueryBlockVariation,
	isRelatedProducts,
	setQueryAttribute,
	useAllowedControls,
} from './utils';
import {
	ALL_PRODUCT_QUERY_CONTROLS,
	QUERY_DEFAULT_ATTRIBUTES,
	QUERY_LOOP_ID,
	STOCK_STATUS_OPTIONS,
} from './constants';
import { AttributesFilter } from './inspector-controls/attributes-filter';
import { PopularPresets } from './inspector-controls/popular-presets';
import { ProductSelector } from './inspector-controls/product-selector';
import { UpgradeNotice } from './inspector-controls/upgrade-notice';

import './editor.scss';

const NAMESPACED_CONTROLS = ALL_PRODUCT_QUERY_CONTROLS.map(
	( id ) =>
		`__poocommerce${ id[ 0 ].toUpperCase() }${ id.slice(
			1
		) }` as keyof ProductQueryArguments
);

function useDefaultWooQueryParamsForVariation(
	variationName: string | undefined
): Partial< ProductQueryArguments > {
	const variationAttributes: QueryBlockAttributes = useSelect(
		( select ) =>
			select( 'core/blocks' )
				.getBlockVariations( QUERY_LOOP_ID )
				.find(
					( variation: ProductQueryBlock ) =>
						variation.name === variationName
				)?.attributes
	);

	return variationAttributes
		? Object.assign(
				{},
				...NAMESPACED_CONTROLS.map( ( key ) => ( {
					[ key ]: variationAttributes.query[ key ],
				} ) )
		  )
		: {};
}

/**
 * Gets the id of a specific stock status from its text label
 *
 * In theory, we could use a `saveTransform` function on the
 * `FormFieldToken` component to do the conversion. However, plugins
 * can add custom stock statii which don't conform to our naming
 * conventions.
 */
function getStockStatusIdByLabel( statusLabel: FormTokenField.Value ) {
	const label =
		typeof statusLabel === 'string' ? statusLabel : statusLabel.value;

	return Object.entries( STOCK_STATUS_OPTIONS ).find(
		( [ , value ] ) => value === label
	)?.[ 0 ];
}

export const WooInheritToggleControl = (
	props: ProductQueryBlock & {
		defaultWooQueryParams: Partial< ProductQueryArguments >;
	}
) => {
	const queryObjectBeforeInheritEnabled = usePrevious(
		props.attributes.query,
		( value ) => {
			return value.inherit === false;
		}
	);

	return (
		<ToggleControl
			className="woo-inherit-query-toggle"
			label={ __( 'Inherit query from template', 'poocommerce' ) }
			help={ __(
				'Toggle to use the global query context that is set with the current template, such as variations of the product catalog or search. Disable to customize the filtering independently.',
				'poocommerce'
			) }
			checked={
				isCustomInheritGlobalQueryImplementationEnabled
					? props.attributes.query.__poocommerceInherit || false
					: props.attributes.query.inherit || false
			}
			onChange={ ( inherit ) => {
				const inheritQuery: Partial< ProductQueryBlockQuery > = {
					inherit,
				};

				if ( inherit ) {
					inheritQuery.perPage = getSettingWithCoercion(
						'loopShopPerPage',
						12,
						isNumber
					);
				}

				if ( isCustomInheritGlobalQueryImplementationEnabled ) {
					return setQueryAttribute( props, {
						...QUERY_DEFAULT_ATTRIBUTES.query,
						__poocommerceInherit: inherit,
						// Restore the query object value before inherit was enabled.
						...( inherit === false && {
							...queryObjectBeforeInheritEnabled,
						} ),
					} );
				}

				setQueryAttribute( props, {
					...props.defaultWooQueryParams,
					...inheritQuery,
					// Restore the query object value before inherit was enabled.
					...( inherit === false && {
						...queryObjectBeforeInheritEnabled,
					} ),
				} );
			} }
		/>
	);
};

export const TOOLS_PANEL_CONTROLS = {
	attributes: AttributesFilter,
	onSale: ( props: ProductQueryBlock ) => {
		const { query } = props.attributes;

		return (
			<ToolsPanelItem
				label={ __( 'Sale status', 'poocommerce' ) }
				hasValue={ () => query.__poocommerceOnSale }
			>
				<ToggleControl
					label={ __( 'Show only products on sale', 'poocommerce' ) }
					checked={ query.__poocommerceOnSale || false }
					onChange={ ( __poocommerceOnSale ) => {
						setQueryAttribute( props, {
							__poocommerceOnSale,
						} );
					} }
				/>
			</ToolsPanelItem>
		);
	},
	productSelector: ProductSelector,
	stockStatus: ( props: ProductQueryBlock ) => {
		const { query } = props.attributes;

		return (
			<ToolsPanelItem
				label={ __( 'Stock status', 'poocommerce' ) }
				hasValue={ () => query.__poocommerceStockStatus }
			>
				<FormTokenField
					label={ __( 'Stock status', 'poocommerce' ) }
					onChange={ ( statusLabels ) => {
						const __poocommerceStockStatus = statusLabels
							.map( getStockStatusIdByLabel )
							.filter( Boolean ) as string[];

						setQueryAttribute( props, {
							__poocommerceStockStatus,
						} );
					} }
					suggestions={ Object.values( STOCK_STATUS_OPTIONS ) }
					validateInput={ ( value: string ) =>
						Object.values( STOCK_STATUS_OPTIONS ).includes( value )
					}
					value={
						query?.__poocommerceStockStatus?.map(
							( key ) => STOCK_STATUS_OPTIONS[ key ]
						) || []
					}
					__experimentalExpandOnFocus={ true }
				/>
			</ToolsPanelItem>
		);
	},
	wooInherit: WooInheritToggleControl,
};

const ProductQueryControls = ( props: ProductQueryBlock ) => {
	const allowedControls = useAllowedControls( props.attributes );
	const defaultWooQueryParams = useDefaultWooQueryParamsForVariation(
		props.attributes.namespace
	);

	const isProductsBlock = ! isRelatedProducts( props );

	return (
		<>
			<InspectorControls>
				{ isProductsBlock &&
					MANUAL_REPLACE_PRODUCTS_WITH_PRODUCT_COLLECTION && (
						<UpgradeNotice upgradeBlock={ manualUpdate } />
					) }
				{ allowedControls?.includes( 'presets' ) && (
					<PopularPresets { ...props } />
				) }
				{ isProductsBlock && (
					<ToolsPanel
						className="poocommerce-product-query-toolspanel"
						label={ __( 'Advanced Filters', 'poocommerce' ) }
						resetAll={ () => {
							setQueryAttribute( props, defaultWooQueryParams );
						} }
					>
						{ Object.entries( TOOLS_PANEL_CONTROLS ).map(
							( [ key, Control ] ) =>
								allowedControls?.includes( key ) ? (
									<Control
										{ ...props }
										defaultWooQueryParams={
											defaultWooQueryParams
										}
										key={ key }
									/>
								) : null
						) }
					</ToolsPanel>
				) }
			</InspectorControls>
		</>
	);
};

export const withProductQueryControls =
	< T extends EditorBlock< T > >( BlockEdit: ElementType ) =>
	( props: ProductQueryBlock ) => {
		return isWooQueryBlockVariation( props ) ? (
			<>
				<ProductQueryControls { ...props } />
				<BlockEdit { ...props } />
				<InspectorControls>
					<ProductQueryFeedbackPrompt />
				</InspectorControls>
			</>
		) : (
			<BlockEdit { ...props } />
		);
	};

addFilter( 'editor.BlockEdit', QUERY_LOOP_ID, withProductQueryControls );
