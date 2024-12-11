/**
 * External dependencies
 */
import type { LazyExoticComponent } from '@wordpress/element';
import type { BlockConfiguration } from '@wordpress/blocks';
import type { RegisteredBlockComponent } from '@poocommerce/types';

export enum innerBlockAreas {
	CHECKOUT = 'poocommerce/checkout',
	CHECKOUT_FIELDS = 'poocommerce/checkout-fields-block',
	CHECKOUT_TOTALS = 'poocommerce/checkout-totals-block',
	CONTACT_INFORMATION = 'poocommerce/checkout-contact-information-block',
	SHIPPING_ADDRESS = 'poocommerce/checkout-shipping-address-block',
	BILLING_ADDRESS = 'poocommerce/checkout-billing-address-block',
	SHIPPING_METHOD = 'poocommerce/checkout-shipping-method-block',
	SHIPPING_METHODS = 'poocommerce/checkout-shipping-methods-block',
	PICKUP_LOCATION = 'poocommerce/checkout-pickup-options-block',
	PAYMENT_METHODS = 'poocommerce/checkout-payment-methods-block',
	CART = 'poocommerce/cart',
	EMPTY_CART = 'poocommerce/empty-cart-block',
	FILLED_CART = 'poocommerce/filled-cart-block',
	CART_ITEMS = 'poocommerce/cart-items-block',
	CART_CROSS_SELLS = 'poocommerce/cart-cross-sells-block',
	CART_TOTALS = 'poocommerce/cart-totals-block',
	MINI_CART = 'poocommerce/mini-cart-contents',
	EMPTY_MINI_CART = 'poocommerce/empty-mini-cart-contents-block',
	FILLED_MINI_CART = 'poocommerce/filled-mini-cart-contents-block',
	MINI_CART_TITLE = 'poocommerce/mini-cart-title-block',
	MINI_CART_ITEMS = 'poocommerce/mini-cart-items-block',
	MINI_CART_FOOTER = 'poocommerce/mini-cart-footer-block',
	CART_ORDER_SUMMARY = 'poocommerce/cart-order-summary-block',
	CART_ORDER_SUMMARY_TOTALS = 'poocommerce/cart-order-summary-totals-block',
	CHECKOUT_ORDER_SUMMARY = 'poocommerce/checkout-order-summary-block',
	CHECKOUT_ORDER_SUMMARY_TOTALS = 'poocommerce/checkout-order-summary-totals-block',
}

interface CheckoutBlockOptionsMetadata extends Partial< BlockConfiguration > {
	name: string;
	parent: string[];
}

export type RegisteredBlock = {
	blockName: string;
	metadata: CheckoutBlockOptionsMetadata;
	component: RegisteredBlockComponent;
	force: boolean;
};

export type RegisteredBlocks = Record< string, RegisteredBlock >;

export type CheckoutBlockOptions = {
	metadata: CheckoutBlockOptionsMetadata;
	force?: boolean;
	component:
		| LazyExoticComponent< React.ComponentType< unknown > >
		| ( () => JSX.Element | null )
		| null;
};
