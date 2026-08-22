/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	Placeholder,
	ExternalLink,
} from '@wordpress/components';
import { Icon, trash, starEmpty } from '@wordpress/icons';
import {
	PLACEHOLDER_IMG_SRC,
	getSettingWithCoercion,
	getAdminLink,
} from '@poocommerce/settings';
import { isBoolean } from '@poocommerce/types';

interface SavedForLaterAttributes {
	columnCount?: number;
}

interface EditProps {
	attributes: SavedForLaterAttributes;
	setAttributes: ( attrs: Partial< SavedForLaterAttributes > ) => void;
}

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;
// Kept in sync with the PHP-side fallback in `SavedForLater::render()` —
// the attribute has no block.json default on purpose.
const DEFAULT_COLUMNS = 5;

// Lives in JS because `__()` is needed for the heading copy. `block.json`
// strings aren't run through translation, so keeping the template here
// is the only way to ship a localized default.
const TEMPLATE: [ string, Record< string, unknown > ][] = [
	[
		'core/heading',
		{ content: __( 'Saved for later', 'poocommerce' ), level: 2 },
	],
];

const PREVIEW_ITEMS = [
	{
		key: 'preview-1',
		name: __( 'Sample product one', 'poocommerce' ),
		variation: __( 'Size: M', 'poocommerce' ),
		price: '$19.99',
		quantity: __( 'Qty: 2', 'poocommerce' ),
	},
	{
		key: 'preview-2',
		name: __( 'Sample product two', 'poocommerce' ),
		variation: __( 'Color: Blue', 'poocommerce' ),
		price: '$29.99',
		quantity: __( 'Qty: 1', 'poocommerce' ),
	},
	{
		key: 'preview-3',
		name: __( 'Sample product three', 'poocommerce' ),
		variation: '',
		price: '$9.99',
		quantity: __( 'Qty: 3', 'poocommerce' ),
	},
	{
		key: 'preview-4',
		name: __( 'Sample product four', 'poocommerce' ),
		variation: __( 'Size: L', 'poocommerce' ),
		price: '$24.99',
		quantity: __( 'Qty: 1', 'poocommerce' ),
	},
	{
		key: 'preview-5',
		name: __( 'Sample product five', 'poocommerce' ),
		variation: '',
		price: '$14.99',
		quantity: __( 'Qty: 2', 'poocommerce' ),
	},
	{
		key: 'preview-6',
		name: __( 'Sample product six', 'poocommerce' ),
		variation: __( 'Color: Red', 'poocommerce' ),
		price: '$39.99',
		quantity: __( 'Qty: 1', 'poocommerce' ),
	},
];

const Edit = ( { attributes, setAttributes }: EditProps ): JSX.Element => {
	const columnCount = attributes.columnCount ?? DEFAULT_COLUMNS;

	// The block type stays registered when the `cart_save_for_later` feature is
	// off (so content saved while it was on isn't flagged as an unsupported
	// block). `experimentalCartSaveForLater` mirrors that feature in wcSettings.
	const isFeatureEnabled = getSettingWithCoercion(
		'experimentalCartSaveForLater',
		false,
		isBoolean
	);

	const blockProps = useBlockProps( {
		className: 'wc-block-saved-for-later',
	} );

	// `allowedBlocks` is read from block.json automatically — passing it
	// here would just duplicate the declaration. `templateLock: false`
	// is the default so we omit that too. The className matches the
	// `<div>` PHP wraps `$content` in on the frontend, so any CSS keyed
	// off `__header` applies in both contexts.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'wc-block-saved-for-later__header' },
		{ template: TEMPLATE }
	);

	// Nothing to preview when the feature is off — show a short notice instead
	// of the sample list, so a persisted block doesn't look like a real one.
	if ( ! isFeatureEnabled ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ <Icon icon={ starEmpty } /> }
					label={ __( 'Saved for later', 'poocommerce' ) }
					instructions={ sprintf(
						/* translators: %s: the feature name ("Save for Later in Cart"). */
						__(
							'The “%s” feature is off, so this block will not appear on your store.',
							'poocommerce'
						),
						__( 'Save for Later in Cart', 'poocommerce' )
					) }
				>
					<ExternalLink
						href={ getAdminLink(
							'admin.php?page=wc-settings&tab=advanced&section=features'
						) }
					>
						{ __(
							'Enable it in PooCommerce settings',
							'poocommerce'
						) }
					</ExternalLink>
				</Placeholder>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'poocommerce' ) }>
					<RangeControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Columns', 'poocommerce' ) }
						value={ columnCount }
						onChange={ ( value?: number ) => {
							if ( typeof value !== 'number' ) {
								return;
							}
							setAttributes( { columnCount: value } );
						} }
						min={ MIN_COLUMNS }
						max={ MAX_COLUMNS }
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div { ...innerBlocksProps } />
				<ul
					className={ `wc-block-saved-for-later__list columns-${ columnCount }` }
				>
					{ PREVIEW_ITEMS.map( ( item ) => (
						<li
							key={ item.key }
							className="wc-block-shopper-list-item"
						>
							<div className="wc-block-components-product-image wc-block-components-product-image--aspect-ratio-auto">
								<a
									href="#preview"
									onClick={ ( e ) => e.preventDefault() }
								>
									<img src={ PLACEHOLDER_IMG_SRC } alt="" />
								</a>
								<button
									type="button"
									className="wc-block-shopper-list-item__remove"
									aria-label={ sprintf(
										/* translators: %s: product name. */
										__(
											'Remove %s from Saved for later list',
											'poocommerce'
										),
										item.name
									) }
									disabled
								>
									<Icon icon={ trash } size={ 24 } />
								</button>
								{ item.variation && (
									<span className="wc-block-shopper-list-item__variation">
										{ item.variation }
									</span>
								) }
							</div>
							<h2 className="wp-block-post-title has-text-align-center has-medium-font-size">
								<a
									href="#preview"
									onClick={ ( e ) => e.preventDefault() }
								>
									{ item.name }
								</a>
							</h2>
							<div className="price wc-block-components-product-price has-text-align-center has-small-font-size">
								<span className="wc-block-components-product-price__value">
									{ item.price }
								</span>
							</div>
							<span className="wc-block-shopper-list-item__quantity">
								{ item.quantity }
							</span>
							<div className="wp-block-button wc-block-components-product-button">
								<button
									type="button"
									className="wp-block-button__link wp-element-button add_to_cart_button wc-block-components-product-button__button"
									disabled
								>
									{ __( 'Move to cart', 'poocommerce' ) }
								</button>
							</div>
						</li>
					) ) }
				</ul>
			</section>
		</>
	);
};

export default Edit;
