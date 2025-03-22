<?php
/**
 * Admin View: Edit Webhooks
 *
 * @package PooCommerce\Admin\Webhooks\Views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<input type="hidden" name="webhook_id" value="<?php echo esc_attr( $webhook->get_id() ); ?>" />

<div id="webhook-options" class="settings-panel">
	<h2><?php esc_html_e( 'Webhook data', 'poocommerce' ); ?></h2>
	<table class="form-table">
		<tbody>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_name">
						<?php esc_html_e( 'Name', 'poocommerce' ); ?>
						<?php
						/* translators: %s: date */
						echo wc_help_tip( sprintf( __( 'Friendly name for identifying this webhook, defaults to Webhook created on %s.', 'poocommerce' ), (new DateTime('now'))->format( _x( 'M d, Y @ h:i A', 'Webhook created on date parsed by DateTime::format', 'poocommerce' ) ) ) ); // @codingStandardsIgnoreLine
						?>
					</label>
				</th>
				<td class="forminp">
					<input name="webhook_name" id="webhook_name" type="text" class="input-text regular-input" value="<?php echo esc_attr( $webhook->get_name() ); ?>" />
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_status">
						<?php esc_html_e( 'Status', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'The options are &quot;Active&quot; (delivers payload), &quot;Paused&quot; (does not deliver), or &quot;Disabled&quot; (does not deliver due delivery failures).', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<select name="webhook_status" id="webhook_status" class="wc-enhanced-select">
						<?php
						$statuses       = wc_get_webhook_statuses();
						$current_status = $webhook->get_status();

						foreach ( $statuses as $status_slug => $status_name ) :
							?>
							<option value="<?php echo esc_attr( $status_slug ); ?>" <?php selected( $current_status, $status_slug, true ); ?>><?php echo esc_html( $status_name ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_topic">
						<?php esc_html_e( 'Topic', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'Select when the webhook will fire.', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<select name="webhook_topic" id="webhook_topic" class="wc-enhanced-select">
						<?php
							$topic_data = WC_Admin_Webhooks::get_topic_data( $webhook );

							$topics = apply_filters(
								'poocommerce_webhook_topics',
								array(
									''                 => __( 'Select an option&hellip;', 'poocommerce' ),
									'coupon.created'   => __( 'Coupon created', 'poocommerce' ),
									'coupon.updated'   => __( 'Coupon updated', 'poocommerce' ),
									'coupon.deleted'   => __( 'Coupon deleted', 'poocommerce' ),
									'coupon.restored'  => __( 'Coupon restored', 'poocommerce' ),
									'customer.created' => __( 'Customer created', 'poocommerce' ),
									'customer.updated' => __( 'Customer updated', 'poocommerce' ),
									'customer.deleted' => __( 'Customer deleted', 'poocommerce' ),
									'order.created'    => __( 'Order created', 'poocommerce' ),
									'order.updated'    => __( 'Order updated', 'poocommerce' ),
									'order.deleted'    => __( 'Order deleted', 'poocommerce' ),
									'order.restored'   => __( 'Order restored', 'poocommerce' ),
									'product.created'  => __( 'Product created', 'poocommerce' ),
									'product.updated'  => __( 'Product updated', 'poocommerce' ),
									'product.deleted'  => __( 'Product deleted', 'poocommerce' ),
									'product.restored' => __( 'Product restored', 'poocommerce' ),
									'action'           => __( 'Action', 'poocommerce' ),
								)
							);

							foreach ( $topics as $topic_slug => $topic_name ) :

								$selected = $topic_slug === $topic_data['topic'] || $topic_slug === $topic_data['resource'] . '.' . $topic_data['event'];

								?>
								<option value="<?php echo esc_attr( $topic_slug ); ?>" <?php selected( $selected, true, true ); ?>><?php echo esc_html( $topic_name ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr valign="top" id="webhook-action-event-wrap">
				<th scope="row" class="titledesc">
					<label for="webhook_action_event">
						<?php esc_html_e( 'Action event', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'Enter the action that will trigger this webhook.', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<input name="webhook_action_event" id="webhook_action_event" type="text" class="input-text regular-input" value="<?php echo esc_attr( $topic_data['event'] ); ?>" />
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_delivery_url">
						<?php esc_html_e( 'Delivery URL', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'URL where the webhook payload is delivered.', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<input name="webhook_delivery_url" id="webhook_delivery_url" type="text" class="input-text regular-input" value="<?php echo esc_attr( $webhook->get_delivery_url() ); ?>" />
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_secret">
						<?php esc_html_e( 'Secret', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'The secret key is used to generate a hash of the delivered webhook and provided in the request headers.', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<input name="webhook_secret" id="webhook_secret" type="text" class="input-text regular-input" value="<?php echo esc_attr( $webhook->get_secret() ); ?>" />
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" class="titledesc">
					<label for="webhook_api_version">
						<?php esc_html_e( 'API Version', 'poocommerce' ); ?>
						<?php echo wc_help_tip( __( 'REST API version used in the webhook deliveries.', 'poocommerce' ) ); ?>
					</label>
				</th>
				<td class="forminp">
					<select name="webhook_api_version" id="webhook_api_version">
						<?php foreach ( array_reverse( wc_get_webhook_rest_api_versions() ) as $version ) : ?>
							<option value="<?php echo esc_attr( $version ); ?>" <?php selected( $version, $webhook->get_api_version(), true ); ?>>
								<?php
									/* translators: %d: rest api version number */
									echo esc_html( sprintf( __( 'WP REST API Integration v%d', 'poocommerce' ), str_replace( 'wp_api_v', '', $version ) ) );
								?>
							</option>
						<?php endforeach; ?>
						<?php
						$legacy_api_option_name =
							WC()->legacy_rest_api_is_available() ?
							__( 'Legacy API v3 (deprecated)', 'poocommerce' ) :
							__( 'Legacy API v3 (⚠️ NOT AVAILABLE)', 'poocommerce' );
						?>
						<option value="legacy_v3" <?php selected( 'legacy_v3', $webhook->get_api_version(), true ); ?>><?php echo esc_html( $legacy_api_option_name ); ?></option>
					</select>
				</td>
			</tr>
		</tbody>
	</table>

	<?php
	/**
	 * Fires within the webhook editor, after the Webhook Data fields have rendered.
	 *
	 * @param WC_Webhook $webhook
	 */
	do_action( 'poocommerce_webhook_options', $webhook );
	?>
</div>

<div id="webhook-actions" class="settings-panel">
	<h2><?php esc_html_e( 'Webhook actions', 'poocommerce' ); ?></h2>
	<table class="form-table">
		<tbody>
			<?php if ( $webhook->get_date_created() && '0000-00-00 00:00:00' !== $webhook->get_date_created()->date( 'Y-m-d H:i:s' ) ) : ?>
				<?php if ( is_null( $webhook->get_date_modified() ) ) : ?>
					<tr valign="top">
						<th scope="row" class="titledesc">
							<?php esc_html_e( 'Created at', 'poocommerce' ); ?>
						</th>
						<td class="forminp">
							<?php echo esc_html( date_i18n( __( 'M j, Y @ G:i', 'poocommerce' ), strtotime( $webhook->get_date_created()->date( 'Y-m-d H:i:s' ) ) ) ); ?>
						</td>
					</tr>
				<?php else : ?>
				<tr valign="top">
						<th scope="row" class="titledesc">
							<?php esc_html_e( 'Created at', 'poocommerce' ); ?>
						</th>
						<td class="forminp">
							<?php echo esc_html( date_i18n( __( 'M j, Y @ G:i', 'poocommerce' ), strtotime( $webhook->get_date_created()->date( 'Y-m-d H:i:s' ) ) ) ); ?>
						</td>
					</tr>
				<tr valign="top">
						<th scope="row" class="titledesc">
							<?php esc_html_e( 'Updated at', 'poocommerce' ); ?>
						</th>
						<td class="forminp">
							<?php echo esc_html( date_i18n( __( 'M j, Y @ G:i', 'poocommerce' ), strtotime( $webhook->get_date_modified()->date( 'Y-m-d H:i:s' ) ) ) ); ?>
						</td>
					</tr>
				<?php endif; ?>
			<?php endif; ?>
			<tr valign="top">
				<td colspan="2" scope="row" style="padding-left: 0;">
					<p class="submit">
						<button type="submit" class="button button-primary button-large" name="save" id="publish" accesskey="p"><?php esc_html_e( 'Save webhook', 'poocommerce' ); ?></button>
						<?php
						if ( $webhook->get_id() ) :
							$delete_url = wp_nonce_url(
								add_query_arg(
									array(
										'delete' => $webhook->get_id(),
									),
									admin_url( 'admin.php?page=wc-settings&tab=advanced&section=webhooks' )
								),
								'delete-webhook'
							);
							?>
							<a style="color: #a00; text-decoration: none; margin-left: 10px;" href="<?php echo esc_url( $delete_url ); ?>"><?php esc_html_e( 'Delete permanently', 'poocommerce' ); ?></a>
						<?php endif; ?>
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<script type="text/javascript">
	jQuery( function ( $ ) {
		$( '#webhook-options' ).find( '#webhook_topic' ).on( 'change', function() {
			var current            = $( this ).val(),
				action_event_field = $( '#webhook-options' ).find( '#webhook-action-event-wrap' );

			action_event_field.hide();

			if ( 'action' === current ) {
				action_event_field.show();
			}
		}).trigger( 'change' );
	});
</script>
