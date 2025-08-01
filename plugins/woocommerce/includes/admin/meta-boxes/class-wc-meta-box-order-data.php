<?php
/**
 * Order Data
 *
 * Functions for displaying the order data meta box.
 *
 * @package     PooCommerce\Admin\Meta Boxes
 * @version     2.2.0
 */

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Internal\Utilities\Users;
use Automattic\PooCommerce\Utilities\OrderUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * WC_Meta_Box_Order_Data Class.
 */
class WC_Meta_Box_Order_Data {

	/**
	 * Billing fields.
	 *
	 * @var array
	 */
	protected static $billing_fields = array();

	/**
	 * Shipping fields.
	 *
	 * @var array
	 */
	protected static $shipping_fields = array();

	/**
	 * Get billing fields for the meta box.
	 *
	 * @param \WC_Order $order Order object.
	 * @param string    $context Context of fields (view or edit).
	 * @return array
	 */
	protected static function get_billing_fields( $order = false, $context = 'edit' ) {
		/**
		 * Provides an opportunity to modify the list of order billing fields displayed on the admin.
		 *
		 * @since 1.4.0
		 *
		 * @param array Billing fields.
		 * @param WC_Order|false $order Order object.
		 * @param string $context Context of fields (view or edit).
		 */
		return apply_filters(
			'poocommerce_admin_billing_fields',
			array(
				'first_name' => array(
					'label' => __( 'First name', 'poocommerce' ),
					'show'  => false,
				),
				'last_name'  => array(
					'label' => __( 'Last name', 'poocommerce' ),
					'show'  => false,
				),
				'company'    => array(
					'label' => __( 'Company', 'poocommerce' ),
					'show'  => false,
				),
				'address_1'  => array(
					'label' => __( 'Address line 1', 'poocommerce' ),
					'show'  => false,
				),
				'address_2'  => array(
					'label' => __( 'Address line 2', 'poocommerce' ),
					'show'  => false,
				),
				'city'       => array(
					'label' => __( 'City', 'poocommerce' ),
					'show'  => false,
				),
				'postcode'   => array(
					'label' => __( 'Postcode / ZIP', 'poocommerce' ),
					'show'  => false,
				),
				'country'    => array(
					'label'   => __( 'Country / Region', 'poocommerce' ),
					'show'    => false,
					'class'   => 'js_field-country select short',
					'type'    => 'select',
					'options' => array( '' => __( 'Select a country / region&hellip;', 'poocommerce' ) ) + WC()->countries->get_countries(),
				),
				'state'      => array(
					'label' => __( 'State / County', 'poocommerce' ),
					'class' => 'js_field-state select short',
					'show'  => false,
				),
				'email'      => array(
					'label' => __( 'Email address', 'poocommerce' ),
				),
				'phone'      => array(
					'label' => __( 'Phone', 'poocommerce' ),
				),
			),
			$order,
			$context
		);
	}

	/**
	 * Get shipping fields for the meta box.
	 *
	 * @param \WC_Order $order Order object.
	 * @param string    $context Context of fields (view or edit).
	 * @return array
	 */
	protected static function get_shipping_fields( $order = false, $context = 'edit' ) {
		/**
		 * Provides an opportunity to modify the list of order shipping fields displayed on the admin.
		 *
		 * @since 1.4.0
		 *
		 * @param array Shipping fields.
		 * @param WC_Order|false $order Order object.
		 * @param string $context Context of fields (view or edit).
		 */
		return apply_filters(
			'poocommerce_admin_shipping_fields',
			array(
				'first_name' => array(
					'label' => __( 'First name', 'poocommerce' ),
					'show'  => false,
				),
				'last_name'  => array(
					'label' => __( 'Last name', 'poocommerce' ),
					'show'  => false,
				),
				'company'    => array(
					'label' => __( 'Company', 'poocommerce' ),
					'show'  => false,
				),
				'address_1'  => array(
					'label' => __( 'Address line 1', 'poocommerce' ),
					'show'  => false,
				),
				'address_2'  => array(
					'label' => __( 'Address line 2', 'poocommerce' ),
					'show'  => false,
				),
				'city'       => array(
					'label' => __( 'City', 'poocommerce' ),
					'show'  => false,
				),
				'postcode'   => array(
					'label' => __( 'Postcode / ZIP', 'poocommerce' ),
					'show'  => false,
				),
				'country'    => array(
					'label'   => __( 'Country / Region', 'poocommerce' ),
					'show'    => false,
					'type'    => 'select',
					'class'   => 'js_field-country select short',
					'options' => array( '' => __( 'Select a country / region&hellip;', 'poocommerce' ) ) + WC()->countries->get_countries(),
				),
				'state'      => array(
					'label' => __( 'State / County', 'poocommerce' ),
					'class' => 'js_field-state select short',
					'show'  => false,
				),
				'phone'      => array(
					'label' => __( 'Phone', 'poocommerce' ),
				),
			),
			$order,
			$context
		);
	}

	/**
	 * Init billing and shipping fields we display + save. Maintained for backwards compat.
	 */
	public static function init_address_fields() {
		self::$billing_fields  = self::get_billing_fields();
		self::$shipping_fields = self::get_shipping_fields();
	}

	/**
	 * Output the metabox.
	 *
	 * @param WP_Post|WC_Order $post Post or order object.
	 */
	public static function output( $post ) {
		global $theorder;

		OrderUtil::init_theorder_object( $post );

		$order = $theorder;

		if ( WC()->payment_gateways() ) {
			$payment_gateways = WC()->payment_gateways->payment_gateways();
		} else {
			$payment_gateways = array();
		}

		$payment_method = $order->get_payment_method();

		$order_type_object = get_post_type_object( $order->get_type() );
		wp_nonce_field( 'poocommerce_save_data', 'poocommerce_meta_nonce' );
		?>
		<style type="text/css">
			#post-body-content, #titlediv { display:none }
		</style>
		<div class="panel-wrap poocommerce">
			<input name="post_title" type="hidden" value="<?php echo esc_attr( empty( $order->get_title() ) ? __( 'Order', 'poocommerce' ) : $order->get_title() ); ?>" />
			<input name="post_status" type="hidden" value="<?php echo esc_attr( $order->get_status() ); ?>" />
			<div id="order_data" class="panel poocommerce-order-data">
				<div class="order_data_header">
					<div class="order_data_header_column">
						<h2 class="poocommerce-order-data__heading">
							<?php

							printf(
								/* translators: 1: order type 2: order number */
								esc_html__( '%1$s #%2$s details', 'poocommerce' ),
								esc_html( $order_type_object->labels->singular_name ),
								esc_html( $order->get_order_number() )
							);

							?>
						</h2>
						<p class="poocommerce-order-data__meta order_number">
							<?php

							$meta_list = array();

							if ( $payment_method && 'other' !== $payment_method ) {
								$payment_method_string = sprintf(
									/* translators: %s: payment method */
									__( 'Payment via %s', 'poocommerce' ),
									esc_html( isset( $payment_gateways[ $payment_method ] ) ? $payment_gateways[ $payment_method ]->get_title() : $payment_method )
								);

								$transaction_id = $order->get_transaction_id();
								if ( $transaction_id ) {

									$to_add = null;
									if ( isset( $payment_gateways[ $payment_method ] ) ) {
										$url = $payment_gateways[ $payment_method ]->get_transaction_url( $order );
										if ( $url ) {
											$to_add .= ' (<a href="' . esc_url( $url ) . '" target="_blank">' . esc_html( $transaction_id ) . '</a>)';
										}
									}

									$to_add                 = $to_add ?? ' (' . esc_html( $transaction_id ) . ')';
									$payment_method_string .= $to_add;
								}

								$meta_list[] = $payment_method_string;
							}

							if ( $order->get_date_paid() ) {
								$meta_list[] = sprintf(
									/* translators: 1: date 2: time */
									__( 'Paid on %1$s @ %2$s', 'poocommerce' ),
									wc_format_datetime( $order->get_date_paid() ),
									wc_format_datetime( $order->get_date_paid(), get_option( 'time_format' ) )
								);
							}

							$ip_address = $order->get_customer_ip_address();
							if ( $ip_address ) {
								$meta_list[] = sprintf(
									/* translators: %s: IP address */
									__( 'Customer IP: %s', 'poocommerce' ),
									'<span class="poocommerce-Order-customerIP">' . esc_html( $ip_address ) . '</span>'
								);
							}

							echo wp_kses_post( implode( '. ', $meta_list ) );

							?>
						</p>
					</div>
					<div class="order_data_header_column">
						<?php
							/**
							 * Hook allowing extenders to render custom content
							 * besides the Order header.
							 *
							 * @param $order WC_Order The order object being displayed.
							 * @since 9.9.0
							 */
							do_action( 'poocommerce_admin_order_data_header_right', $order );
						?>
					</div>
				</div>
				<?php
					/**
					 * Hook allowing extenders to render custom content
					 * within the Order details box.
					 *
					 * This allows urgent notices or other important
					 * order-related info to be displayed upfront in
					 * the order page. Example: display a notice if
					 * the order is disputed.
					 *
					 * @param $order WC_Order The order object being displayed.
					 * @since 7.9.0
					 */
					do_action( 'poocommerce_admin_order_data_after_payment_info', $order );
				?>
				<div class="order_data_column_container">
					<div class="order_data_column">
						<h3><?php esc_html_e( 'General', 'poocommerce' ); ?></h3>

						<p class="form-field form-field-wide">
							<?php
							$order_date_created_localised = ! is_null( $order->get_date_created() ) ? $order->get_date_created()->getOffsetTimestamp() : '';
							?>
							<label for="order_date"><?php esc_html_e( 'Date created:', 'poocommerce' ); ?></label>
							<input type="text" class="date-picker" name="order_date" maxlength="10" value="<?php echo esc_attr( date_i18n( 'Y-m-d', $order_date_created_localised ) ); ?>" pattern="<?php echo esc_attr( apply_filters( 'poocommerce_date_input_html_pattern', '[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])' ) ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment ?>" />@
							&lrm;
							<input type="number" class="hour" placeholder="<?php esc_attr_e( 'h', 'poocommerce' ); ?>" name="order_date_hour" min="0" max="23" step="1" value="<?php echo esc_attr( date_i18n( 'H', $order_date_created_localised ) ); ?>" pattern="([01]?[0-9]{1}|2[0-3]{1})" />:
							<input type="number" class="minute" placeholder="<?php esc_attr_e( 'm', 'poocommerce' ); ?>" name="order_date_minute" min="0" max="59" step="1" value="<?php echo esc_attr( date_i18n( 'i', $order_date_created_localised ) ); ?>" pattern="[0-5]{1}[0-9]{1}" />
							<input type="hidden" name="order_date_second" value="<?php echo esc_attr( date_i18n( 's', $order_date_created_localised ) ); ?>" />
						</p>

						<p class="form-field form-field-wide wc-order-status">
							<label for="order_status">
								<?php
								esc_html_e( 'Status:', 'poocommerce' );
								if ( $order->needs_payment() ) {
									printf(
										'<a href="%s">%s</a>',
										esc_url( $order->get_checkout_payment_url() ),
										esc_html__( 'Customer payment page &rarr;', 'poocommerce' )
									);
								}
								?>
							</label>
							<select id="order_status" name="order_status" class="wc-enhanced-select">
								<?php
								$statuses = wc_get_order_statuses();
								foreach ( $statuses as $status => $status_name ) {
									echo '<option value="' . esc_attr( $status ) . '" ' . selected( $status, 'wc-' . $order->get_status( 'edit' ), false ) . '>' . esc_html( $status_name ) . '</option>';
								}
								?>
							</select>
						</p>

						<p class="form-field form-field-wide wc-customer-user">
							<!--email_off--> <!-- Disable CloudFlare email obfuscation -->
							<label for="customer_user">
								<?php
								esc_html_e( 'Customer:', 'poocommerce' );
								if ( $order->get_user_id( 'edit' ) ) {
									$args = array(
										'post_status'    => 'all',
										'post_type'      => 'shop_order',
										'_customer_user' => $order->get_user_id( 'edit' ),
									);
									printf(
										'<a href="%s">%s</a>',
										esc_url( add_query_arg( $args, admin_url( 'edit.php' ) ) ),
										' ' . esc_html__( 'View other orders &rarr;', 'poocommerce' )
									);
									printf(
										'<a href="%s">%s</a>',
										esc_url( add_query_arg( 'user_id', $order->get_user_id( 'edit' ), admin_url( 'user-edit.php' ) ) ),
										' ' . esc_html__( 'Profile &rarr;', 'poocommerce' )
									);
								}
								?>
							</label>
							<?php
							$user_string = '';
							$user_id     = '';
							if ( $order->get_user_id() ) {
								$user_id = absint( $order->get_user_id() );
								$user    = Users::get_user_in_current_site( $user_id );

								if ( ! is_wp_error( $user ) ) {
									$customer = new WC_Customer( $user_id );
									/* translators: 1: user display name 2: user ID 3: user email */
									$user_string = sprintf(
									/* translators: 1: customer name, 2 customer id, 3: customer email */
										esc_html__( '%1$s (#%2$s &ndash; %3$s)', 'poocommerce' ),
										$customer->get_first_name() . ' ' . $customer->get_last_name(),
										$customer->get_id(),
										$customer->get_email()
									);
								} else {
									// print customer not available in the current site.
									$user_string = esc_html__( '(Not available)', 'poocommerce' );
								}
							}
							?>
							<select class="wc-customer-search" id="customer_user" name="customer_user" data-placeholder="<?php esc_attr_e( 'Guest', 'poocommerce' ); ?>" data-allow_clear="true">
								<?php
								// phpcs:disable PooCommerce.Commenting.CommentHooks.MissingHookComment
								/**
								 * Filter to customize the display of the currently selected customer for an order in the order edit page.
								 * This is the same filter used in the ajax call for customer search in the same metabox.
								 *
								 * @since 7.2.0 (this instance of the filter)
								 *
								 * @param array @user_info An array containing one item with the name and email of the user currently selected as the customer for the order.
								 */
								?>
								<option value="<?php echo esc_attr( $user_id ); ?>" selected="selected"><?php echo esc_html( htmlspecialchars( wp_kses_post( current( apply_filters( 'poocommerce_json_search_found_customers', array( $user_string ) ) ) ) ) ); ?></option>
								<?php // phpcs:enable PooCommerce.Commenting.CommentHooks.MissingHookComment ?>
							</select>
							<!--/email_off-->
						</p>
						<?php do_action( 'poocommerce_admin_order_data_after_order_details', $order ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment ?>
					</div>
					<div class="order_data_column">
						<h3>
							<?php esc_html_e( 'Billing', 'poocommerce' ); ?>
							<a href="#" class="edit_address"><?php esc_html_e( 'Edit', 'poocommerce' ); ?></a>
							<span>
								<a href="#" class="load_customer_billing" style="display:none;"><?php esc_html_e( 'Load billing address', 'poocommerce' ); ?></a>
							</span>
						</h3>
						<div class="address">
							<?php
							// Display values.
							$user = Users::get_user_in_current_site( $order->get_user_id() );

							$details_not_available_message = __( 'Details are not available for this customer as this user does not exist in the current site.', 'poocommerce' );
							// If the user is not a guest and is not a valid user in the current site, print details not available.
							if ( $order->get_user_id() !== 0 && is_wp_error( $user ) ) {
								echo '<p>' . esc_html( $details_not_available_message ) . '</p>';
							} else {
								if ( $order->get_formatted_billing_address() ) {
									echo '<p>' . wp_kses( $order->get_formatted_billing_address(), array( 'br' => array() ) ) . '</p>';
								} else {
									echo '<p class="none_set"><strong>' . esc_html__( 'Address:', 'poocommerce' ) . '</strong> ' . esc_html__( 'No billing address set.', 'poocommerce' ) . '</p>';
								}

								$billing_fields = self::get_billing_fields( $order, 'view' );

								foreach ( $billing_fields as $key => $field ) {
									if ( isset( $field['show'] ) && false === $field['show'] ) {
										continue;
									}

									$field_name = 'billing_' . $key;

									if ( isset( $field['value'] ) ) {
										$field_value = $field['value'];
									} elseif ( is_callable( array( $order, 'get_' . $field_name ) ) ) {
										$field_value = $order->{"get_$field_name"}( 'edit' );
									} else {
										$field_value = $order->get_meta( '_' . $field_name );
									}

									if ( 'billing_phone' === $field_name ) {
										$field_value = wc_make_phone_clickable( $field_value );
									} elseif ( 'billing_email' === $field_name ) {
										$field_value = '<a href="' . esc_url( 'mailto:' . $field_value ) . '">' . $field_value . '</a>';
									} else {
										$field_value = make_clickable( esc_html( $field_value ) );
									}

									if ( $field_value || '0' === $field_value ) {
										echo '<p><strong>' . esc_html( $field['label'] ) . ':</strong> ' . wp_kses_post( $field_value ) . '</p>';
									}
								}
							}
							?>
						</div>

						<div class="edit_address">
							<?php
							// Display form.
							$billing_fields = self::get_billing_fields( $order, 'edit' );

							foreach ( $billing_fields as $key => $field ) {
								if ( ! isset( $field['type'] ) ) {
									$field['type'] = 'text';
								}
								if ( ! isset( $field['id'] ) ) {
									$field['id'] = '_billing_' . $key;
								}

								$field_name = 'billing_' . $key;

								// Check if the user is a valid user in the current site.
								// If not, set the value to an empty string.
								// This is to prevent the user from being able to view the billing address of a user that does not exist.
								// If the user is not a guest and is not a valid user in the current site, print details not available.
								if ( $order->get_user_id() !== 0 && is_wp_error( $user ) ) {
									$field['value'] = '';
								} elseif ( ! isset( $field['value'] ) ) {
									if ( is_callable( array( $order, 'get_' . $field_name ) ) ) {
										$field['value'] = $order->{"get_$field_name"}( 'edit' );
									} else {
										$field['value'] = $order->get_meta( '_' . $field_name );
									}
								}

								switch ( $field['type'] ) {
									case 'select':
										poocommerce_wp_select( $field, $order );
										break;
									case 'checkbox':
										poocommerce_wp_checkbox( $field, $order );
										break;
									default:
										poocommerce_wp_text_input( $field, $order );
										break;
								}
							}
							?>
							<p class="form-field form-field-wide">
								<label><?php esc_html_e( 'Payment method:', 'poocommerce' ); ?></label>
								<select name="_payment_method" id="_payment_method" class="first">
									<option value=""><?php esc_html_e( 'N/A', 'poocommerce' ); ?></option>
									<?php
									$found_method = false;

									foreach ( $payment_gateways as $gateway ) {
										if ( 'yes' === $gateway->enabled ) {
											echo '<option value="' . esc_attr( $gateway->id ) . '" ' . selected( $payment_method, $gateway->id, false ) . '>' . esc_html( $gateway->get_title() ) . '</option>';
											if ( $payment_method === $gateway->id ) {
												$found_method = true;
											}
										}
									}

									if ( ! $found_method && ! empty( $payment_method ) ) {
										echo '<option value="' . esc_attr( $payment_method ) . '" selected="selected">' . esc_html__( 'Other', 'poocommerce' ) . '</option>';
									} else {
										echo '<option value="other">' . esc_html__( 'Other', 'poocommerce' ) . '</option>';
									}
									?>
								</select>
							</p>
							<?php

							poocommerce_wp_text_input(
								array(
									'id'    => '_transaction_id',
									'label' => __( 'Transaction ID', 'poocommerce' ),
									'value' => $order->get_transaction_id( 'edit' ),
								),
								$order
							);
							?>

						</div>
						<?php do_action( 'poocommerce_admin_order_data_after_billing_address', $order ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment ?>
					</div>
					<div class="order_data_column">
						<h3>
							<?php esc_html_e( 'Shipping', 'poocommerce' ); ?>
							<a href="#" class="edit_address"><?php esc_html_e( 'Edit', 'poocommerce' ); ?></a>
							<span>
								<a href="#" class="load_customer_shipping" style="display:none;"><?php esc_html_e( 'Load shipping address', 'poocommerce' ); ?></a>
								<a href="#" class="billing-same-as-shipping" style="display:none;"><?php esc_html_e( 'Copy billing address', 'poocommerce' ); ?></a>
							</span>
						</h3>
						<div class="address">
							<?php
							// Display values.
							// If the user is not a guest and is not a valid user in the current site, print details not available.
							if ( $order->get_user_id() !== 0 && is_wp_error( $user ) ) {
								echo '<p>' . esc_html( $details_not_available_message ) . '</p>';
							} else {
								if ( $order->get_formatted_shipping_address() ) {
									echo '<p>' . wp_kses( $order->get_formatted_shipping_address(), array( 'br' => array() ) ) . '</p>';
								} else {
									echo '<p class="none_set"><strong>' . esc_html__( 'Address:', 'poocommerce' ) . '</strong> ' . esc_html__( 'No shipping address set.', 'poocommerce' ) . '</p>';
								}

								$shipping_fields = self::get_shipping_fields( $order, 'view' );

								if ( ! empty( $shipping_fields ) ) {
									foreach ( $shipping_fields as $key => $field ) {
										if ( isset( $field['show'] ) && false === $field['show'] ) {
											continue;
										}

										$field_name = 'shipping_' . $key;

										if ( isset( $field['value'] ) ) {
											$field_value = $field['value'];
										} elseif ( is_callable( array( $order, 'get_' . $field_name ) ) ) {
											$field_value = $order->{"get_$field_name"}( 'edit' );
										} else {
											$field_value = $order->get_meta( '_' . $field_name );
										}

										if ( 'shipping_phone' === $field_name ) {
											$field_value = wc_make_phone_clickable( $field_value );
										}

										if ( $field_value || '0' === $field_value ) {
											echo '<p><strong>' . esc_html( $field['label'] ) . ':</strong> ' . wp_kses_post( $field_value ) . '</p>';
										}
									}
								}

								if ( apply_filters( 'poocommerce_enable_order_notes_field', 'yes' === get_option( 'poocommerce_enable_order_comments', 'yes' ) ) && $order->get_customer_note() ) { // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
									echo '<p class="order_note"><strong>' . esc_html( __( 'Customer provided note:', 'poocommerce' ) ) . '</strong> ' . wp_kses( nl2br( esc_html( wc_wptexturize_order_note( $order->get_customer_note() ) ) ), array( 'br' => array() ) ) . '</p>';
								}
							}
							?>
						</div>
						<div class="edit_address">
							<?php
							// Display form.
							$shipping_fields = self::get_shipping_fields( $order, 'edit' );

							if ( ! empty( $shipping_fields ) ) {
								foreach ( $shipping_fields as $key => $field ) {
									if ( ! isset( $field['type'] ) ) {
										$field['type'] = 'text';
									}
									if ( ! isset( $field['id'] ) ) {
										$field['id'] = '_shipping_' . $key;
									}

									$field_name = 'shipping_' . $key;

									// Check if the user is a valid user in the current site.
									// If not, set the value to an empty string.
									// This is to prevent the user from being able to view the shipping address of a user that does not exist.
									// If the user is not a guest and is not a valid user in the current site, print details not available.
									if ( $order->get_user_id() !== 0 && is_wp_error( $user ) ) {
										$field['value'] = '';
									} elseif ( ! isset( $field['value'] ) ) {
										if ( is_callable( array( $order, 'get_' . $field_name ) ) ) {
											$field['value'] = $order->{"get_$field_name"}( 'edit' );
										} else {
											$field['value'] = $order->get_meta( '_' . $field_name );
										}
									}

									switch ( $field['type'] ) {
										case 'select':
											poocommerce_wp_select( $field, $order );
											break;
										case 'checkbox':
											poocommerce_wp_checkbox( $field, $order );
											break;
										default:
											poocommerce_wp_text_input( $field, $order );
											break;
									}
								}
							}

							/**
							 * Allows 3rd parties to alter whether the customer note should be displayed on the admin.
							 *
							 * @since 2.1.0
							 *
							 * @param bool TRUE if the note should be displayed. FALSE otherwise.
							 */
							if ( apply_filters( 'poocommerce_enable_order_notes_field', 'yes' === get_option( 'poocommerce_enable_order_comments', 'yes' ) ) ) :
								?>
								<p class="form-field form-field-wide">
									<label for="customer_note"><?php esc_html_e( 'Customer provided note', 'poocommerce' ); ?>:</label>
									<textarea rows="1" cols="40" name="customer_note" tabindex="6" id="excerpt" placeholder="<?php esc_attr_e( 'Customer notes about the order', 'poocommerce' ); ?>"><?php echo wp_kses( $order->get_customer_note(), array( 'br' => array() ) ); ?></textarea>
								</p>
							<?php endif; ?>
						</div>

						<?php do_action( 'poocommerce_admin_order_data_after_shipping_address', $order ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment ?>
					</div>
				</div>
				<div class="clear"></div>
			</div>
		</div>
		<?php
	}

	/**
	 * Save meta box data.
	 *
	 * @param int $order_id Order ID.
	 * @throws Exception Required request data is missing.
	 */
	public static function save( $order_id ) {
		// phpcs:disable WordPress.Security.NonceVerification.Missing

		if ( ! isset( $_POST['order_status'] ) ) {
			throw new Exception( __( 'Order status is missing.', 'poocommerce' ), 400 );
		}

		if ( ! isset( $_POST['_payment_method'] ) ) {
			throw new Exception( __( 'Payment method is missing.', 'poocommerce' ), 400 );
		}

		// Ensure gateways are loaded in case they need to insert data into the emails.
		WC()->payment_gateways();
		WC()->shipping();

		// Get order object.
		$order = wc_get_order( $order_id );
		$props = array();

		// Create order key.
		if ( ! $order->get_order_key() ) {
			$props['order_key'] = wc_generate_order_key();
		}

		// Update customer.
		$customer_id = isset( $_POST['customer_user'] ) ? absint( $_POST['customer_user'] ) : 0;

		$selected_customer = Users::get_user_in_current_site( $customer_id );

		// Only update the customer ID if it's a guest (0) or if it's a different customer that exists in the current site.
		// If the customer doesn't exist in the current site (is_wp_error), we won't update the customer ID.
		$is_valid_guest_or_new_customer = $customer_id !== $order->get_customer_id() && ( 0 === $customer_id || ! is_wp_error( $selected_customer ) );
		if ( $is_valid_guest_or_new_customer ) {
			$props['customer_id'] = $customer_id;
		}

		// Update billing fields.
		$billing_fields = self::get_billing_fields( $order, 'edit' );

		// Only update billing fields if the order is for a valid user in the current site.
		// This is to prevent the user from being able to update the billing address of a user that does not exist in the current site.
		$save_metadata_for_guest_user_or_a_valid_user = 0 === $customer_id || ! is_wp_error( $selected_customer );

		if ( ! empty( $billing_fields ) && $save_metadata_for_guest_user_or_a_valid_user ) {
			foreach ( $billing_fields as $key => $field ) {
				if ( ! isset( $field['id'] ) ) {
					$field['id'] = '_billing_' . $key;
				}

				if ( ! isset( $_POST[ $field['id'] ] ) ) {
					continue;
				}

				$value = wc_clean( wp_unslash( $_POST[ $field['id'] ] ) );

				// Update a field if it includes an update callback.
				if ( isset( $field['update_callback'] ) ) {
					call_user_func( $field['update_callback'], $field['id'], $value, $order );
				} elseif ( is_callable( array( $order, 'set_billing_' . $key ) ) ) {
					$props[ 'billing_' . $key ] = $value;
				} else {
					$order->update_meta_data( $field['id'], $value );
				}
			}
		}

		// Update shipping fields.
		$shipping_fields = self::get_shipping_fields( $order, 'edit' );

		// Only update shipping fields if the order is for a valid user in the current site.
		// This is to prevent the user from being able to update the shipping address of a user that does not exist in the current site.
		if ( ! empty( $shipping_fields ) && $save_metadata_for_guest_user_or_a_valid_user ) {
			foreach ( $shipping_fields as $key => $field ) {
				if ( ! isset( $field['id'] ) ) {
					$field['id'] = '_shipping_' . $key;
				}

				if ( ! isset( $_POST[ $field['id'] ] ) ) {
					continue;
				}

				$value = isset( $_POST[ $field['id'] ] ) ? wc_clean( wp_unslash( $_POST[ $field['id'] ] ) ) : '';

				// Update a field if it includes an update callback.
				if ( isset( $field['update_callback'] ) ) {
					call_user_func( $field['update_callback'], $field['id'], $value, $order );
				} elseif ( is_callable( array( $order, 'set_shipping_' . $key ) ) ) {
					$props[ 'shipping_' . $key ] = $value;
				} else {
					$order->update_meta_data( $field['id'], $value );
				}
			}
		}

		if ( isset( $_POST['_transaction_id'] ) ) {
			$props['transaction_id'] = wc_clean( wp_unslash( $_POST['_transaction_id'] ) );
		}

		// Payment method handling.
		if ( $order->get_payment_method() !== wc_clean( wp_unslash( $_POST['_payment_method'] ) ) ) {
			$methods              = WC()->payment_gateways->payment_gateways();
			$payment_method       = wc_clean( wp_unslash( $_POST['_payment_method'] ) );
			$payment_method_title = $payment_method;

			if ( isset( $methods ) && isset( $methods[ $payment_method ] ) ) {
				$payment_method_title = $methods[ $payment_method ]->get_title();
			}

			if ( 'other' === $payment_method ) {
				$payment_method_title = esc_html__( 'Other', 'poocommerce' );
			}

			$props['payment_method']       = $payment_method;
			$props['payment_method_title'] = $payment_method_title;
		}

		// Update date.
		if ( empty( $_POST['order_date'] ) ) {
			$date = time();
		} else {
			if ( ! isset( $_POST['order_date_hour'] ) || ! isset( $_POST['order_date_minute'] ) || ! isset( $_POST['order_date_second'] ) ) {
				throw new Exception( __( 'Order date, hour, minute and/or second are missing.', 'poocommerce' ), 400 );
			}
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			$date = gmdate( 'Y-m-d H:i:s', strtotime( $_POST['order_date'] . ' ' . (int) $_POST['order_date_hour'] . ':' . (int) $_POST['order_date_minute'] . ':' . (int) $_POST['order_date_second'] ) );
		}

		$props['date_created'] = $date;

		// Set created via prop if new post.
		if ( isset( $_POST['original_post_status'] ) && OrderStatus::AUTO_DRAFT === $_POST['original_post_status'] ) {
			$props['created_via'] = 'admin';
		}

		// Customer note.
		if ( isset( $_POST['customer_note'] ) ) {
			$props['customer_note'] = sanitize_textarea_field( wp_unslash( $_POST['customer_note'] ) );
		}

		// Save order data.
		$order->set_props( $props );
		$order->set_status( wc_clean( wp_unslash( $_POST['order_status'] ) ), '', true );
		$order->save();

		// phpcs:enable WordPress.Security.NonceVerification.Missing
	}
}
