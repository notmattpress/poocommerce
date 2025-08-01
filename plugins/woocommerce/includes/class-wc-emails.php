<?php
/**
 * Transactional Emails Controller
 *
 * PooCommerce Emails Class which handles the sending on transactional emails and email templates. This class loads in available emails.
 *
 * @package PooCommerce\Classes\Emails
 * @version 2.3.0
 */

declare( strict_types = 1 );

use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Blocks\Package;
use Automattic\PooCommerce\Blocks\Domain\Services\CheckoutFields;
use Automattic\PooCommerce\Enums\ProductType;
use Automattic\PooCommerce\Internal\Fulfillments\Fulfillment;
use Automattic\PooCommerce\Utilities\FeaturesUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Emails class.
 */
class WC_Emails {

	/**
	 * Array of email notification classes
	 *
	 * @var WC_Email[]
	 */
	public $emails = array();

	/**
	 * The single instance of the class
	 *
	 * @var WC_Emails
	 */
	protected static $instance = null;

	/**
	 * Background emailer class.
	 *
	 * @var WC_Background_Emailer
	 */
	protected static $background_emailer = null;

	/**
	 * Main WC_Emails Instance.
	 *
	 * Ensures only one instance of WC_Emails is loaded or can be loaded.
	 *
	 * @since 2.1
	 * @static
	 * @return WC_Emails Main instance
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Cloning is forbidden.
	 *
	 * @since 2.1
	 */
	public function __clone() {
		wc_doing_it_wrong( __FUNCTION__, __( 'Cloning is forbidden.', 'poocommerce' ), '2.1' );
	}

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 2.1
	 */
	public function __wakeup() {
		wc_doing_it_wrong( __FUNCTION__, __( 'Unserializing instances of this class is forbidden.', 'poocommerce' ), '2.1' );
	}

	/**
	 * Hook in all transactional emails.
	 */
	public static function init_transactional_emails() {
		/**
		 * Filter the actions that trigger transactional emails.
		 *
		 * @since 3.0.0
		 * @param array $email_actions Array of actions that trigger transactional emails.
		 */
		$email_actions = apply_filters(
			'poocommerce_email_actions',
			array(
				'poocommerce_low_stock',
				'poocommerce_no_stock',
				'poocommerce_product_on_backorder',
				'poocommerce_order_status_pending_to_processing',
				'poocommerce_order_status_pending_to_completed',
				'poocommerce_order_status_processing_to_cancelled',
				'poocommerce_order_status_pending_to_failed',
				'poocommerce_order_status_pending_to_on-hold',
				'poocommerce_order_status_failed_to_processing',
				'poocommerce_order_status_failed_to_completed',
				'poocommerce_order_status_failed_to_on-hold',
				'poocommerce_order_status_cancelled_to_processing',
				'poocommerce_order_status_cancelled_to_completed',
				'poocommerce_order_status_cancelled_to_on-hold',
				'poocommerce_order_status_on-hold_to_processing',
				'poocommerce_order_status_on-hold_to_cancelled',
				'poocommerce_order_status_on-hold_to_failed',
				'poocommerce_order_status_completed',
				'poocommerce_order_status_failed',
				'poocommerce_order_fully_refunded',
				'poocommerce_order_partially_refunded',
				'poocommerce_new_customer_note',
				'poocommerce_created_customer',
			)
		);

		/**
		 * Filter whether to defer transactional emails.
		 *
		 * @since 3.0.0
		 * @param bool $defer Whether to defer transactional emails.
		 */
		if ( apply_filters( 'poocommerce_defer_transactional_emails', false ) ) {
			self::$background_emailer = new WC_Background_Emailer();

			foreach ( $email_actions as $action ) {
				add_action( $action, array( __CLASS__, 'queue_transactional_email' ), 10, 10 );
			}
		} else {
			foreach ( $email_actions as $action ) {
				add_action( $action, array( __CLASS__, 'send_transactional_email' ), 10, 10 );
			}
		}
	}

	/**
	 * Queues transactional email so it's not sent in current request if enabled,
	 * otherwise falls back to send now.
	 *
	 * @param mixed ...$args Optional arguments.
	 */
	public static function queue_transactional_email( ...$args ) {
		if ( is_a( self::$background_emailer, 'WC_Background_Emailer' ) ) {
			self::$background_emailer->push_to_queue(
				array(
					'filter' => current_filter(),
					'args'   => func_get_args(),
				)
			);
		} else {
			self::send_transactional_email( ...$args );
		}
	}

	/**
	 * Init the mailer instance and call the notifications for the current filter.
	 *
	 * @internal
	 *
	 * @param string $filter Filter name.
	 * @param array  $args Email args (default: []).
	 */
	public static function send_queued_transactional_email( $filter = '', $args = array() ) {
		/**
		 * Filter whether to allow sending queued transactional emails.
		 *
		 * @since 3.0.0
		 * @param bool   $allow Whether to allow sending queued transactional emails.
		 * @param string $filter Filter name.
		 * @param array  $args Email args.
		 */
		if ( apply_filters( 'poocommerce_allow_send_queued_transactional_email', true, $filter, $args ) ) {
			self::instance(); // Init self so emails exist.

			// Ensure gateways are loaded in case they need to insert data into the emails.
			WC()->payment_gateways();
			WC()->shipping();

			// phpcs:disable PooCommerce.Commenting.CommentHooks.MissingSinceComment
			/** This action is documented in includes/class-wc-emails.php in the send_transactional_email method. */
			do_action_ref_array( $filter . '_notification', $args );
		}
	}

	/**
	 * Init the mailer instance and call the notifications for the current filter.
	 *
	 * @internal
	 *
	 * @param array $args Email args (default: []).
	 */
	public static function send_transactional_email( $args = array() ) {
		try {
			$args = func_get_args();
			self::instance(); // Init self so emails exist.

			/**
			 * Action hook for email template classes to trigger the sending of an email.
			 *
			 * The name of the hook is based on the "parent" hook that is currently firing, that this is attached to.
			 * See the WC_Emails::init_transactional_emails method for a list of hooks.
			 *
			 * @since 3.1.0
			 *
			 * @param array $args Args from the parent hook, which may differ depending on the hook.
			 */
			do_action_ref_array( current_filter() . '_notification', $args );
		} catch ( Exception $e ) {
			$error  = 'Transactional email triggered fatal error for callback ' . current_filter();
			$logger = wc_get_logger();
			$logger->critical(
				$error . PHP_EOL,
				array(
					'source' => 'transactional-emails',
				)
			);
			if ( Constants::is_true( 'WP_DEBUG' ) ) {
				trigger_error( esc_html( $error ), E_USER_WARNING ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
			}
		}
	}

	/**
	 * Constructor for the email class hooks in all emails that can be sent.
	 */
	public function __construct() {
		$this->init();

		// Email Header, Footer and content hooks.
		add_action( 'poocommerce_email_header', array( $this, 'email_header' ) );
		add_action( 'poocommerce_email_footer', array( $this, 'email_footer' ) );
		add_action( 'poocommerce_email_order_details', array( $this, 'order_downloads' ), 10, 4 );
		add_action( 'poocommerce_email_order_details', array( $this, 'order_details' ), 10, 4 );
		add_action( 'poocommerce_email_order_meta', array( $this, 'order_meta' ), 10, 3 );
		add_action( 'poocommerce_email_customer_details', array( $this, 'customer_details' ), 10, 3 );
		add_action( 'poocommerce_email_customer_details', array( $this, 'email_addresses' ), 20, 3 );
		add_action( 'poocommerce_email_customer_details', array( $this, 'additional_checkout_fields' ), 30, 3 );
		add_action( 'poocommerce_email_customer_address_section', array( $this, 'additional_address_fields' ), 30, 4 );

		if ( FeaturesUtil::feature_is_enabled( 'fulfillments' ) ) {
			// Fulfillment details and meta.
			add_action( 'poocommerce_email_fulfillment_details', array( $this, 'fulfillment_details' ), 10, 5 );
			add_action( 'poocommerce_email_fulfillment_meta', array( $this, 'fulfillment_meta' ), 30, 4 );
		}

		// Hooks for sending emails during store events.
		add_action( 'poocommerce_low_stock_notification', array( $this, 'low_stock' ) );
		add_action( 'poocommerce_no_stock_notification', array( $this, 'no_stock' ) );
		add_action( 'poocommerce_product_on_backorder_notification', array( $this, 'backorder' ) );
		add_action( 'poocommerce_created_customer_notification', array( $this, 'customer_new_account' ), 10, 3 );

		// Hook for replacing {site_title} in email-footer.
		add_filter( 'poocommerce_email_footer_text', array( $this, 'replace_placeholders' ) );

		/**
		 * Action hook for email classes to hook into.
		 *
		 * @since 3.0.0
		 * @param WC_Emails $this The WC_Emails instance.
		 */
		do_action( 'poocommerce_email', $this );
	}

	/**
	 * Init email classes.
	 */
	public function init() {
		// Include email classes.
		include_once __DIR__ . '/emails/class-wc-email.php';

		$this->emails['WC_Email_New_Order']                 = include __DIR__ . '/emails/class-wc-email-new-order.php';
		$this->emails['WC_Email_Cancelled_Order']           = include __DIR__ . '/emails/class-wc-email-cancelled-order.php';
		$this->emails['WC_Email_Customer_Cancelled_Order']  = include __DIR__ . '/emails/class-wc-email-customer-cancelled-order.php';
		$this->emails['WC_Email_Failed_Order']              = include __DIR__ . '/emails/class-wc-email-failed-order.php';
		$this->emails['WC_Email_Customer_Failed_Order']     = include __DIR__ . '/emails/class-wc-email-customer-failed-order.php';
		$this->emails['WC_Email_Customer_On_Hold_Order']    = include __DIR__ . '/emails/class-wc-email-customer-on-hold-order.php';
		$this->emails['WC_Email_Customer_Processing_Order'] = include __DIR__ . '/emails/class-wc-email-customer-processing-order.php';
		$this->emails['WC_Email_Customer_Completed_Order']  = include __DIR__ . '/emails/class-wc-email-customer-completed-order.php';
		$this->emails['WC_Email_Customer_Refunded_Order']   = include __DIR__ . '/emails/class-wc-email-customer-refunded-order.php';
		$this->emails['WC_Email_Customer_Invoice']          = include __DIR__ . '/emails/class-wc-email-customer-invoice.php';
		$this->emails['WC_Email_Customer_Note']             = include __DIR__ . '/emails/class-wc-email-customer-note.php';
		$this->emails['WC_Email_Customer_Reset_Password']   = include __DIR__ . '/emails/class-wc-email-customer-reset-password.php';
		$this->emails['WC_Email_Customer_New_Account']      = include __DIR__ . '/emails/class-wc-email-customer-new-account.php';

		if ( FeaturesUtil::feature_is_enabled( 'point_of_sale' ) ) {
			$this->emails['WC_Email_Customer_POS_Completed_Order'] = include __DIR__ . '/emails/class-wc-email-customer-pos-completed-order.php';
			$this->emails['WC_Email_Customer_POS_Refunded_Order']  = include __DIR__ . '/emails/class-wc-email-customer-pos-refunded-order.php';
		}

		if ( FeaturesUtil::feature_is_enabled( 'fulfillments' ) ) {
			$this->emails['WC_Email_Customer_Fulfillment_Created'] = include __DIR__ . '/emails/class-wc-email-customer-fulfillment-created.php';
			$this->emails['WC_Email_Customer_Fulfillment_Updated'] = include __DIR__ . '/emails/class-wc-email-customer-fulfillment-updated.php';
			$this->emails['WC_Email_Customer_Fulfillment_Deleted'] = include __DIR__ . '/emails/class-wc-email-customer-fulfillment-deleted.php';
		}

		/**
		 * Filter the email classes.
		 *
		 * @since 3.0.0
		 * @param array $emails Email classes.
		 */
		$this->emails = apply_filters( 'poocommerce_email_classes', $this->emails );
	}

	/**
	 * Return the email classes - used in admin to load settings.
	 *
	 * @return WC_Email[]
	 */
	public function get_emails() {
		return $this->emails;
	}

	/**
	 * Get from name for email.
	 *
	 * @return string
	 */
	public function get_from_name() {
		return wp_specialchars_decode( get_option( 'poocommerce_email_from_name' ), ENT_QUOTES );
	}

	/**
	 * Get from email address.
	 *
	 * @return string
	 */
	public function get_from_address() {
		return sanitize_email( get_option( 'poocommerce_email_from_address' ) );
	}

	/**
	 * Get the email header.
	 *
	 * @param mixed $email_heading Heading for the email.
	 */
	public function email_header( $email_heading ) {
		wc_get_template(
			'emails/email-header.php',
			array(
				'email_heading' => $email_heading,
				'store_name'    => get_bloginfo( 'name', 'display' ),
			)
		);
	}

	/**
	 * Get the email footer.
	 */
	public function email_footer() {
		wc_get_template( 'emails/email-footer.php' );
	}

	/**
	 * Replace placeholder text in strings.
	 *
	 * @since  3.7.0
	 * @param  string $text Email footer text.
	 * @return string       Email footer text with any replacements done.
	 */
	public function replace_placeholders( $text ) {
		$domain = wp_parse_url( home_url(), PHP_URL_HOST );

		return str_replace(
			array(
				'{site_title}',
				'{site_address}',
				'{site_url}',
				'{poocommerce}',
				'{PooCommerce}',
				'{store_address}',
				'{store_email}',
			),
			array(
				$this->get_blogname(),
				$domain,
				$domain,
				'<a href="https://poocommerce.com">PooCommerce</a>',
				'<a href="https://poocommerce.com">PooCommerce</a>',
				$this->get_store_address(),
				$this->get_from_address(),
			),
			$text
		);
	}

	/**
	 * Filter callback to replace {site_title} in email footer
	 *
	 * @since  3.3.0
	 * @deprecated 3.7.0
	 * @param  string $text Email footer text.
	 * @return string       Email footer text with any replacements done.
	 */
	public function email_footer_replace_site_title( $text ) {
		wc_deprecated_function( 'WC_Emails::email_footer_replace_site_title', '3.7.0', 'WC_Emails::replace_placeholders' );
		return $this->replace_placeholders( $text );
	}

	/**
	 * Wraps a message in the poocommerce mail template.
	 *
	 * @param string $email_heading Heading text.
	 * @param string $message       Email message.
	 * @param bool   $deprecated    Deprecated.
	 *
	 * @return string
	 */
	public function wrap_message( $email_heading, $message, $deprecated = false ) {
		if ( $deprecated ) {
			wc_deprecated_argument( 'WC_Emails::wrap_message', '9.9.0' );
		}

		ob_start();

		/**
		 * Action hook for email header.
		 *
		 * @since 3.0.0
		 * @param string $email_heading Heading text.
		 * @param null   $null Unused.
		 */
		do_action( 'poocommerce_email_header', $email_heading, null );

		echo wp_kses_post( wpautop( wptexturize( $message ) ) );

		/**
		 * Action hook for email footer.
		 *
		 * @since 3.0.0
		 * @param null $null Unused.
		 */
		do_action( 'poocommerce_email_footer', null );

		return ob_get_clean();
	}

	/**
	 * Send the email.
	 *
	 * @param mixed  $to          Receiver.
	 * @param mixed  $subject     Email subject.
	 * @param mixed  $message     Message.
	 * @param string $headers     Email headers (default: "Content-Type: text/html\r\n").
	 * @param string $attachments Attachments (default: "").
	 * @return bool
	 */
	public function send( $to, $subject, $message, $headers = "Content-Type: text/html\r\n", $attachments = '' ) {
		$email = new WC_Email();
		return $email->send( $to, $subject, $message, $headers, $attachments );
	}

	/**
	 * Prepare and send the customer invoice email on demand.
	 *
	 * @param int|WC_Order $order Order instance or ID.
	 */
	public function customer_invoice( $order ) {
		$email = $this->emails['WC_Email_Customer_Invoice'];

		if ( ! is_object( $order ) ) {
			$order = wc_get_order( absint( $order ) );
		}

		$email->trigger( $order->get_id(), $order );
	}

	/**
	 * Customer new account welcome email.
	 *
	 * @param int   $customer_id        Customer ID.
	 * @param array $new_customer_data  New customer data.
	 * @param bool  $password_generated If password is generated.
	 */
	public function customer_new_account( $customer_id, $new_customer_data = array(), $password_generated = false ) {
		if ( ! $customer_id ) {
			return;
		}
		$email = $this->emails['WC_Email_Customer_New_Account'];
		$email->trigger( $customer_id, $new_customer_data['user_pass'] ?? '', $password_generated );
	}

	/**
	 * Show the order details table
	 *
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 * @param string   $email         Email address.
	 */
	public function order_details( $order, $sent_to_admin = false, $plain_text = false, $email = '' ) {
		if ( $plain_text ) {
			wc_get_template(
				'emails/plain/email-order-details.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
				)
			);
		} else {
			wc_get_template(
				'emails/email-order-details.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
				)
			);
		}
	}

	/**
	 * Show order downloads in a table.
	 *
	 * @since 3.2.0
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 * @param string   $email         Email address.
	 */
	public function order_downloads( $order, $sent_to_admin = false, $plain_text = false, $email = '' ) {
		$show_downloads = $order->has_downloadable_item() && $order->is_download_permitted() && ! $sent_to_admin && ! is_a( $email, 'WC_Email_Customer_Refunded_Order' );

		if ( ! $show_downloads ) {
			return;
		}

		$downloads = $order->get_downloadable_items();

		/**
		 * Filter the columns of the order downloads table.
		 *
		 * @since 3.2.0
		 * @since 10.0.0 Added $order parameter.
		 * @param array    $columns Array of columns.
		 * @param WC_Order $order  Order object.
		 */
		$columns = apply_filters(
			'poocommerce_email_downloads_columns',
			array(
				'download-product' => __( 'Product', 'poocommerce' ),
				'download-expires' => __( 'Expires', 'poocommerce' ),
				'download-file'    => __( 'Download', 'poocommerce' ),
			),
			$order
		);

		if ( $plain_text ) {
			wc_get_template(
				'emails/plain/email-downloads.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
					'downloads'     => $downloads,
					'columns'       => $columns,
				)
			);
		} else {
			wc_get_template(
				'emails/email-downloads.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
					'downloads'     => $downloads,
					'columns'       => $columns,
				)
			);
		}
	}

	/**
	 * Add order meta to email templates.
	 *
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 */
	public function order_meta( $order, $sent_to_admin = false, $plain_text = false ) {
		/**
		 * Filter the order meta fields.
		 *
		 * @since 3.0.0
		 * @param array    $fields        Array of meta fields.
		 * @param bool     $sent_to_admin If sent to admin.
		 * @param WC_Order $order         Order instance.
		 */
		$fields = apply_filters( 'poocommerce_email_order_meta_fields', array(), $sent_to_admin, $order );

		/**
		 * Deprecated poocommerce_email_order_meta_keys filter.
		 *
		 * @since 2.3.0
		 * @param array    $fields        Array of meta fields.
		 * @param bool     $sent_to_admin If sent to admin.
		 */
		$_fields = apply_filters( 'poocommerce_email_order_meta_keys', array(), $sent_to_admin );

		if ( $_fields ) {
			foreach ( $_fields as $key => $field ) {
				if ( is_numeric( $key ) ) {
					$key = $field;
				}

				$fields[ $key ] = array(
					'label' => wptexturize( $key ),
					'value' => wptexturize( $order->get_meta( $field ) ),
				);
			}
		}

		if ( $fields ) {

			if ( $plain_text ) {

				foreach ( $fields as $field ) {
					if ( isset( $field['label'], $field['value'] ) && $field['value'] ) {
						echo wp_kses_post( $field['label'] . ': ' . $field['value'] ) . "\n"; // WPCS: XSS ok.
					}
				}
			} else {

				foreach ( $fields as $field ) {
					if ( isset( $field['label'], $field['value'] ) && $field['value'] ) {
						echo '<p><strong>' . wp_kses_post( $field['label'] ) . ':</strong> ' . wp_kses_post( $field['value'] ) . '</p>'; // WPCS: XSS ok.
					}
				}
			}
		}
	}

	/**
	 * Show the fulfillment details
	 *
	 * @param WC_Order    $order         Order instance.
	 * @param Fulfillment $fulfillment Fulfillment instance.
	 * @param bool        $sent_to_admin If should sent to admin.
	 * @param bool        $plain_text    If is plain text email.
	 * @param string      $email         Email address.
	 */
	public function fulfillment_details( $order, $fulfillment, $sent_to_admin = false, $plain_text = false, $email = '' ) {
		if ( $plain_text ) {
			wc_get_template(
				'emails/plain/email-fulfillment-details.php',
				array(
					'order'         => $order,
					'fulfillment'   => $fulfillment,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
				)
			);
		} else {
			wc_get_template(
				'emails/email-fulfillment-details.php',
				array(
					'order'         => $order,
					'fulfillment'   => $fulfillment,
					'sent_to_admin' => $sent_to_admin,
					'plain_text'    => $plain_text,
					'email'         => $email,
				)
			);
		}
	}

	/**
	 * Add fulfillment meta to email templates.
	 *
	 * @param WC_Order    $order         Order instance.
	 * @param Fulfillment $fulfillment   Fulfillment instance.
	 * @param bool        $sent_to_admin If should sent to admin.
	 * @param bool        $plain_text    If is plain text email.
	 */
	public function fulfillment_meta( $order, $fulfillment, $sent_to_admin = false, $plain_text = false ) {
		$fields        = $fulfillment->get_meta_data();
		$public_fields = array_filter(
			$fields,
			function ( $field ) {
				return ! str_starts_with( $field->key, '_' );
			}
		);

		if ( 0 < count( $public_fields ) ) {

			foreach ( $public_fields as $field ) {
				if ( isset( $field->key ) && isset( $field->value ) && $field->value ) {
					/**
					 * Allows developers to translate the fulfillment meta key for display in emails.
					 *
					 * @since 10.1.0
					 */
					$meta_key_translation = apply_filters( 'poocommerce_fulfillment_translate_meta_key', $field->key );
					if ( $plain_text ) {
						echo esc_attr( $meta_key_translation ) . ': ' . esc_attr( $field->value ) . PHP_EOL;
					} else {
						echo '<p><strong>' . esc_attr( $meta_key_translation ) . ':</strong> ' . esc_attr( $field->value ) . '</p>';
					}
				}
			}
		}
	}

	/**
	 * Is customer detail field valid?
	 *
	 * @param  array $field Field data to check if is valid.
	 * @return boolean
	 */
	public function customer_detail_field_is_valid( $field ) {
		return isset( $field['label'] ) && ! empty( $field['value'] );
	}

	/**
	 * Allows developers to add additional customer details to templates.
	 *
	 * In versions prior to 3.2 this was used for notes, phone and email but this data has moved.
	 *
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 */
	public function customer_details( $order, $sent_to_admin = false, $plain_text = false ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		/**
		 * Filter the customer details fields.
		 *
		 * @since 3.2.0
		 * @param array    $fields        Array of customer details fields.
		 * @param bool     $sent_to_admin If sent to admin.
		 * @param WC_Order $order         Order instance.
		 */
		$fields = array_filter( apply_filters( 'poocommerce_email_customer_details_fields', array(), $sent_to_admin, $order ), array( $this, 'customer_detail_field_is_valid' ) );

		if ( ! empty( $fields ) ) {
			if ( $plain_text ) {
				wc_get_template( 'emails/plain/email-customer-details.php', array( 'fields' => $fields ) );
			} else {
				wc_get_template( 'emails/email-customer-details.php', array( 'fields' => $fields ) );
			}
		}
	}

	/**
	 * Get the email addresses.
	 *
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 */
	public function email_addresses( $order, $sent_to_admin = false, $plain_text = false ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}
		if ( $plain_text ) {
			wc_get_template(
				'emails/plain/email-addresses.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
				)
			);
		} else {
			wc_get_template(
				'emails/email-addresses.php',
				array(
					'order'         => $order,
					'sent_to_admin' => $sent_to_admin,
				)
			);
		}
	}

	/**
	 * Renders any additional fields captured during block-based checkout.
	 *
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If email is sent to admin.
	 * @param bool     $plain_text    If this is a plain text email.
	 */
	public function additional_checkout_fields( $order, $sent_to_admin = false, $plain_text = false ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		/**
		 * Service class managing checkout fields and its related extensibility points.
		 *
		 * @var CheckoutFields $checkout_fields
		 */
		$checkout_fields = Package::container()->get( CheckoutFields::class );
		$fields          = array_merge(
			$checkout_fields->get_order_additional_fields_with_values( $order, 'contact', 'other', 'view' ),
			$checkout_fields->get_order_additional_fields_with_values( $order, 'order', 'other', 'view' ),
		);

		$context = array(
			'caller'        => 'WC_Email::additional_checkout_fields',
			'order'         => $order,
			'sent_to_admin' => $sent_to_admin,
			'plain_text'    => $plain_text,
		);

		$fields = $checkout_fields->filter_fields_for_order_confirmation( $fields, $context );

		if ( ! $fields ) {
			return;
		}

		if ( $plain_text ) {
			echo "\n" . esc_html( wc_strtoupper( __( 'Additional information', 'poocommerce' ) ) ) . "\n\n";
			foreach ( $fields as $field ) {
				printf( "%s: %s\n", wp_kses_post( $field['label'] ), wp_kses_post( $field['value'] ) );
			}
		} else {
			echo '<h2>' . esc_html__( 'Additional information', 'poocommerce' ) . '</h2>';
			echo '<ul class="additional-fields" style="margin-bottom: 40px;">';
			foreach ( $fields as $field ) {
				printf( '<li><strong>%s</strong>: %s</li>', wp_kses_post( $field['label'] ), wp_kses_post( $field['value'] ) );
			}
			echo '</ul>';
		}
	}

	/**
	 * Renders any additional address fields captured during block-based checkout.
	 *
	 * @param string   $address_type Address type.
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If email is sent to admin.
	 * @param bool     $plain_text    If this is a plain text email.
	 */
	public function additional_address_fields( $address_type, $order, $sent_to_admin = false, $plain_text = false ) {
		if ( ! is_a( $order, 'WC_Order' ) ) {
			return;
		}

		/**
		 * Service class managing checkout fields and its related extensibility points.
		 *
		 * @var CheckoutFields $checkout_fields
		 */
		$checkout_fields = Package::container()->get( CheckoutFields::class );
		$fields          = $checkout_fields->get_order_additional_fields_with_values( $order, 'address', $address_type, 'view' );

		$context = array(
			'caller'        => 'WC_Email::additional_address_fields',
			'address_type'  => $address_type,
			'order'         => $order,
			'sent_to_admin' => $sent_to_admin,
			'plain_text'    => $plain_text,
		);

		$fields = $checkout_fields->filter_fields_for_order_confirmation( $fields, $context );

		if ( ! $fields ) {
			return;
		}

		foreach ( $fields as $field ) {
			if ( $plain_text ) {
				printf( "%s: %s\n", wp_kses_post( $field['label'] ), wp_kses_post( $field['value'] ) );
			} else {
				printf( '<br><strong>%s</strong>: %s', wp_kses_post( $field['label'] ), wp_kses_post( $field['value'] ) );
			}
		}
	}

	/**
	 * Get blog name formatted for emails.
	 *
	 * @return string
	 */
	private function get_blogname() {
		return wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );
	}

	/**
	 * Get store address formatted for emails.
	 *
	 * @return string
	 */
	public function get_store_address() {
		add_filter(
			'poocommerce_formatted_address_force_country_display',
			array( $this, 'get_store_address_force_country_display' ),
			5
		);
		$result = wp_specialchars_decode(
			WC()->countries->get_formatted_address(
				array(
					'address_1' => WC()->countries->get_base_address(),
					'address_2' => WC()->countries->get_base_address_2(),
					'city'      => WC()->countries->get_base_city(),
					'state'     => WC()->countries->get_base_state(),
					'country'   => WC()->countries->get_base_country(),
					'postcode'  => WC()->countries->get_base_postcode(),
				)
			)
		);
		// Replace newlines by commas.
		$result = preg_replace( '/<br\/?>/i', ', ', $result );
		remove_filter(
			'poocommerce_formatted_address_force_country_display',
			array( $this, 'get_store_address_force_country_display' )
		);
		return $result;
	}

	/**
	 * Force country display, used by WC_Emails::get_store address() method
	 *
	 * @return bool
	 */
	public function get_store_address_force_country_display() {
		return true;
	}

	/**
	 * Add email sender filters.
	 */
	private function add_email_sender_filters() {
		add_filter( 'wp_mail_from', array( $this, 'get_from_address' ) );
		add_filter( 'wp_mail_from_name', array( $this, 'get_from_name' ) );
	}

	/**
	 * Remove email sender filters.
	 */
	private function remove_email_sender_filters() {
		remove_filter( 'wp_mail_from', array( $this, 'get_from_address' ) );
		remove_filter( 'wp_mail_from_name', array( $this, 'get_from_name' ) );
	}

	/**
	 * Low stock notification email.
	 *
	 * @param WC_Product $product Product instance.
	 */
	public function low_stock( $product ) {
		if ( 'no' === get_option( 'poocommerce_notify_low_stock', 'yes' ) ) {
			return;
		}

		/**
		 * Determine if the current product should trigger a low stock notification
		 *
		 * @param int $product_id - The low stock product id
		 *
		 * @since 4.7.0
		 */
		if ( false === apply_filters( 'poocommerce_should_send_low_stock_notification', true, $product->get_id() ) ) {
			return;
		}

		// If this is a variation but stock is managed at the parent level, use the parent product for the notification.
		if ( $product->is_type( 'variation' ) && 'parent' === $product->get_manage_stock() ) {
			$parent_product = wc_get_product( $product->get_parent_id() );
			if ( $parent_product ) {
				$product = $parent_product;
			}
		}

		$subject = sprintf( '[%s] %s', $this->get_blogname(), __( 'Product low in stock', 'poocommerce' ) );
		$message = sprintf(
		/* translators: 1: product name 2: items in stock */
			__( '%1$s is low in stock. There are %2$d left.', 'poocommerce' ),
			html_entity_decode( wp_strip_all_tags( $product->get_formatted_name() ), ENT_QUOTES, get_bloginfo( 'charset' ) ),
			html_entity_decode( wp_strip_all_tags( $product->get_stock_quantity() ) )
		);

		$this->add_email_sender_filters();

		wp_mail(
		/**
		 * Filter the recipient of the low stock notification email.
		 *
		 * @since 3.0.0
		 * @param string $recipient The recipient email address.
		 * @param WC_Product $product Product instance.
		 * @param null $null Unused.
		 */
			apply_filters( 'poocommerce_email_recipient_low_stock', get_option( 'poocommerce_stock_email_recipient' ), $product, null ),
			/**
			* Filter the subject of the low stock notification email.
			*
			* @since 3.0.0
			* @param string $subject The email subject.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_subject_low_stock', $subject, $product, null ),
			/**
			* Filter the content of the low stock notification email.
			*
			* @since 3.0.0
			* @param string $message The email content.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_content_low_stock', $message, $product ),
			/**
			* Filter the headers of the low stock notification email.
			*
			* @since 3.0.0
			* @param string $headers The email headers.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_headers', '', 'low_stock', $product, null ),
			/**
			* Filter the attachments of the low stock notification email.
			*
			* @since 3.0.0
			* @param array $attachments The email attachments.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_attachments', array(), 'low_stock', $product, null )
		);

		$this->remove_email_sender_filters();
	}

	/**
	 * No stock notification email.
	 *
	 * @param WC_Product $product Product instance.
	 */
	public function no_stock( $product ) {
		if ( 'no' === get_option( 'poocommerce_notify_no_stock', 'yes' ) ) {
			return;
		}

		/**
		 * Determine if the current product should trigger a no stock notification
		 *
		 * @param int $product_id - The out of stock product id
		 *
		 * @since 4.6.0
		 */
		if ( false === apply_filters( 'poocommerce_should_send_no_stock_notification', true, $product->get_id() ) ) {
			return;
		}

		// If this is a variation but stock is managed at the parent level, use the parent product for the notification.
		if ( $product->is_type( ProductType::VARIATION ) && 'parent' === $product->get_manage_stock() ) {
			$parent_product = wc_get_product( $product->get_parent_id() );
			if ( $parent_product ) {
				$product = $parent_product;
			}
		}

		$subject = sprintf( '[%s] %s', $this->get_blogname(), __( 'Product out of stock', 'poocommerce' ) );
		/* translators: %s: product name */
		$message = sprintf( __( '%s is out of stock.', 'poocommerce' ), html_entity_decode( wp_strip_all_tags( $product->get_formatted_name() ), ENT_QUOTES, get_bloginfo( 'charset' ) ) );

		$this->add_email_sender_filters();

		wp_mail(
		/**
		 * Filter the recipient of the no stock notification email.
		 *
		 * @since 3.0.0
		 * @param string $recipient The recipient email address.
		 * @param WC_Product $product Product instance.
		 * @param null $null Unused.
		 */
			apply_filters( 'poocommerce_email_recipient_no_stock', get_option( 'poocommerce_stock_email_recipient' ), $product, null ),
			/**
			* Filter the subject of the no stock notification email.
			*
			* @since 3.0.0
			* @param string $subject The email subject.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_subject_no_stock', $subject, $product, null ),
			/**
			* Filter the content of the no stock notification email.
			*
			* @since 3.0.0
			* @param string $message The email content.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_content_no_stock', $message, $product ),
			/**
			* Filter the headers of the no stock notification email.
			*
			* @since 3.0.0
			* @param string $headers The email headers.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_headers', '', 'no_stock', $product, null ),
			/**
			* Filter the attachments of the no stock notification email.
			*
			* @since 3.0.0
			* @param array $attachments The email attachments.
			* @param WC_Product $product Product instance.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_attachments', array(), 'no_stock', $product, null )
		);

		$this->remove_email_sender_filters();
	}

	/**
	 * Backorder notification email.
	 *
	 * @param array $args Arguments.
	 */
	public function backorder( $args ) {
		$args = wp_parse_args(
			$args,
			array(
				'product'  => '',
				'quantity' => '',
				'order_id' => '',
			)
		);

		$order = wc_get_order( $args['order_id'] );
		if (
		! $args['product'] ||
		! is_object( $args['product'] ) ||
		! $args['quantity'] ||
		! $order
		) {
			return;
		}

		$stock_before         = $args['quantity'] + $args['product']->get_stock_quantity();
		$backordered_quantity = $args['quantity'] - max( 0, $stock_before );

		$subject = sprintf( '[%s] %s', $this->get_blogname(), __( 'Product backorder', 'poocommerce' ) );
		/* translators: 1: backordered quantity 2: product name 3: order number */
		$message = sprintf( __( '%1$s units of %2$s have been backordered in order #%3$s.', 'poocommerce' ), $backordered_quantity, html_entity_decode( wp_strip_all_tags( $args['product']->get_formatted_name() ), ENT_QUOTES, get_bloginfo( 'charset' ) ), $order->get_order_number() );

		$this->add_email_sender_filters();

		wp_mail(
		/**
		 * Filter the recipient of the backorder notification email.
		 *
		 * @since 3.0.0
		 * @param string $recipient The recipient email address.
		 * @param array $args Arguments.
		 * @param null $null Unused.
		 */
			apply_filters( 'poocommerce_email_recipient_backorder', get_option( 'poocommerce_stock_email_recipient' ), $args, null ),
			/**
			* Filter the subject of the backorder notification email.
			*
			* @since 3.0.0
			* @param string $subject The email subject.
			* @param array $args Arguments.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_subject_backorder', $subject, $args, null ),
			/**
			* Filter the content of the backorder notification email.
			*
			* @since 3.0.0
			* @param string $message The email content.
			* @param array $args Arguments.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_content_backorder', $message, $args ),
			/**
			* Filter the headers of the backorder notification email.
			*
			* @since 3.0.0
			* @param string $headers The email headers.
			* @param array $args Arguments.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_headers', '', 'backorder', $args, null ),
			/**
			* Filter the attachments of the backorder notification email.
			*
			* @since 3.0.0
			* @param array $attachments The email attachments.
			* @param array $args Arguments.
			* @param null $null Unused.
			*/
			apply_filters( 'poocommerce_email_attachments', array(), 'backorder', $args, null )
		);

		$this->remove_email_sender_filters();
	}

	/**
	 * Adds Schema.org markup for order in JSON-LD format.
	 *
	 * @deprecated 3.0.0
	 * @see WC_Structured_Data::generate_order_data()
	 *
	 * @since 2.6.0
	 * @param WC_Order $order         Order instance.
	 * @param bool     $sent_to_admin If should sent to admin.
	 * @param bool     $plain_text    If is plain text email.
	 */
	public function order_schema_markup( $order, $sent_to_admin = false, $plain_text = false ) {
		wc_deprecated_function( 'WC_Emails::order_schema_markup', '3.0', 'WC_Structured_Data::generate_order_data' );

		WC()->structured_data->generate_order_data( $order, $sent_to_admin, $plain_text );
		WC()->structured_data->output_structured_data();
	}
}
