<?php

namespace Automattic\PooCommerce\Blocks\BlockTypes\OrderConfirmation;

use Automattic\PooCommerce\Blocks\Utils\StyleAttributesUtils;

/**
 * Status class.
 */
class Status extends AbstractOrderConfirmationBlock {

	/**
	 * Block name.
	 *
	 * @var string
	 */
	protected $block_name = 'order-confirmation-status';

	/**
	 * This block uses a custom render method so that the email verification form can be appended to the block. This does
	 * not inherit styles from the parent block.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content Block content.
	 * @param WP_Block $block Block instance.
	 *
	 * @return string | void Rendered block output.
	 */
	protected function render( $attributes, $content, $block ) {
		$order     = $this->get_order();
		$classname = StyleAttributesUtils::get_classes_by_attributes( $attributes, array( 'extra_classes' ) );

		if ( isset( $attributes['align'] ) ) {
			$classname .= " align{$attributes['align']}";
		}

		$block = parent::render( $attributes, $content, $block );

		if ( ! $block ) {
			return '';
		}

		$additional_content = $this->render_confirmation_notice( $order );

		if ( $additional_content ) {
			$block = $block . sprintf(
				'<div class="wc-block-order-confirmation-status-description %1$s">%2$s</div>',
				esc_attr( trim( $classname ) ),
				$additional_content
			);
		}

		return $block;
	}

	/**
	 * This renders the content of the block within the wrapper.
	 *
	 * @param \WC_Order    $order Order object.
	 * @param string|false $permission If the current user can view the order details or not.
	 * @param array        $attributes Block attributes.
	 * @param string       $content Original block content.
	 * @return string
	 */
	protected function render_content( $order, $permission = false, $attributes = [], $content = '' ) {
		if ( ! $permission ) {
			// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
			return '<p>' . wp_kses_post( apply_filters( 'poocommerce_thankyou_order_received_text', esc_html__( 'Thank you. Your order has been received.', 'poocommerce' ), null ) ) . '</p>';
		}

		$content = $this->get_hook_content( 'poocommerce_before_thankyou', [ $order->get_id() ] );
		$status  = $order->get_status();

		// Unlike the core handling, this includes some extra messaging for completed orders so the text is appropriate for other order statuses.
		switch ( $status ) {
			case 'cancelled':
				$content .= '<h1>' . wp_kses_post(
					/**
					 * Filter the title shown after a checkout is complete.
					 *
					 * @since 9.6.0
					 *
					 * @param string         $title The title.
					 * @param WC_Order|false $order The order created during checkout, or false if order data is not available.
					 */
					apply_filters(
						'poocommerce_thankyou_order_received_title',
						esc_html__( 'Order cancelled', 'poocommerce' ),
						$order
					)
				) . '</h1>';
				$content .= '<p>' . wp_kses_post(
						// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_text',
						esc_html__( 'Your order has been cancelled.', 'poocommerce' ),
						$order
					)
				) . '</p>';
				break;
			case 'refunded':
					$content .= '<h1>' . wp_kses_post(
						// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
						apply_filters(
							'poocommerce_thankyou_order_received_title',
							esc_html__( 'Order refunded', 'poocommerce' ),
							$order
						)
					) . '</h1>';
					$content .= '<p>' . wp_kses_post(
						sprintf(
							// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
							apply_filters(
								'poocommerce_thankyou_order_received_text',
								// translators: %s: date and time of the order refund.
								esc_html__( 'Your order was refunded %s.', 'poocommerce' ),
								$order
							),
							wc_format_datetime( $order->get_date_modified() )
						)
					) . '</p>';
				break;
			case 'completed':
				$content .= '<h1>' . wp_kses_post(
					// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_title',
						esc_html__( 'Order completed', 'poocommerce' ),
						$order
					)
				) . '</h1>';
				$content .= '<p>' . wp_kses_post(
					// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_text',
						esc_html__( 'Thank you. Your order has been fulfilled.', 'poocommerce' ),
						$order
					)
				) . '</p>';
				break;
			case 'failed':
				// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
				$order_received_text = apply_filters( 'poocommerce_thankyou_order_received_text', esc_html__( 'Your order cannot be processed as the originating bank/merchant has declined your transaction. Please attempt your purchase again.', 'poocommerce' ), null );
				$actions             = '<a href="' . esc_url( $order->get_checkout_payment_url() ) . '" class="button">' . esc_html__( 'Try again', 'poocommerce' ) . '</a> ';

				if ( wc_get_page_permalink( 'myaccount' ) ) {
					$actions .= '<a href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '" class="button">' . esc_html__( 'My account', 'poocommerce' ) . '</a> ';
				}
				$content .= '<h1>' . wp_kses_post(
					// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_title',
						esc_html__( 'Order failed', 'poocommerce' ),
						$order
					)
				) . '</h1>';
				$content .= '
				<p>' . $order_received_text . '</p>
				<p class="wc-block-order-confirmation-status__actions">' . $actions . '</p>
			';
				break;
			default:
				$content .= '<h1>' . wp_kses_post(
					// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_title',
						esc_html__( 'Order received', 'poocommerce' ),
						$order
					)
				) . '</h1>';
				$content .= '<p>' . wp_kses_post(
					// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
					apply_filters(
						'poocommerce_thankyou_order_received_text',
						esc_html__( 'Thank you. Your order has been received.', 'poocommerce' ),
						$order
					)
				) . '</p>';
				break;
		}

		return $content;
	}

	/**
	 * This is what gets rendered when the order does not exist.
	 *
	 * @return string
	 */
	protected function render_content_fallback() {
		// phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment
		return '<p>' . esc_html__( 'Please check your email for the order confirmation.', 'poocommerce' ) . '</p>';
	}

	/**
	 * If the order is invalid or there is no permission to view the details, tell the user to check email or log-in.
	 *
	 * @param \WC_Order|null $order Order object.
	 * @return string
	 */
	protected function render_confirmation_notice( $order = null ) {
		if ( ! $order ) {
			$content = '<p>' . esc_html__( 'If you\'ve just placed an order, give your email a quick check for the confirmation.', 'poocommerce' );

			if ( wc_get_page_permalink( 'myaccount' ) ) {
				$content .= ' ' . sprintf(
					/* translators: 1: opening a link tag 2: closing a link tag */
					esc_html__( 'Have an account with us? %1$sLog in here to view your order details%2$s.', 'poocommerce' ),
					'<a href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '" class="button">',
					'</a>'
				);
			}

			$content .= '</p>';

			return $content;
		}

		$permission = $this->get_view_order_permissions( $order );

		if ( $permission ) {
			return '';
		}

		$verification_required  = $this->email_verification_required( $order );
		$verification_permitted = $this->email_verification_permitted( $order );
		$my_account_page        = wc_get_page_permalink( 'myaccount' );

		$content  = '<p>';
		$content .= esc_html__( 'Great news! Your order has been received, and a confirmation will be sent to your email address.', 'poocommerce' );
		$content .= $my_account_page ? ' ' . sprintf(
			/* translators: 1: opening a link tag 2: closing a link tag */
			esc_html__( 'Have an account with us? %1$sLog in here%2$s to view your order.', 'poocommerce' ),
			'<a href="' . esc_url( $my_account_page ) . '" class="button">',
			'</a>'
		) : '';

		if ( $verification_required && $verification_permitted ) {
			$content .= ' ' . esc_html__( 'Alternatively, confirm the email address linked to the order below.', 'poocommerce' );
		}

		$content .= '</p>';

		if ( $verification_required && $verification_permitted ) {
			$content .= $this->render_verification_form();
		}

		return $content;
	}

	/**
	 * Email verification for guest users.
	 *
	 * @return string
	 */
	protected function render_verification_form() {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$check_submission_notice = ! empty( $_POST ) ? wc_print_notice( esc_html__( 'We were unable to verify the email address you provided. Please try again.', 'poocommerce' ), 'error', [], true ) : '';

		return '<form method="post" class="poocommerce-form poocommerce-verify-email">' .
			$check_submission_notice .
			sprintf(
				'<p class="form-row verify-email">
					<label for="%1$s">%2$s</label>
					<input type="email" name="email" id="%1$s" autocomplete="email" class="input-text" required />
				</p>',
				esc_attr( 'verify-email' ),
				esc_html__( 'Email address', 'poocommerce' ) . '&nbsp;<span class="required">*</span>'
			) .
			sprintf(
				'<p class="form-row login-submit">
					<input type="submit" name="wp-submit" id="%1$s" class="button button-primary %4$s" value="%2$s" />
					%3$s
				</p>',
				esc_attr( 'verify-email-submit' ),
				esc_html__( 'Confirm email and view order', 'poocommerce' ),
				wp_nonce_field( 'wc_verify_email', '_wpnonce', true, false ),
				esc_attr( wc_wp_theme_get_element_class_name( 'button' ) )
			) .
			'</form>';
	}
}
