<?php
/**
 * Class WC_Gateway_BACS file.
 *
 * @package PooCommerce\Gateways
 */

use Automattic\PooCommerce\Enums\OrderStatus;
use Automattic\PooCommerce\Internal\Admin\Settings\Utils as SettingsUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Bank Transfer Payment Gateway.
 *
 * Provides a Bank Transfer Payment Gateway. Based on code by Mike Pepper.
 *
 * @class       WC_Gateway_BACS
 * @extends     WC_Payment_Gateway
 * @version     2.1.0
 * @package     PooCommerce\Classes\Payment
 */
class WC_Gateway_BACS extends WC_Payment_Gateway {

	/**
	 * Unique ID for this gateway.
	 *
	 * @var string
	 */
	const ID = 'bacs';

	/**
	 * Array of locales
	 *
	 * @var array
	 */
	public $locale;

	/**
	 * Gateway instructions that will be added to the thank you page and emails.
	 *
	 * @var string
	 */
	public $instructions;

	/**
	 * Account details.
	 *
	 * @var array
	 */
	public $account_details;

	/**
	 * Constructor for the gateway.
	 */
	public function __construct() {

		$this->id                 = self::ID;
		$this->icon               = apply_filters( 'poocommerce_bacs_icon', '' );
		$this->has_fields         = false;
		$this->method_title       = __( 'Direct bank transfer', 'poocommerce' );
		$this->method_description = __( 'Take payments in person via BACS. More commonly known as direct bank/wire transfer.', 'poocommerce' );

		// Load the settings.
		$this->init_form_fields();
		$this->init_settings();

		// Define user set variables.
		$this->title        = $this->get_option( 'title' );
		$this->description  = $this->get_option( 'description' );
		$this->instructions = $this->get_option( 'instructions' );

		// BACS account fields shown on the thanks page and in emails.
		$this->account_details = get_option(
			'poocommerce_bacs_accounts',
			array(
				array(
					'account_name'   => $this->get_option( 'account_name' ),
					'account_number' => $this->get_option( 'account_number' ),
					'sort_code'      => $this->get_option( 'sort_code' ),
					'bank_name'      => $this->get_option( 'bank_name' ),
					'iban'           => $this->get_option( 'iban' ),
					'bic'            => $this->get_option( 'bic' ),
				),
			)
		);

		// Actions.
		add_action( 'poocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'poocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'save_account_details' ) );
		add_action( 'poocommerce_thankyou_bacs', array( $this, 'thankyou_page' ) );

		// Customer Emails.
		add_action( 'poocommerce_email_before_order_table', array( $this, 'email_instructions' ), 10, 3 );
	}

	/**
	 * Initialise Gateway Settings Form Fields.
	 */
	public function init_form_fields() {

		$this->form_fields = array(
			'enabled'         => array(
				'title'   => __( 'Enable/Disable', 'poocommerce' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable bank transfer', 'poocommerce' ),
				'default' => 'no',
			),
			'title'           => array(
				'title'       => __( 'Title', 'poocommerce' ),
				'type'        => 'safe_text',
				'description' => __( 'This controls the title which the user sees during checkout.', 'poocommerce' ),
				'default'     => __( 'Direct bank transfer', 'poocommerce' ),
				'desc_tip'    => true,
			),
			'description'     => array(
				'title'       => __( 'Description', 'poocommerce' ),
				'type'        => 'textarea',
				'description' => __( 'Payment method description that the customer will see on your checkout.', 'poocommerce' ),
				'default'     => __( 'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.', 'poocommerce' ),
				'desc_tip'    => true,
			),
			'instructions'    => array(
				'title'       => __( 'Instructions', 'poocommerce' ),
				'type'        => 'textarea',
				'description' => __( 'Instructions that will be added to the thank you page and emails.', 'poocommerce' ),
				'default'     => '',
				'desc_tip'    => true,
			),
			'account_details' => array(
				'type' => 'account_details',
			),
		);
	}

	/**
	 * Generate account details html.
	 *
	 * @return string
	 */
	public function generate_account_details_html() {

		ob_start();

		$country = WC()->countries->get_base_country();
		$locale  = $this->get_country_locale();

		// Get sortcode label in the $locale array and use appropriate one.
		$sortcode = isset( $locale[ $country ]['sortcode']['label'] ) ? $locale[ $country ]['sortcode']['label'] : __( 'Sort code', 'poocommerce' );

		?>
		<tr valign="top">
			<th scope="row" class="titledesc">
				<label>
					<?php esc_html_e( 'Account details:', 'poocommerce' ); ?>
					<?php echo wp_kses_post( wc_help_tip( __( 'These account details will be displayed within the order thank you page and confirmation email.', 'poocommerce' ) ) ); ?>
				</label>
			</th>
			<td class="forminp" id="bacs_accounts">
				<div class="wc_input_table_wrapper">
					<table class="widefat wc_input_table sortable" cellspacing="0">
						<thead>
							<tr>
								<th class="sort">&nbsp;</th>
								<th><?php esc_html_e( 'Account name', 'poocommerce' ); ?></th>
								<th><?php esc_html_e( 'Account number', 'poocommerce' ); ?></th>
								<th><?php esc_html_e( 'Bank name', 'poocommerce' ); ?></th>
								<th><?php echo esc_html( $sortcode ); ?></th>
								<th><?php esc_html_e( 'IBAN', 'poocommerce' ); ?></th>
								<th><?php esc_html_e( 'BIC / Swift', 'poocommerce' ); ?></th>
							</tr>
						</thead>
						<tbody class="accounts">
							<?php
							$i = -1;
							if ( $this->account_details ) {
								foreach ( $this->account_details as $account ) {
									++$i;

									echo '<tr class="account">
										<td class="sort"></td>
										<td><input type="text" value="' . esc_attr( wp_unslash( $account['account_name'] ) ) . '" name="bacs_account_name[' . esc_attr( $i ) . ']" /></td>
										<td><input type="text" value="' . esc_attr( $account['account_number'] ) . '" name="bacs_account_number[' . esc_attr( $i ) . ']" /></td>
										<td><input type="text" value="' . esc_attr( wp_unslash( $account['bank_name'] ) ) . '" name="bacs_bank_name[' . esc_attr( $i ) . ']" /></td>
										<td><input type="text" value="' . esc_attr( $account['sort_code'] ) . '" name="bacs_sort_code[' . esc_attr( $i ) . ']" /></td>
										<td><input type="text" value="' . esc_attr( $account['iban'] ) . '" name="bacs_iban[' . esc_attr( $i ) . ']" /></td>
										<td><input type="text" value="' . esc_attr( $account['bic'] ) . '" name="bacs_bic[' . esc_attr( $i ) . ']" /></td>
									</tr>';
								}
							}
							?>
						</tbody>
						<tfoot>
							<tr>
								<th colspan="7"><a href="#" class="add button"><?php esc_html_e( '+ Add account', 'poocommerce' ); ?></a> <a href="#" class="remove_rows button"><?php esc_html_e( 'Remove selected account(s)', 'poocommerce' ); ?></a></th>
							</tr>
						</tfoot>
					</table>
				</div>
				<script type="text/javascript">
					jQuery(function() {
						jQuery('#bacs_accounts').on( 'click', 'a.add', function(){

							var size = jQuery('#bacs_accounts').find('tbody .account').length;

							jQuery('<tr class="account">\
									<td class="sort"></td>\
									<td><input type="text" name="bacs_account_name[' + size + ']" /></td>\
									<td><input type="text" name="bacs_account_number[' + size + ']" /></td>\
									<td><input type="text" name="bacs_bank_name[' + size + ']" /></td>\
									<td><input type="text" name="bacs_sort_code[' + size + ']" /></td>\
									<td><input type="text" name="bacs_iban[' + size + ']" /></td>\
									<td><input type="text" name="bacs_bic[' + size + ']" /></td>\
								</tr>').appendTo('#bacs_accounts table tbody');

							return false;
						});
					});
				</script>
			</td>
		</tr>
		<?php
		return ob_get_clean();
	}

	/**
	 * Save account details table.
	 */
	public function save_account_details() {

		$accounts = array();

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Nonce verification already handled in WC_Admin_Settings::save()
		if ( isset( $_POST['bacs_account_name'] ) && isset( $_POST['bacs_account_number'] ) && isset( $_POST['bacs_bank_name'] )
			&& isset( $_POST['bacs_sort_code'] ) && isset( $_POST['bacs_iban'] ) && isset( $_POST['bacs_bic'] ) ) {

			$account_names   = wc_clean( wp_unslash( $_POST['bacs_account_name'] ) );
			$account_numbers = wc_clean( wp_unslash( $_POST['bacs_account_number'] ) );
			$bank_names      = wc_clean( wp_unslash( $_POST['bacs_bank_name'] ) );
			$sort_codes      = wc_clean( wp_unslash( $_POST['bacs_sort_code'] ) );
			$ibans           = wc_clean( wp_unslash( $_POST['bacs_iban'] ) );
			$bics            = wc_clean( wp_unslash( $_POST['bacs_bic'] ) );

			foreach ( $account_names as $i => $name ) {
				if ( ! isset( $account_names[ $i ] ) ) {
					continue;
				}

				$accounts[] = array(
					'account_name'   => $account_names[ $i ],
					'account_number' => $account_numbers[ $i ],
					'bank_name'      => $bank_names[ $i ],
					'sort_code'      => $sort_codes[ $i ],
					'iban'           => $ibans[ $i ],
					'bic'            => $bics[ $i ],
				);
			}
		}
		// phpcs:enable

		do_action( 'poocommerce_update_option', array( 'id' => 'poocommerce_bacs_accounts' ) );
		update_option( 'poocommerce_bacs_accounts', $accounts );
	}

	/**
	 * Output for the order received page.
	 *
	 * @param int $order_id Order ID.
	 */
	public function thankyou_page( $order_id ) {

		if ( $this->instructions ) {
			echo wp_kses_post( wpautop( wptexturize( wp_kses_post( $this->instructions ) ) ) );
		}
		$this->bank_details( $order_id );
	}

	/**
	 * Add content to the WC emails.
	 *
	 * @param WC_Order $order Order object.
	 * @param bool     $sent_to_admin Sent to admin.
	 * @param bool     $plain_text Email format: plain text or HTML.
	 */
	public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
		if ( ! $sent_to_admin && self::ID === $order->get_payment_method() ) {
			/**
			 * Filter the email instructions order status.
			 *
			 * @since 7.4
			 *
			 * @param string $terms The order status.
			 * @param object $order The order object.
			 */
			$instructions_order_status = apply_filters( 'poocommerce_bacs_email_instructions_order_status', OrderStatus::ON_HOLD, $order );
			if ( $order->has_status( $instructions_order_status ) ) {
				if ( $this->instructions ) {
					echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) . PHP_EOL );
				}
				$this->bank_details( $order->get_id() );
			}
		}
	}

	/**
	 * Get bank details and place into a list format.
	 *
	 * @param int $order_id Order ID.
	 */
	private function bank_details( $order_id = '' ) {

		if ( empty( $this->account_details ) ) {
			return;
		}

		// Get order and store in $order.
		$order = wc_get_order( $order_id );

		// Get the order country and country $locale.
		$country = $order->get_billing_country();
		$locale  = $this->get_country_locale();

		// Get sortcode label in the $locale array and use appropriate one.
		$sortcode = isset( $locale[ $country ]['sortcode']['label'] ) ? $locale[ $country ]['sortcode']['label'] : __( 'Sort code', 'poocommerce' );

		$bacs_accounts = apply_filters( 'poocommerce_bacs_accounts', $this->account_details, $order_id );

		if ( ! empty( $bacs_accounts ) ) {
			$account_html = '';
			$has_details  = false;

			foreach ( $bacs_accounts as $bacs_account ) {
				$bacs_account = (object) $bacs_account;

				if ( $bacs_account->account_name ) {
					$account_html .= '<h3 class="wc-bacs-bank-details-account-name">' . wp_kses_post( wp_unslash( $bacs_account->account_name ) ) . ':</h3>' . PHP_EOL;
				}

				$account_html .= '<ul class="wc-bacs-bank-details order_details bacs_details">' . PHP_EOL;

				// BACS account fields shown on the thanks page and in emails.
				$account_fields = apply_filters(
					'poocommerce_bacs_account_fields',
					array(
						'bank_name'      => array(
							'label' => __( 'Bank', 'poocommerce' ),
							'value' => $bacs_account->bank_name,
						),
						'account_number' => array(
							'label' => __( 'Account number', 'poocommerce' ),
							'value' => $bacs_account->account_number,
						),
						'sort_code'      => array(
							'label' => $sortcode,
							'value' => $bacs_account->sort_code,
						),
						'iban'           => array(
							'label' => __( 'IBAN', 'poocommerce' ),
							'value' => $bacs_account->iban,
						),
						'bic'            => array(
							'label' => __( 'BIC', 'poocommerce' ),
							'value' => $bacs_account->bic,
						),
					),
					$order_id
				);

				foreach ( $account_fields as $field_key => $field ) {
					if ( ! empty( $field['value'] ) ) {
						$account_html .= '<li class="' . esc_attr( $field_key ) . '">' . wp_kses_post( $field['label'] ) . ': <strong>' . wp_kses_post( wptexturize( $field['value'] ) ) . '</strong></li>' . PHP_EOL;
						$has_details   = true;
					}
				}

				$account_html .= '</ul>';
			}

			if ( $has_details ) {
				echo '<section class="poocommerce-bacs-bank-details"><h2 class="wc-bacs-bank-details-heading">' . esc_html__( 'Our bank details', 'poocommerce' ) . '</h2>' . wp_kses_post( PHP_EOL . $account_html ) . '</section>';
			}
		}
	}

	/**
	 * Process the payment and return the result.
	 *
	 * @param int $order_id Order ID.
	 * @return array
	 */
	public function process_payment( $order_id ) {

		$order = wc_get_order( $order_id );

		if ( $order->get_total() > 0 ) {
			/**
			 * Filter the order status for BACS payment.
			 *
			 * @since 3.4.0
			 *
			 * @param string $default_status The default order status.
			 * @param object $order          The order object.
			 */
			$process_payment_status = apply_filters( 'poocommerce_bacs_process_payment_order_status', OrderStatus::ON_HOLD, $order );
			// Mark as on-hold (we're awaiting the payment).
			$order->update_status( $process_payment_status, __( 'Awaiting BACS payment.', 'poocommerce' ) );
		} else {
			$order->payment_complete();
		}

		// Remove cart.
		WC()->cart->empty_cart();

		// Return thankyou redirect.
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}

	/**
	 * Get country locale if localized.
	 *
	 * @return array
	 */
	public function get_country_locale() {

		if ( empty( $this->locale ) ) {

			// Locale information to be used - only those that are not 'Sort Code'.
			$this->locale = apply_filters(
				'poocommerce_get_bacs_locale',
				array(
					'AU' => array(
						'sortcode' => array(
							'label' => __( 'BSB', 'poocommerce' ),
						),
					),
					'CA' => array(
						'sortcode' => array(
							'label' => __( 'Bank transit number', 'poocommerce' ),
						),
					),
					'IN' => array(
						'sortcode' => array(
							'label' => __( 'IFSC', 'poocommerce' ),
						),
					),
					'IT' => array(
						'sortcode' => array(
							'label' => __( 'Branch sort', 'poocommerce' ),
						),
					),
					'NZ' => array(
						'sortcode' => array(
							'label' => __( 'Bank code', 'poocommerce' ),
						),
					),
					'SE' => array(
						'sortcode' => array(
							'label' => __( 'Bank code', 'poocommerce' ),
						),
					),
					'US' => array(
						'sortcode' => array(
							'label' => __( 'Routing number', 'poocommerce' ),
						),
					),
					'ZA' => array(
						'sortcode' => array(
							'label' => __( 'Branch code', 'poocommerce' ),
						),
					),
				)
			);

		}

		return $this->locale;
	}

	/**
	 * Get the settings URL for the gateway.
	 *
	 * @return string The settings page URL for the gateway.
	 */
	public function get_settings_url() {
		$should_use_react_settings_page = $this->is_reactified_settings_page();

		// We must not include both the path and the section query parameter, as this can cause weird behavior.
		return SettingsUtils::wc_payments_settings_url(
			$should_use_react_settings_page ? '/' . WC_Settings_Payment_Gateways::OFFLINE_SECTION_NAME . '/' . $this->id : null,
			$should_use_react_settings_page ? array() : array( 'section' => $this->id )
		);
	}

	/**
	 * Check if the BACS settings page is reactified.
	 *
	 * @return bool Whether the BACS settings page is reactified or not.
	 */
	private function is_reactified_settings_page(): bool {
		// Search for a WC_Settings_Payment_Gateways instance in the settings pages.
		$payments_settings_page = null;
		foreach ( WC_Admin_Settings::get_settings_pages() as $settings_page ) {
			if ( $settings_page instanceof WC_Settings_Payment_Gateways ) {
				$payments_settings_page = $settings_page;
				break;
			}
		}
		// If no instance found, default to reactified.
		if ( empty( $payments_settings_page ) ) {
			return true;
		}

		return $payments_settings_page->should_render_react_section( WC_Settings_Payment_Gateways::BACS_SECTION_NAME );
	}
}
