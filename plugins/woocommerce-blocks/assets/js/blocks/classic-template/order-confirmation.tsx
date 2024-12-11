/**
 * External dependencies
 */
import { createBlock, type BlockInstance } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { OnClickCallbackParameter, InheritedAttributes } from './types';

const isConversionPossible = () => {
	return true;
};

const getButtonLabel = () => __( 'Transform into blocks', 'poocommerce' );

const getBlockifiedTemplate = ( inheritedAttributes: InheritedAttributes ) =>
	[
		createBlock( 'poocommerce/order-confirmation-status', {
			...inheritedAttributes,
			fontSize: 'large',
		} ),
		createBlock(
			'poocommerce/order-confirmation-summary',
			inheritedAttributes
		),
		createBlock(
			'poocommerce/order-confirmation-totals-wrapper',
			inheritedAttributes
		),
		createBlock(
			'poocommerce/order-confirmation-downloads-wrapper',
			inheritedAttributes
		),
		createBlock(
			'core/columns',
			{
				...inheritedAttributes,
				className: 'wc-block-order-confirmation-address-wrapper',
			},
			[
				createBlock( 'core/column', inheritedAttributes, [
					createBlock(
						'poocommerce/order-confirmation-shipping-wrapper',
						inheritedAttributes
					),
				] ),
				createBlock( 'core/column', inheritedAttributes, [
					createBlock(
						'poocommerce/order-confirmation-billing-wrapper',
						inheritedAttributes
					),
				] ),
			]
		),
		createBlock(
			'poocommerce/order-confirmation-additional-fields-wrapper',
			inheritedAttributes
		),
		createBlock(
			'poocommerce/order-confirmation-additional-information',
			inheritedAttributes
		),
	].filter( Boolean ) as BlockInstance[];

const onClickCallback = ( {
	clientId,
	attributes,
	getBlocks,
	replaceBlock,
	selectBlock,
}: OnClickCallbackParameter ) => {
	replaceBlock( clientId, getBlockifiedTemplate( attributes ) );

	const blocks = getBlocks();

	const groupBlock = blocks.find(
		( block ) =>
			block.name === 'core/group' &&
			block.innerBlocks.some(
				( innerBlock ) =>
					innerBlock.name === 'poocommerce/store-notices'
			)
	);

	if ( groupBlock ) {
		selectBlock( groupBlock.clientId );
	}
};

const getDescription = () => {
	return __(
		'This block represents the classic template used to display the order confirmation. The actual rendered template may appear different from this placeholder.',
		'poocommerce'
	);
};

const getSkeleton = () => {
	return (
		<div className="poocommerce-page">
			<div className="poocommerce-order">
				<h1>{ __( 'Order received', 'poocommerce' ) }</h1>
				<p className="poocommerce-notice poocommerce-notice--success poocommerce-thankyou-order-confirmation">
					{ __(
						'Thank you. Your order has been received.',
						'poocommerce'
					) }
				</p>
				<ul className="poocommerce-order-overview poocommerce-thankyou-order-details order_details">
					<li className="poocommerce-order-overview__order order">
						{ __( 'Order number', 'poocommerce' ) }:{ ' ' }
						<strong>123</strong>
					</li>
					<li className="poocommerce-order-overview__date date">
						{ __( 'Date', 'poocommerce' ) }:{ ' ' }
						<strong>May 25, 2023</strong>
					</li>
					<li className="poocommerce-order-overview__email email">
						{ __( 'Email', 'poocommerce' ) }:{ ' ' }
						<strong>shopper@poocommerce.com</strong>
					</li>
					<li className="poocommerce-order-overview__total total">
						{ __( 'Total', 'poocommerce' ) }:{ ' ' }
						<strong>$20.00</strong>
					</li>
				</ul>

				<section className="poocommerce-order-details">
					<h2 className="poocommerce-order-details__title">
						{ __( 'Order details', 'poocommerce' ) }
					</h2>
					<table className="poocommerce-table poocommerce-table--order-details shop_table order_details">
						<thead>
							<tr>
								<th className="poocommerce-table__product-name product-name">
									{ __( 'Product', 'poocommerce' ) }
								</th>
								<th className="poocommerce-table__product-table product-total">
									{ __( 'Total', 'poocommerce' ) }
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="poocommerce-table__line-item order_item">
								<td className="poocommerce-table__product-name product-name">
									Sample Product{ ' ' }
									<strong className="product-quantity">
										×&nbsp;2
									</strong>{ ' ' }
								</td>

								<td className="poocommerce-table__product-total product-total">
									$20.00
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<th scope="row">
									{ __( 'Subtotal', 'poocommerce' ) }:
								</th>
								<td>$20.00</td>
							</tr>
							<tr>
								<th scope="row">
									{ __( 'Total', 'poocommerce' ) }:
								</th>
								<td>$20.00</td>
							</tr>
						</tfoot>
					</table>
				</section>

				<section className="poocommerce-customer-details">
					<section className="poocommerce-columns poocommerce-columns--2 poocommerce-columns--addresses col2-set addresses">
						<div className="poocommerce-column poocommerce-column--1 poocommerce-column--billing-address col-1">
							<h2 className="poocommerce-column__title">
								{ __( 'Billing address', 'poocommerce' ) }
							</h2>
							<address>
								123 Main St
								<br />
								New York, NY 10001
								<br />
								United States (US)
							</address>
						</div>

						<div className="poocommerce-column poocommerce-column--2 poocommerce-column--shipping-address col-2">
							<h2 className="poocommerce-column__title">
								{ __( 'Shipping address', 'poocommerce' ) }
							</h2>
							<address>
								123 Main St
								<br />
								New York, NY 10001
								<br />
								United States (US)
							</address>
						</div>
					</section>
				</section>
			</div>
		</div>
	);
};

const blockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

export { blockifyConfig, isConversionPossible, getDescription, getSkeleton };
