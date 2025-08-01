/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * External dependencies
 */
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { formatPrice } from '@poocommerce/price-format';
import {
	PanelBody,
	ExternalLink,
	ToggleControl,
	BaseControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControl as ToggleGroupControl,
	RadioControl,
} from '@wordpress/components';
import { getSetting } from '@poocommerce/settings';
import { __, isRTL } from '@wordpress/i18n';
import Noninteractive from '@poocommerce/base-components/noninteractive';
import { isSiteEditorPage } from '@poocommerce/utils';
import type { ReactElement } from 'react';
import { useRef } from '@wordpress/element';
import { select } from '@wordpress/data';
import { cartOutline, bag, bagAlt } from '@poocommerce/icons';
import { Icon } from '@wordpress/icons';
import { WC_BLOCKS_IMAGE_URL } from '@poocommerce/block-settings';
import { ColorPanel } from '@poocommerce/editor-components/color-panel';
import type { ColorPaletteOption } from '@poocommerce/editor-components/color-panel/types';

/**
 * Internal dependencies
 */
import QuantityBadge from './quantity-badge';
import { defaultColorItem } from './utils/defaults';
import { migrateAttributesToColorPanel } from './utils/data';
import './editor.scss';
import { useThemeColors } from '../../shared/hooks/use-theme-colors';

export interface Attributes {
	miniCartIcon: 'cart' | 'bag' | 'bag-alt';
	addToCartBehaviour: string;
	onCartClickBehaviour: 'navigate_to_checkout' | 'open_drawer';
	hasHiddenPrice: boolean;
	cartAndCheckoutRenderStyle: boolean;
	priceColor: ColorPaletteOption;
	iconColor: ColorPaletteOption;
	productCountColor: ColorPaletteOption;
	productCountVisibility: 'always' | 'never' | 'greater_than_zero';
}

interface Props {
	attributes: Attributes;
	setAttributes: ( attributes: Record< string, unknown > ) => void;
	clientId: number;
	setPriceColor: ( colorValue: string | undefined ) => void;
	setIconColor: ( colorValue: string | undefined ) => void;
	setProductCountColor: ( colorValue: string | undefined ) => void;
}

const Edit = ( { attributes, setAttributes }: Props ): ReactElement => {
	const {
		cartAndCheckoutRenderStyle,
		addToCartBehaviour,
		onCartClickBehaviour,
		hasHiddenPrice,
		priceColor = defaultColorItem,
		iconColor = defaultColorItem,
		productCountColor = defaultColorItem,
		miniCartIcon,
		productCountVisibility,
	} = migrateAttributesToColorPanel( attributes );
	const miniCartButtonRef = useRef< HTMLButtonElement >( null );

	const miniCartColorAttributes = {
		priceColor: {
			label: __( 'Price', 'poocommerce' ),
			context: 'price-color',
		},
		iconColor: {
			label: __( 'Icon', 'poocommerce' ),
			context: 'icon-color',
		},
		productCountColor: {
			label: __( 'Product Count', 'poocommerce' ),
			context: 'product-count-color',
		},
	};

	const blockProps = useBlockProps( {
		className: 'wc-block-mini-cart',
	} );

	const isSiteEditor = isSiteEditorPage( select( 'core/edit-site' ) );

	const templatePartEditUri = getSetting(
		'templatePartEditUri',
		''
	) as string;

	// Apply Mini Cart quantity badge styles based on Site Editor's background and text colors.
	// We need to set `span` in the selector so it has more specificity than the CSS.
	useThemeColors(
		'mini-cart-badge',
		( { editorBackgroundColor, editorColor } ) => `
			span:where(.wc-block-mini-cart__badge) {
				color: ${ editorBackgroundColor };
				background-color: ${ editorColor };
			}
		`
	);

	const productCount =
		productCountVisibility === 'never' ||
		productCountVisibility === 'always'
			? 0
			: 2;

	const productTotal = 0;
	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'poocommerce' ) }>
					<ToggleGroupControl
						className="wc-block-editor-mini-cart__cart-icon-toggle"
						isBlock
						label={ __( 'Cart Icon', 'poocommerce' ) }
						value={ miniCartIcon }
						onChange={ ( value: 'cart' | 'bag' | 'bag-alt' ) => {
							setAttributes( {
								miniCartIcon: value,
							} );
						} }
					>
						<ToggleGroupControlOption
							value={ 'cart' }
							label={ <Icon size={ 32 } icon={ cartOutline } /> }
						/>
						<ToggleGroupControlOption
							value={ 'bag' }
							label={ <Icon size={ 32 } icon={ bag } /> }
						/>
						<ToggleGroupControlOption
							value={ 'bag-alt' }
							label={ <Icon size={ 32 } icon={ bagAlt } /> }
						/>
					</ToggleGroupControl>
					<BaseControl
						id="wc-block-mini-cart__display-toggle"
						label={ __( 'Display', 'poocommerce' ) }
					>
						<ToggleControl
							label={ __( 'Display total price', 'poocommerce' ) }
							help={ __(
								'Toggle to display the total price of products in the shopping cart. If no products have been added, the price will not display.',
								'poocommerce'
							) }
							checked={ ! hasHiddenPrice }
							onChange={ () =>
								setAttributes( {
									hasHiddenPrice: ! hasHiddenPrice,
								} )
							}
						/>
					</BaseControl>
					<BaseControl
						id="wc-block-mini-cart__product-count-basecontrol"
						label={ __( 'Show Cart Item Count:', 'poocommerce' ) }
					>
						<RadioControl
							className="wc-block-mini-cart__product-count-radiocontrol"
							selected={ productCountVisibility }
							options={ [
								{
									label: __(
										'Always (even if empty)',
										'poocommerce'
									),
									value: 'always',
								},
								{
									label: __(
										'Only if cart has items',
										'poocommerce'
									),
									value: 'greater_than_zero',
								},
								{
									label: __( 'Never', 'poocommerce' ),
									value: 'never',
								},
							] }
							help={ __(
								'The editor does not display the real count value, but a placeholder to indicate how it will look on the front-end.',
								'poocommerce'
							) }
							onChange={ ( value ) =>
								setAttributes( {
									productCountVisibility: value,
								} )
							}
						/>
					</BaseControl>
					{ isSiteEditor && (
						<ToggleGroupControl
							className="wc-block-editor-mini-cart__render-in-cart-and-checkout-toggle"
							label={ __(
								'Mini-Cart in cart and checkout pages',
								'poocommerce'
							) }
							isBlock
							value={ cartAndCheckoutRenderStyle }
							onChange={ ( value: boolean ) => {
								setAttributes( {
									cartAndCheckoutRenderStyle: value,
								} );
							} }
							help={ __(
								'Select how the Mini-Cart behaves in the Cart and Checkout pages. This might affect the header layout.',
								'poocommerce'
							) }
						>
							<ToggleGroupControlOption
								value={ 'hidden' }
								label={ __( 'Hide', 'poocommerce' ) }
							/>
							<ToggleGroupControlOption
								value={ 'removed' }
								label={ __( 'Remove', 'poocommerce' ) }
							/>
						</ToggleGroupControl>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Cart Drawer', 'poocommerce' ) }>
					{ templatePartEditUri && (
						<>
							<img
								className="wc-block-editor-mini-cart__drawer-image"
								src={
									isRTL()
										? `${ WC_BLOCKS_IMAGE_URL }blocks/mini-cart/cart-drawer-rtl.svg`
										: `${ WC_BLOCKS_IMAGE_URL }blocks/mini-cart/cart-drawer.svg`
								}
								alt=""
							/>
							<p>
								{ __(
									'When opened, the Mini-Cart drawer gives shoppers quick access to view their selected products and checkout.',
									'poocommerce'
								) }
							</p>
							<p className="wc-block-editor-mini-cart__drawer-link">
								<ExternalLink href={ templatePartEditUri }>
									{ __(
										'Edit Mini-Cart Drawer template',
										'poocommerce'
									) }
								</ExternalLink>
							</p>
						</>
					) }
					<BaseControl
						id="wc-block-mini-cart__add-to-cart-behaviour-toggle"
						label={ __( 'Behavior', 'poocommerce' ) }
					>
						<ToggleControl
							label={ __(
								'Open drawer when adding',
								'poocommerce'
							) }
							onChange={ ( value ) => {
								setAttributes( {
									addToCartBehaviour: value
										? 'open_drawer'
										: 'none',
								} );
							} }
							help={ __(
								'Toggle to open the Mini-Cart drawer when a shopper adds a product to their cart.',
								'poocommerce'
							) }
							checked={ addToCartBehaviour === 'open_drawer' }
						/>
						<ToggleControl
							label={ __(
								'Navigate to checkout when clicking the Mini-Cart, instead of opening the drawer.',
								'poocommerce'
							) }
							onChange={ ( value ) => {
								setAttributes( {
									onCartClickBehaviour: value
										? 'navigate_to_checkout'
										: 'open_drawer',
								} );
							} }
							help={ __(
								'Toggle to disable opening the Mini-Cart drawer when clicking the cart icon, and instead navigate to the checkout page.',
								'poocommerce'
							) }
							checked={
								onCartClickBehaviour === 'navigate_to_checkout'
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<ColorPanel
				colorTypes={ miniCartColorAttributes }
				miniCartButtonRef={ miniCartButtonRef }
			/>
			<Noninteractive>
				<button
					ref={ miniCartButtonRef }
					className="wc-block-mini-cart__button"
				>
					<QuantityBadge
						count={ productCount }
						iconColor={ iconColor }
						productCountColor={ productCountColor }
						icon={ miniCartIcon }
						productCountVisibility={ productCountVisibility }
					/>
					{ ! hasHiddenPrice && (
						<span
							className="wc-block-mini-cart__amount"
							style={ { color: priceColor.color } }
						>
							{ formatPrice( productTotal ) }
						</span>
					) }
				</button>
			</Noninteractive>
		</div>
	);
};

export default Edit;
