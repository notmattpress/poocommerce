<?php
/**
 * Deprecated action hooks
 *
 * @package PooCommerce\Abstracts
 * @since   3.0.0
 * @version 3.3.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Handles deprecation notices and triggering of legacy action hooks.
 */
class WC_Deprecated_Action_Hooks extends WC_Deprecated_Hooks {

	/**
	 * Array of deprecated hooks we need to handle. Format of 'new' => 'old'.
	 *
	 * @var array
	 */
	protected $deprecated_hooks = array(
		'poocommerce_new_order_item'        => array(
			'poocommerce_order_add_shipping',
			'poocommerce_order_add_coupon',
			'poocommerce_order_add_tax',
			'poocommerce_order_add_fee',
			'poocommerce_add_shipping_order_item',
			'poocommerce_add_order_item_meta',
			'poocommerce_add_order_fee_meta',
		),
		'poocommerce_update_order_item'     => array(
			'poocommerce_order_edit_product',
			'poocommerce_order_update_coupon',
			'poocommerce_order_update_shipping',
			'poocommerce_order_update_fee',
			'poocommerce_order_update_tax',
		),
		'poocommerce_new_payment_token'     => 'poocommerce_payment_token_created',
		'poocommerce_new_product_variation' => 'poocommerce_create_product_variation',
		'poocommerce_order_details_after_order_table_items' => 'poocommerce_order_items_table',

		'poocommerce_settings_advanced_page_options' => array(
			'poocommerce_settings_checkout_page_options',
			'poocommerce_settings_account_page_options',
		),
		'poocommerce_settings_advanced_page_options_end' => array(
			'poocommerce_settings_checkout_page_options_end',
			'poocommerce_settings_account_page_options_end',
		),
		'poocommerce_settings_advanced_page_options_after' => array(
			'poocommerce_settings_checkout_page_options_after',
			'poocommerce_settings_account_page_options_after',
		),
	);

	/**
	 * Array of versions on each hook has been deprecated.
	 *
	 * @var array
	 */
	protected $deprecated_version = array(
		'poocommerce_order_add_shipping'                   => '3.0.0',
		'poocommerce_order_add_coupon'                     => '3.0.0',
		'poocommerce_order_add_tax'                        => '3.0.0',
		'poocommerce_order_add_fee'                        => '3.0.0',
		'poocommerce_add_shipping_order_item'              => '3.0.0',
		'poocommerce_add_order_item_meta'                  => '3.0.0',
		'poocommerce_add_order_fee_meta'                   => '3.0.0',
		'poocommerce_order_edit_product'                   => '3.0.0',
		'poocommerce_order_update_coupon'                  => '3.0.0',
		'poocommerce_order_update_shipping'                => '3.0.0',
		'poocommerce_order_update_fee'                     => '3.0.0',
		'poocommerce_order_update_tax'                     => '3.0.0',
		'poocommerce_payment_token_created'                => '3.0.0',
		'poocommerce_create_product_variation'             => '3.0.0',
		'poocommerce_order_items_table'                    => '3.0.0',
		'poocommerce_settings_checkout_page_options'       => '3.4.0',
		'poocommerce_settings_account_page_options'        => '3.4.0',
		'poocommerce_settings_checkout_page_options_end'   => '3.4.0',
		'poocommerce_settings_account_page_options_end'    => '3.4.0',
		'poocommerce_settings_checkout_page_options_after' => '3.4.0',
		'poocommerce_settings_account_page_options_after'  => '3.4.0',
	);

	/**
	 * Hook into the new hook so we can handle deprecated hooks once fired.
	 *
	 * @param string $hook_name Hook name.
	 */
	public function hook_in( $hook_name ) {
		add_action( $hook_name, array( $this, 'maybe_handle_deprecated_hook' ), -1000, 8 );
	}

	/**
	 * If the old hook is in-use, trigger it.
	 *
	 * @param  string $new_hook          New hook name.
	 * @param  string $old_hook          Old hook name.
	 * @param  array  $new_callback_args New callback args.
	 * @param  mixed  $return_value      Returned value.
	 * @return mixed
	 */
	public function handle_deprecated_hook( $new_hook, $old_hook, $new_callback_args, $return_value ) {
		if ( has_action( $old_hook ) ) {
			$this->display_notice( $old_hook, $new_hook );
			$return_value = $this->trigger_hook( $old_hook, $new_callback_args );
		}
		return $return_value;
	}

	/**
	 * Fire off a legacy hook with it's args.
	 *
	 * @param  string $old_hook          Old hook name.
	 * @param  array  $new_callback_args New callback args.
	 * @return mixed
	 */
	protected function trigger_hook( $old_hook, $new_callback_args ) {
		switch ( $old_hook ) {
			case 'poocommerce_order_add_shipping':
			case 'poocommerce_order_add_fee':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Shipping' ) || is_a( $item, 'WC_Order_Item_Fee' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item );
				}
				break;
			case 'poocommerce_order_add_coupon':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Coupon' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item->get_code(), $item->get_discount(), $item->get_discount_tax() );
				}
				break;
			case 'poocommerce_order_add_tax':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Tax' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item->get_rate_id(), $item->get_tax_total(), $item->get_shipping_tax_total() );
				}
				break;
			case 'poocommerce_add_shipping_order_item':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Shipping' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item->legacy_package_key );
				}
				break;
			case 'poocommerce_add_order_item_meta':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Product' ) ) {
					do_action( $old_hook, $item_id, $item->legacy_values, $item->legacy_cart_item_key );
				}
				break;
			case 'poocommerce_add_order_fee_meta':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Fee' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item->legacy_fee, $item->legacy_fee_key );
				}
				break;
			case 'poocommerce_order_edit_product':
				$item_id  = $new_callback_args[0];
				$item     = $new_callback_args[1];
				$order_id = $new_callback_args[2];
				if ( is_a( $item, 'WC_Order_Item_Product' ) ) {
					do_action( $old_hook, $order_id, $item_id, $item, $item->get_product() );
				}
				break;
			default:
				do_action_ref_array( $old_hook, $new_callback_args );
				break;
		}
	}
}
