<?php
/**
 * Personal data exporters.
 *
 * @since 3.4.0
 * @package PooCommerce\Classes
 */

defined( 'ABSPATH' ) || exit;

/**
 * WC_Privacy_Exporters Class.
 */
class WC_Privacy_Exporters {
	/**
	 * Finds and exports customer data by email address.
	 *
	 * @since 3.4.0
	 * @param string $email_address The user email address.
	 * @return array An array of personal data in name value pairs
	 */
	public static function customer_data_exporter( $email_address ) {
		$user           = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.
		$data_to_export = array();

		if ( $user instanceof WP_User ) {
			$customer_personal_data = self::get_customer_personal_data( $user );
			if ( ! empty( $customer_personal_data ) ) {
				$data_to_export[] = array(
					'group_id'          => 'poocommerce_customer',
					'group_label'       => __( 'Customer Data', 'poocommerce' ),
					'group_description' => __( 'User&#8217;s PooCommerce customer data.', 'poocommerce' ),
					'item_id'           => 'user',
					'data'              => $customer_personal_data,
				);
			}
		}

		return array(
			'data' => $data_to_export,
			'done' => true,
		);
	}

	/**
	 * Finds and exports data which could be used to identify a person from PooCommerce data associated with an email address.
	 *
	 * Orders are exported in blocks of 10 to avoid timeouts.
	 *
	 * @since 3.4.0
	 * @param string $email_address The user email address.
	 * @param int    $page  Page.
	 * @return array An array of personal data in name value pairs
	 */
	public static function order_data_exporter( $email_address, $page ) {
		$done           = true;
		$page           = (int) $page;
		$user           = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.
		$data_to_export = array();
		$order_query    = array(
			'limit'    => 10,
			'page'     => $page,
			'customer' => array( $email_address ),
		);

		if ( $user instanceof WP_User ) {
			$order_query['customer'][] = (int) $user->ID;
		}

		$orders = wc_get_orders( $order_query );

		if ( 0 < count( $orders ) ) {
			foreach ( $orders as $order ) {
				$data_to_export[] = array(
					'group_id'          => 'poocommerce_orders',
					'group_label'       => __( 'Orders', 'poocommerce' ),
					'group_description' => __( 'User&#8217;s PooCommerce orders data.', 'poocommerce' ),
					'item_id'           => 'order-' . $order->get_id(),
					'data'              => self::get_order_personal_data( $order ),
				);
			}
			$done = 10 > count( $orders );
		}

		return array(
			'data' => $data_to_export,
			'done' => $done,
		);
	}

	/**
	 * Finds and exports customer download logs by email address.
	 *
	 * @since 3.4.0
	 * @param string $email_address The user email address.
	 * @param int    $page  Page.
	 * @throws Exception When WC_Data_Store validation fails.
	 * @return array An array of personal data in name value pairs
	 */
	public static function download_data_exporter( $email_address, $page ) {
		$done            = true;
		$page            = (int) $page;
		$user            = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.
		$data_to_export  = array();
		$downloads_query = array(
			'limit' => 10,
			'page'  => $page,
		);

		if ( $user instanceof WP_User ) {
			$downloads_query['user_id'] = (int) $user->ID;
		} else {
			$downloads_query['user_email'] = $email_address;
		}

		$customer_download_data_store     = WC_Data_Store::load( 'customer-download' );
		$customer_download_log_data_store = WC_Data_Store::load( 'customer-download-log' );
		$downloads                        = $customer_download_data_store->get_downloads( $downloads_query );

		if ( 0 < count( $downloads ) ) {
			foreach ( $downloads as $download ) {
				$data_to_export[] = array(
					'group_id'          => 'poocommerce_downloads',
					/* translators: This is the headline for a list of downloads purchased from the store for a given user. */
					'group_label'       => __( 'Purchased Downloads', 'poocommerce' ),
					'group_description' => __( 'User&#8217;s PooCommerce purchased downloads data.', 'poocommerce' ),
					'item_id'           => 'download-' . $download->get_id(),
					'data'              => self::get_download_personal_data( $download ),
				);

				$download_logs = $customer_download_log_data_store->get_download_logs_for_permission( $download->get_id() );

				foreach ( $download_logs as $download_log ) {
					$data_to_export[] = array(
						'group_id'          => 'poocommerce_download_logs',
						/* translators: This is the headline for a list of access logs for downloads purchased from the store for a given user. */
						'group_label'       => __( 'Access to Purchased Downloads', 'poocommerce' ),
						'group_description' => __( 'User&#8217;s PooCommerce access to purchased downloads data.', 'poocommerce' ),
						'item_id'           => 'download-log-' . $download_log->get_id(),
						'data'              => array(
							array(
								'name'  => __( 'Download ID', 'poocommerce' ),
								'value' => $download_log->get_permission_id(),
							),
							array(
								'name'  => __( 'Timestamp', 'poocommerce' ),
								'value' => $download_log->get_timestamp(),
							),
							array(
								'name'  => __( 'IP Address', 'poocommerce' ),
								'value' => $download_log->get_user_ip_address(),
							),
						),
					);
				}
			}
			$done = 10 > count( $downloads );
		}

		return array(
			'data' => $data_to_export,
			'done' => $done,
		);
	}

	/**
	 * Get personal data (key/value pairs) for a user object.
	 *
	 * @since 3.4.0
	 * @param WP_User $user user object.
	 * @throws Exception If customer cannot be read/found and $data is set to WC_Customer class.
	 * @return array
	 */
	protected static function get_customer_personal_data( $user ) {
		$personal_data = array();
		$customer      = new WC_Customer( $user->ID );

		if ( ! $customer ) {
			return array();
		}

		$props_to_export = apply_filters(
			'poocommerce_privacy_export_customer_personal_data_props',
			array(
				'billing_first_name'  => __( 'Billing First Name', 'poocommerce' ),
				'billing_last_name'   => __( 'Billing Last Name', 'poocommerce' ),
				'billing_company'     => __( 'Billing Company', 'poocommerce' ),
				'billing_address_1'   => __( 'Billing Address 1', 'poocommerce' ),
				'billing_address_2'   => __( 'Billing Address 2', 'poocommerce' ),
				'billing_city'        => __( 'Billing City', 'poocommerce' ),
				'billing_postcode'    => __( 'Billing Postal/Zip Code', 'poocommerce' ),
				'billing_state'       => __( 'Billing State', 'poocommerce' ),
				'billing_country'     => __( 'Billing Country / Region', 'poocommerce' ),
				'billing_phone'       => __( 'Billing Phone Number', 'poocommerce' ),
				'billing_email'       => __( 'Email Address', 'poocommerce' ),
				'shipping_first_name' => __( 'Shipping First Name', 'poocommerce' ),
				'shipping_last_name'  => __( 'Shipping Last Name', 'poocommerce' ),
				'shipping_company'    => __( 'Shipping Company', 'poocommerce' ),
				'shipping_address_1'  => __( 'Shipping Address 1', 'poocommerce' ),
				'shipping_address_2'  => __( 'Shipping Address 2', 'poocommerce' ),
				'shipping_city'       => __( 'Shipping City', 'poocommerce' ),
				'shipping_postcode'   => __( 'Shipping Postal/Zip Code', 'poocommerce' ),
				'shipping_state'      => __( 'Shipping State', 'poocommerce' ),
				'shipping_country'    => __( 'Shipping Country / Region', 'poocommerce' ),
				'shipping_phone'      => __( 'Shipping Phone Number', 'poocommerce' ),
			),
			$customer
		);

		foreach ( $props_to_export as $prop => $description ) {
			$value = '';

			if ( is_callable( array( $customer, 'get_' . $prop ) ) ) {
				$value = $customer->{"get_$prop"}( 'edit' );
			}

			$value = apply_filters( 'poocommerce_privacy_export_customer_personal_data_prop_value', $value, $prop, $customer );

			if ( $value ) {
				$personal_data[] = array(
					'name'  => $description,
					'value' => $value,
				);
			}
		}

		/**
		 * Allow extensions to register their own personal data for this customer for the export.
		 *
		 * @since 3.4.0
		 * @param array    $personal_data Array of name value pairs.
		 * @param WC_Order $order A customer object.
		 */
		$personal_data = apply_filters( 'poocommerce_privacy_export_customer_personal_data', $personal_data, $customer );

		return $personal_data;
	}

	/**
	 * Get personal data (key/value pairs) for an order object.
	 *
	 * @since 3.4.0
	 * @param WC_Order $order Order object.
	 * @return array
	 */
	protected static function get_order_personal_data( $order ) {
		$personal_data   = array();
		$props_to_export = apply_filters(
			'poocommerce_privacy_export_order_personal_data_props',
			array(
				'order_number'               => __( 'Order Number', 'poocommerce' ),
				'date_created'               => __( 'Order Date', 'poocommerce' ),
				'total'                      => __( 'Order Total', 'poocommerce' ),
				'items'                      => __( 'Items Purchased', 'poocommerce' ),
				'customer_ip_address'        => __( 'IP Address', 'poocommerce' ),
				'customer_user_agent'        => __( 'Browser User Agent', 'poocommerce' ),
				'formatted_billing_address'  => __( 'Billing Address', 'poocommerce' ),
				'formatted_shipping_address' => __( 'Shipping Address', 'poocommerce' ),
				'billing_phone'              => __( 'Phone Number', 'poocommerce' ),
				'billing_email'              => __( 'Email Address', 'poocommerce' ),
				'shipping_phone'             => __( 'Shipping Phone Number', 'poocommerce' ),
			),
			$order
		);

		foreach ( $props_to_export as $prop => $name ) {
			$value = '';

			switch ( $prop ) {
				case 'items':
					$item_names = array();
					foreach ( $order->get_items() as $item ) {
						$item_names[] = $item->get_name() . ' x ' . $item->get_quantity();
					}
					$value = implode( ', ', $item_names );
					break;
				case 'date_created':
					$value = wc_format_datetime( $order->get_date_created(), get_option( 'date_format' ) . ', ' . get_option( 'time_format' ) );
					break;
				case 'formatted_billing_address':
				case 'formatted_shipping_address':
					$value = preg_replace( '#<br\s*/?>#i', ', ', $order->{"get_$prop"}() );
					break;
				default:
					if ( is_callable( array( $order, 'get_' . $prop ) ) ) {
						$value = $order->{"get_$prop"}();
					}
					break;
			}

			$value = apply_filters( 'poocommerce_privacy_export_order_personal_data_prop', $value, $prop, $order );

			if ( $value ) {
				$personal_data[] = array(
					'name'  => $name,
					'value' => $value,
				);
			}
		}

		// Export meta data.
		$meta_to_export = apply_filters(
			'poocommerce_privacy_export_order_personal_data_meta',
			array(
				'Payer first name'     => __( 'Payer first name', 'poocommerce' ),
				'Payer last name'      => __( 'Payer last name', 'poocommerce' ),
				'Payer PayPal address' => __( 'Payer PayPal address', 'poocommerce' ),
				'Transaction ID'       => __( 'Transaction ID', 'poocommerce' ),
			)
		);

		if ( ! empty( $meta_to_export ) && is_array( $meta_to_export ) ) {
			foreach ( $meta_to_export as $meta_key => $name ) {
				$value = apply_filters( 'poocommerce_privacy_export_order_personal_data_meta_value', $order->get_meta( $meta_key ), $meta_key, $order );

				if ( $value ) {
					$personal_data[] = array(
						'name'  => $name,
						'value' => $value,
					);
				}
			}
		}

		/**
		 * Allow extensions to register their own personal data for this order for the export.
		 *
		 * @since 3.4.0
		 * @param array    $personal_data Array of name value pairs to expose in the export.
		 * @param WC_Order $order An order object.
		 */
		$personal_data = apply_filters( 'poocommerce_privacy_export_order_personal_data', $personal_data, $order );

		return $personal_data;
	}

	/**
	 * Get personal data (key/value pairs) for a download object.
	 *
	 * @since 3.4.0
	 * @param WC_Order $download Download object.
	 * @return array
	 */
	protected static function get_download_personal_data( $download ) {
		$personal_data = array(
			array(
				'name'  => __( 'Download ID', 'poocommerce' ),
				'value' => $download->get_id(),
			),
			array(
				'name'  => __( 'Order ID', 'poocommerce' ),
				'value' => $download->get_order_id(),
			),
			array(
				'name'  => __( 'Product', 'poocommerce' ),
				'value' => get_the_title( $download->get_product_id() ),
			),
			array(
				'name'  => __( 'User email', 'poocommerce' ),
				'value' => $download->get_user_email(),
			),
			array(
				'name'  => __( 'Downloads remaining', 'poocommerce' ),
				'value' => $download->get_downloads_remaining(),
			),
			array(
				'name'  => __( 'Download count', 'poocommerce' ),
				'value' => $download->get_download_count(),
			),
			array(
				'name'  => __( 'Access granted', 'poocommerce' ),
				'value' => gmdate( 'Y-m-d', $download->get_access_granted( 'edit' )->getTimestamp() ),
			),
			array(
				'name'  => __( 'Access expires', 'poocommerce' ),
				'value' => ! is_null( $download->get_access_expires( 'edit' ) ) ? gmdate( 'Y-m-d', $download->get_access_expires( 'edit' )->getTimestamp() ) : null,
			),
		);

		/**
		 * Allow extensions to register their own personal data for this download for the export.
		 *
		 * @since 3.4.0
		 * @param array    $personal_data Array of name value pairs to expose in the export.
		 * @param WC_Order $order An order object.
		 */
		$personal_data = apply_filters( 'poocommerce_privacy_export_download_personal_data', $personal_data, $download );

		return $personal_data;
	}

	/**
	 * Finds and exports payment tokens by email address for a customer.
	 *
	 * @since 3.4.0
	 * @param string $email_address The user email address.
	 * @param int    $page  Page.
	 * @return array An array of personal data in name value pairs
	 */
	public static function customer_tokens_exporter( $email_address, $page ) {
		$user           = get_user_by( 'email', $email_address ); // Check if user has an ID in the DB to load stored personal data.
		$data_to_export = array();

		if ( ! $user instanceof WP_User ) {
			return array(
				'data' => $data_to_export,
				'done' => true,
			);
		}

		$tokens = WC_Payment_Tokens::get_tokens(
			array(
				'user_id' => $user->ID,
				'limit'   => 10,
				'page'    => $page,
			)
		);

		if ( 0 < count( $tokens ) ) {
			foreach ( $tokens as $token ) {
				$data_to_export[] = array(
					'group_id'          => 'poocommerce_tokens',
					'group_label'       => __( 'Payment Tokens', 'poocommerce' ),
					'group_description' => __( 'User&#8217;s PooCommerce payment tokens data.', 'poocommerce' ),
					'item_id'           => 'token-' . $token->get_id(),
					'data'              => array(
						array(
							'name'  => __( 'Token', 'poocommerce' ),
							'value' => $token->get_display_name(),
						),
					),
				);
			}
			$done = 10 > count( $tokens );
		} else {
			$done = true;
		}

		return array(
			'data' => $data_to_export,
			'done' => $done,
		);
	}
}
