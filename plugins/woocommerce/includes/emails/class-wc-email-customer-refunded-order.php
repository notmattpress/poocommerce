<?php
/**
 * Class WC_Email_Customer_Refunded_Order file.
 *
 * @package PooCommerce\Emails
 */

use Automattic\PooCommerce\Utilities\FeaturesUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! class_exists( 'WC_Email_Customer_Refunded_Order', false ) ) :

	/**
	 * Customer Refunded Order Email.
	 *
	 * Order refunded emails are sent to the customer when the order is marked refunded.
	 *
	 * @class    WC_Email_Customer_Refunded_Order
	 * @version  3.5.0
	 * @package  PooCommerce\Classes\Emails
	 * @extends  WC_Email
	 */
	class WC_Email_Customer_Refunded_Order extends WC_Email {

		/**
		 * Refund order.
		 *
		 * @var WC_Order|bool
		 */
		public $refund;

		/**
		 * Is the order partial refunded?
		 *
		 * @var bool
		 */
		public $partial_refund;

		/**
		 * Constructor.
		 */
		public function __construct() {
			$this->customer_email = true;
			$this->id             = 'customer_refunded_order';
			$this->title          = __( 'Refunded order', 'poocommerce' );
			$this->template_html  = 'emails/customer-refunded-order.php';
			$this->template_plain = 'emails/plain/customer-refunded-order.php';
			$this->placeholders   = array(
				'{order_date}'   => '',
				'{order_number}' => '',
			);

			// Triggers for this email.
			add_action( 'poocommerce_order_fully_refunded_notification', array( $this, 'trigger_full' ), 10, 2 );
			add_action( 'poocommerce_order_partially_refunded_notification', array( $this, 'trigger_partial' ), 10, 2 );

			// Call parent constructor.
			parent::__construct();

			// Must be after parent's constructor which sets `email_improvements_enabled` property.
			$this->description = $this->email_improvements_enabled
				? __( 'Send an email to customers notifying them when an order has been partially or fully refunded', 'poocommerce' )
				: __( 'Order refunded emails are sent to customers when their orders are refunded.', 'poocommerce' );
		}

		/**
		 * Get email subject.
		 *
		 * @param bool $partial Whether it is a partial refund or a full refund.
		 * @since  3.1.0
		 * @return string
		 */
		public function get_default_subject( $partial = false ) {
			if ( $partial ) {
				return __( 'Your {site_title} order #{order_number} has been partially refunded', 'poocommerce' );
			} else {
				return __( 'Your {site_title} order #{order_number} has been refunded', 'poocommerce' );
			}
		}

		/**
		 * Get email heading.
		 *
		 * @param bool $partial Whether it is a partial refund or a full refund.
		 * @since  3.1.0
		 * @return string
		 */
		public function get_default_heading( $partial = false ) {
			if ( $partial ) {
				return $this->email_improvements_enabled
					? __( 'Partial refund: Order {order_number}', 'poocommerce' )
					: __( 'Partial Refund: Order {order_number}', 'poocommerce' );
			} else {
				return $this->email_improvements_enabled
					? __( 'Order refunded: {order_number}', 'poocommerce' )
					: __( 'Order Refunded: {order_number}', 'poocommerce' );
			}
		}

		/**
		 * Get email subject.
		 *
		 * @return string
		 */
		public function get_subject() {
			if ( $this->partial_refund ) {
				$subject = $this->get_option( 'subject_partial', $this->get_default_subject( true ) );
			} else {
				$subject = $this->get_option( 'subject_full', $this->get_default_subject() );
			}
			/**
			 * Filter the email subject for customer refunded order.
			 *
			 * @param string $subject The email subject.
			 * @param WC_Order $order Order object.
			 * @param WC_Email_Customer_Refunded_Order $email Email object.
			 * @since 3.7.0
			 */
			$subject = apply_filters( 'poocommerce_email_subject_customer_refunded_order', $this->format_string( $subject ), $this->object, $this );
			if ( $this->block_email_editor_enabled ) {
				$subject = $this->personalizer->personalize_transactional_content( $subject, $this );
			}
			return $subject;
		}

		/**
		 * Get email heading.
		 *
		 * @return string
		 */
		public function get_heading() {
			if ( $this->partial_refund ) {
				$heading = $this->get_option( 'heading_partial', $this->get_default_heading( true ) );
			} else {
				$heading = $this->get_option( 'heading_full', $this->get_default_heading() );
			}
			/**
			 * Filter the email heading for customer refunded order.
			 *
			 * @param string $heading The email heading.
			 * @param WC_Order $order Order object.
			 * @param WC_Email_Customer_Refunded_Order $email Email object.
			 * @since 3.7.0
			 */
			return apply_filters( 'poocommerce_email_heading_customer_refunded_order', $this->format_string( $heading ), $this->object, $this );
		}

		/**
		 * Set email strings.
		 *
		 * @param bool $partial_refund Whether it is a partial refund or a full refund.
		 * @deprecated 3.1.0 Unused.
		 */
		public function set_email_strings( $partial_refund = false ) {}

		/**
		 * Full refund notification.
		 *
		 * @param int $order_id Order ID.
		 * @param int $refund_id Refund ID.
		 */
		public function trigger_full( $order_id, $refund_id = null ) {
			$this->trigger( $order_id, false, $refund_id );
		}

		/**
		 * Partial refund notification.
		 *
		 * @param int $order_id Order ID.
		 * @param int $refund_id Refund ID.
		 */
		public function trigger_partial( $order_id, $refund_id = null ) {
			$this->trigger( $order_id, true, $refund_id );
		}

		/**
		 * Trigger.
		 *
		 * @param int  $order_id Order ID.
		 * @param bool $partial_refund Whether it is a partial refund or a full refund.
		 * @param int  $refund_id Refund ID.
		 */
		public function trigger( $order_id, $partial_refund = false, $refund_id = null ) {
			$this->setup_locale();
			$this->partial_refund = $partial_refund;
			$this->id             = $this->partial_refund ? 'customer_partially_refunded_order' : 'customer_refunded_order';

			if ( $order_id ) {
				$this->object                         = wc_get_order( $order_id );
				$this->recipient                      = $this->object->get_billing_email();
				$this->placeholders['{order_date}']   = wc_format_datetime( $this->object->get_date_created() );
				$this->placeholders['{order_number}'] = $this->object->get_order_number();
			}

			if ( ! empty( $refund_id ) ) {
				$this->refund = wc_get_order( $refund_id );
			} else {
				$this->refund = false;
			}

			if ( $this->is_enabled() && $this->get_recipient() ) {
				$this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
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
					'refund'             => $this->refund,
					'partial_refund'     => $this->partial_refund,
					'email_heading'      => $this->get_heading(),
					'additional_content' => $this->get_additional_content(),
					'blogname'           => $this->get_blogname(),
					'sent_to_admin'      => false,
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
					'refund'             => $this->refund,
					'partial_refund'     => $this->partial_refund,
					'email_heading'      => $this->get_heading(),
					'additional_content' => $this->get_additional_content(),
					'blogname'           => $this->get_blogname(),
					'sent_to_admin'      => false,
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
					'order'          => $this->object,
					'refund'         => $this->refund,
					'partial_refund' => $this->partial_refund,
					'sent_to_admin'  => false,
					'plain_text'     => false,
					'email'          => $this,
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
				? __( 'If you need any help with your order, please contact us at {store_email}.', 'poocommerce' )
				: __( 'We hope to see you again soon.', 'poocommerce' );
		}

		/**
		 * Initialise settings form fields.
		 */
		public function init_form_fields() {
			/* translators: %s: list of placeholders */
			$placeholder_text  = sprintf( __( 'Available placeholders: %s', 'poocommerce' ), '<code>' . esc_html( implode( '</code>, <code>', array_keys( $this->placeholders ) ) ) . '</code>' );
			$this->form_fields = array(
				'enabled'            => array(
					'title'   => __( 'Enable/Disable', 'poocommerce' ),
					'type'    => 'checkbox',
					'label'   => __( 'Enable this email notification', 'poocommerce' ),
					'default' => 'yes',
				),
				'subject_full'       => array(
					'title'       => __( 'Full refund subject', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_subject(),
					'default'     => '',
				),
				'subject_partial'    => array(
					'title'       => __( 'Partial refund subject', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_subject( true ),
					'default'     => '',
				),
				'heading_full'       => array(
					'title'       => __( 'Full refund email heading', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_heading(),
					'default'     => '',
				),
				'heading_partial'    => array(
					'title'       => __( 'Partial refund email heading', 'poocommerce' ),
					'type'        => 'text',
					'desc_tip'    => true,
					'description' => $placeholder_text,
					'placeholder' => $this->get_default_heading( true ),
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
	}

endif;

return new WC_Email_Customer_Refunded_Order();
