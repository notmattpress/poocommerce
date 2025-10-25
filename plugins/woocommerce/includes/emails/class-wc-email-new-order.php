<?php
/**
 * Class WC_Email_New_Order file
 *
 * @package PooCommerce\Emails
 */

use Automattic\PooCommerce\Utilities\FeaturesUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_Email_New_Order' ) ) :

	/**
	 * New Order Email.
	 *
	 * An email sent to the admin when a new order is received/paid for.
	 *
	 * @class       WC_Email_New_Order
	 * @version     2.0.0
	 * @package     PooCommerce\Classes\Emails
	 * @extends     WC_Email
	 */
	class WC_Email_New_Order extends WC_Email {

		/**
		 * Constructor.
		 */
		public function __construct() {
			$this->id             = 'new_order';
			$this->title          = __( 'New order', 'poocommerce' );
			$this->email_group    = 'orders';
			$this->template_html  = 'emails/admin-new-order.php';
			$this->template_plain = 'emails/plain/admin-new-order.php';
			$this->placeholders   = array(
				'{order_date}'   => '',
				'{order_number}' => '',
			);

			// Triggers for this email.
			add_action( 'poocommerce_order_status_pending_to_processing_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_pending_to_completed_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_pending_to_on-hold_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_failed_to_processing_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_failed_to_completed_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_failed_to_on-hold_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_cancelled_to_processing_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_cancelled_to_completed_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_order_status_cancelled_to_on-hold_notification', array( $this, 'trigger' ), 10, 2 );
			add_action( 'poocommerce_email_footer', array( $this, 'mobile_messaging' ), 9 ); // Run before the default email footer.

			// Call parent constructor.
			parent::__construct();

			// Must be after parent's constructor which sets `email_improvements_enabled` property.
			$this->description = $this->email_improvements_enabled
				? __( 'Receive an email notification every time a new order is placed', 'poocommerce' )
				: __( 'New order emails are sent to chosen recipient(s) when a new order is received.', 'poocommerce' );

			// Other settings.
			$this->recipient = $this->get_option( 'recipient', get_option( 'admin_email' ) );
		}

		/**
		 * Get email subject.
		 *
		 * @since  3.1.0
		 * @return string
		 */
		public function get_default_subject() {
			return $this->email_improvements_enabled
				? __( '[{site_title}]: You\'ve got a new order: #{order_number}', 'poocommerce' )
				: __( '[{site_title}]: New order #{order_number}', 'poocommerce' );
		}

		/**
		 * Get email heading.
		 *
		 * @since  3.1.0
		 * @return string
		 */
		public function get_default_heading() {
			return $this->email_improvements_enabled
				? __( 'New order: #{order_number}', 'poocommerce' )
				: __( 'New Order: #{order_number}', 'poocommerce' );
		}

		/**
		 * Trigger the sending of this email.
		 *
		 * @param int            $order_id The order ID.
		 * @param WC_Order|false $order Order object.
		 */
		public function trigger( $order_id, $order = false ) {
			$this->setup_locale();

			if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
				$order = wc_get_order( $order_id );
			}

			$email_already_sent = false;
			if ( is_a( $order, 'WC_Order' ) ) {
				$this->object                         = $order;
				$this->placeholders['{order_date}']   = wc_format_datetime( $this->object->get_date_created() );
				$this->placeholders['{order_number}'] = $this->object->get_order_number();

				$email_already_sent = $order->get_new_order_email_sent();
			}

			/**
			 * Controls if new order emails can be resend multiple times.
			 *
			 * @since 5.0.0
			 * @param bool $allows Defaults to false.
			 */
			if ( $email_already_sent && ! apply_filters( 'poocommerce_new_order_email_allows_resend', false ) ) {
				return;
			}

			if ( $this->is_enabled() && $this->get_recipient() ) {
				$email_sent_successfully = $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
				if ( $email_sent_successfully ) {
					$order->update_meta_data( '_new_order_email_sent', 'true' );
					$order->save();
				}
			}

			$this->restore_locale();
		}

		/**
		 * Get content html.
		 *
		 * @return string
		 */
		public function get_content_html() {
			return wc_get_template_html(
				$this->template_html,
				array(
					'order'              => $this->object,
					'email_heading'      => $this->get_heading(),
					'additional_content' => $this->get_additional_content(),
					'sent_to_admin'      => true,
					'plain_text'         => false,
					'email'              => $this,
				)
			);
		}

		/**
		 * Get content plain.
		 *
		 * @return string
		 */
		public function get_content_plain() {
			return wc_get_template_html(
				$this->template_plain,
				array(
					'order'              => $this->object,
					'email_heading'      => $this->get_heading(),
					'additional_content' => $this->get_additional_content(),
					'sent_to_admin'      => true,
					'plain_text'         => true,
					'email'              => $this,
				)
			);
		}


		/**
		 * Get block editor email template content.
		 *
		 * @return string
		 */
		public function get_block_editor_email_template_content() {
			return wc_get_template_html(
				$this->template_block_content,
				array(
					'order'         => $this->object,
					'sent_to_admin' => true,
					'plain_text'    => false,
					'email'         => $this,
				)
			);
		}


		/**
		 * Default content to show below main email content.
		 *
		 * @since 3.7.0
		 * @return string
		 */
		public function get_default_additional_content() {
			return $this->email_improvements_enabled
				? __( 'Congratulations on the sale!', 'poocommerce' )
				: __( 'Congratulations on the sale.', 'poocommerce' );
		}

		/**
		 * Initialise settings form fields.
		 */
		public function init_form_fields() {
			/* translators: %s: list of placeholders */
			$placeholder_text  = sprintf( __( 'Available placeholders: %s', 'poocommerce' ), '<code>' . implode( '</code>, <code>', array_keys( $this->placeholders ) ) . '</code>' );
			$this->form_fields = array(
				'enabled'            => array(
					'title'   => __( 'Enable/Disable', 'poocommerce' ),
					'type'    => 'checkbox',
					'label'   => __( 'Enable this email notification', 'poocommerce' ),
					'default' => 'yes',
				),
				'recipient'          => array(
					'title'       => __( 'Recipient(s)', 'poocommerce' ),
					'type'        => 'text',
					/* translators: %s: WP admin email */
					'description' => sprintf( __( 'Enter recipients (comma separated) for this email. Defaults to %s.', 'poocommerce' ), '<code>' . esc_attr( get_option( 'admin_email' ) ) . '</code>' ),
					'placeholder' => '',
					'default'     => '',
					'desc_tip'    => true,
				),
				'subject'            => array(
					'title'       => __( 'Subject', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_subject(),
					'default'     => '',
				),
				'heading'            => array(
					'title'       => __( 'Email heading', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_heading(),
					'default'     => '',
				),
				'additional_content' => array(
					'title'       => __( 'Additional content', 'poocommerce' ),
					'description' => __( 'Text to appear below the main email content.', 'poocommerce' ) . ' ' . $placeholder_text,
					'css'         => 'width:400px; height: 75px;',
					'placeholder' => __( 'N/A', 'poocommerce' ),
					'type'        => 'textarea',
					'default'     => $this->get_default_additional_content(),
					'desc_tip'    => true,
				),
				'email_type'         => array(
					'title'       => __( 'Email type', 'poocommerce' ),
					'type'        => 'select',
					'description' => __( 'Choose which format of email to send.', 'poocommerce' ),
					'default'     => 'html',
					'class'       => 'email_type wc-enhanced-select',
					'options'     => $this->get_email_type_options(),
					'desc_tip'    => true,
				),
			);
			if ( FeaturesUtil::feature_is_enabled( 'email_improvements' ) ) {
				$this->form_fields['cc']  = $this->get_cc_field();
				$this->form_fields['bcc'] = $this->get_bcc_field();
			}
		}


		/**
		 * Add mobile messaging.
		 *
		 * @param WC_Email $email that called for mobile messaging. May not contain a WC_Email for legacy reasons.
		 */
		public function mobile_messaging( $email ) {
			if ( $email instanceof WC_Email_New_Order && null !== $this->object ) {
				$domain = wp_parse_url( home_url(), PHP_URL_HOST );
				wc_get_template(
					'emails/email-mobile-messaging.php',
					array(
						'order'   => $this->object,
						'blog_id' => class_exists( 'Jetpack_Options' ) ? Jetpack_Options::get_option( 'id' ) : null,
						'now'     => new DateTime(),
						'domain'  => is_string( $domain ) ? $domain : '',
					)
				);
			}
		}
	}

endif;

return new WC_Email_New_Order();
