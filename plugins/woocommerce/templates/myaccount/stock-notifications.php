<?php
/**
 * Back in stock notifications
 *
 * Shows the current user's back in stock notifications on the account page.
 *
 * This template can be overridden by copying it to yourtheme/poocommerce/myaccount/stock-notifications.php.
 *
 * HOWEVER, on occasion PooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://poocommerce.com/document/template-structure/
 * @package PooCommerce\Templates
 * @version 11.2.0
 *
 * @var array  $pending_rows      Rows awaiting email confirmation (capped, not paginated). See row keys below.
 * @var array  $active_rows       Active rows for the current page. See row keys below.
 * @var int    $current_page      1-indexed current page number of the active table.
 * @var int    $total_pages       Total number of pages of active rows.
 * @var int    $total_items       Total number of active rows across all pages.
 * @var int    $per_page          Active rows shown per page.
 * @var string $previous_page_url URL of the previous page of active rows, or an empty string on the first page.
 * @var string $next_page_url     URL of the next page of active rows, or an empty string on the last page.
 * @var string $shop_url          URL the empty-state "Browse products" button points at.
 *
 * Each row is an array with these keys:
 *   - int    id           Notification id.
 *   - string status       Notification status slug, used as a row class modifier.
 *   - string product_name Product title, or an empty string when the product is gone.
 *   - string product_url  Product permalink, or an empty string when the product is gone.
 *   - string variation    Flat list of variation attributes, or an empty string for simple products.
 *   - string date_iso     Sign-up date in ISO 8601, or an empty string when unknown.
 *   - string date_display Sign-up date formatted for display, or an empty string when unknown.
 *   - string resend_url   Nonce-protected URL that resends the verification email, or an empty string when the row cannot be resent.
 *   - string resend_label Accessible label for the resend link.
 *   - string cancel_url   Nonce-protected URL that cancels the notification, or an empty string when the row cannot be cancelled.
 *   - string cancel_label Accessible label for the cancel link.
 */

defined( 'ABSPATH' ) || exit;

$pending_rows      = isset( $pending_rows ) && is_array( $pending_rows ) ? $pending_rows : array();
$active_rows       = isset( $active_rows ) && is_array( $active_rows ) ? $active_rows : array();
$has_pending       = ! empty( $pending_rows );
$has_items         = $has_pending || ! empty( $active_rows );
$previous_page_url = isset( $previous_page_url ) ? (string) $previous_page_url : '';
$next_page_url     = isset( $next_page_url ) ? (string) $next_page_url : '';
$shop_url          = isset( $shop_url ) ? (string) $shop_url : wc_get_page_permalink( 'shop' );

$wp_button_class = wc_wp_theme_get_element_class_name( 'button' ) ? ' ' . wc_wp_theme_get_element_class_name( 'button' ) : '';

$row_defaults = array(
	'id'           => 0,
	'status'       => '',
	'product_name' => '',
	'product_url'  => '',
	'variation'    => '',
	'date_iso'     => '',
	'date_display' => '',
	'resend_url'   => '',
	'resend_label' => '',
	'cancel_url'   => '',
	'cancel_label' => '',
);

$tables = array(
	'pending' => array(
		'heading' => __( 'Awaiting confirmation', 'poocommerce' ),
		'caption' => __( 'Stock notifications awaiting confirmation', 'poocommerce' ),
		'rows'    => $pending_rows,
	),
	'active'  => array(
		// A store without double opt-in only ever has one table, so the heading is redundant there.
		'heading' => $has_pending ? __( 'Active', 'poocommerce' ) : '',
		'caption' => __( 'Active stock notifications', 'poocommerce' ),
		'rows'    => $active_rows,
	),
);

/**
 * Fires before the back in stock notifications table is rendered on My Account.
 *
 * @since 11.2.0
 *
 * @param bool $has_items Whether there are any notifications to render.
 */
do_action( 'poocommerce_before_account_customer_stock_notifications', $has_items );
?>

<?php foreach ( $tables as $table_key => $table ) : ?>
	<?php
	if ( empty( $table['rows'] ) ) {
		continue;
	}
	?>

	<?php if ( 'pending' === $table_key ) : ?>
		<?php
		/**
		 * Fires before the pending (awaiting confirmation) stock notifications table is rendered on My Account.
		 *
		 * @since 11.2.0
		 *
		 * @param bool $has_pending Whether there are any pending notifications to render.
		 */
		do_action( 'poocommerce_before_account_customer_stock_notifications_pending', $has_pending );
		?>
	<?php endif; ?>

	<?php if ( '' !== $table['heading'] ) : ?>
		<h2 class="poocommerce-customer-stock-notifications-heading poocommerce-customer-stock-notifications-heading--<?php echo esc_attr( $table_key ); ?>"><?php echo esc_html( $table['heading'] ); ?></h2>
	<?php endif; ?>

	<table class="poocommerce-customer-stock-notifications-table poocommerce-customer-stock-notifications-table--<?php echo esc_attr( $table_key ); ?> poocommerce-MyAccount-customerStockNotifications shop_table shop_table_responsive">
		<caption class="screen-reader-text"><?php echo esc_html( $table['caption'] ); ?></caption>
		<thead>
			<tr>
				<th scope="col" class="poocommerce-customer-stock-notifications-table__header poocommerce-customer-stock-notifications-table__header-product"><span class="nobr"><?php esc_html_e( 'Product', 'poocommerce' ); ?></span></th>
				<th scope="col" class="poocommerce-customer-stock-notifications-table__header poocommerce-customer-stock-notifications-table__header-date"><span class="nobr"><?php esc_html_e( 'Date signed up', 'poocommerce' ); ?></span></th>
				<th scope="col" class="poocommerce-customer-stock-notifications-table__header poocommerce-customer-stock-notifications-table__header-actions"><span class="nobr"><?php esc_html_e( 'Actions', 'poocommerce' ); ?></span></th>
			</tr>
		</thead>
		<tbody>
		<?php foreach ( $table['rows'] as $row ) : ?>
			<?php
			if ( ! is_array( $row ) ) {
				continue;
			}
			$row = wp_parse_args( $row, $row_defaults );
			?>
			<tr class="poocommerce-customer-stock-notifications-table__row poocommerce-customer-stock-notifications-table__row--status-<?php echo esc_attr( $row['status'] ); ?>">
				<td class="poocommerce-customer-stock-notifications-table__cell poocommerce-customer-stock-notifications-table__cell-product" data-title="<?php esc_attr_e( 'Product', 'poocommerce' ); ?>">
					<?php
					/*
					 * A deleted product still gets a row, rather than being skipped, so the
					 * customer can see the sign-up exists and cancel it.
					 */
					?>
					<?php if ( '' !== $row['product_name'] && '' !== $row['product_url'] ) : ?>
						<a href="<?php echo esc_url( $row['product_url'] ); ?>"><?php echo esc_html( $row['product_name'] ); ?></a>
					<?php elseif ( '' !== $row['product_name'] ) : ?>
						<?php echo esc_html( $row['product_name'] ); ?>
					<?php else : ?>
						<?php esc_html_e( 'Product unavailable', 'poocommerce' ); ?>
					<?php endif; ?>

					<?php if ( '' !== $row['variation'] ) : ?>
						<div class="description"><?php echo esc_html( $row['variation'] ); ?></div>
					<?php endif; ?>
				</td>
				<td class="poocommerce-customer-stock-notifications-table__cell poocommerce-customer-stock-notifications-table__cell-date" data-title="<?php esc_attr_e( 'Date signed up', 'poocommerce' ); ?>">
					<?php if ( '' !== $row['date_iso'] ) : ?>
						<time datetime="<?php echo esc_attr( $row['date_iso'] ); ?>"><?php echo esc_html( $row['date_display'] ); ?></time>
					<?php else : ?>
						&mdash;
					<?php endif; ?>
				</td>
				<td class="poocommerce-customer-stock-notifications-table__cell poocommerce-customer-stock-notifications-table__cell-actions actions" data-title="<?php esc_attr_e( 'Actions', 'poocommerce' ); ?>">
					<?php if ( '' !== $row['resend_url'] ) : ?>
						<a href="<?php echo esc_url( $row['resend_url'] ); ?>" class="poocommerce-button button poocommerce-customer-stock-notifications-action-link poocommerce-customer-stock-notifications-action-link--resend<?php echo esc_attr( $wp_button_class ); ?>" aria-label="<?php echo esc_attr( $row['resend_label'] ); ?>"><?php esc_html_e( 'Resend verification', 'poocommerce' ); ?></a>
					<?php endif; ?>
					<?php if ( '' !== $row['cancel_url'] ) : ?>
						<a href="<?php echo esc_url( $row['cancel_url'] ); ?>" class="poocommerce-button button poocommerce-customer-stock-notifications-action-link poocommerce-customer-stock-notifications-action-link--cancel<?php echo esc_attr( $wp_button_class ); ?>" aria-label="<?php echo esc_attr( $row['cancel_label'] ); ?>"><?php esc_html_e( 'Cancel', 'poocommerce' ); ?></a>
					<?php elseif ( '' === $row['resend_url'] ) : ?>
						&mdash;
					<?php endif; ?>
				</td>
			</tr>
		<?php endforeach; ?>
		</tbody>
	</table>

	<?php if ( 'pending' === $table_key ) : ?>
		<?php
		/**
		 * Fires after the pending (awaiting confirmation) stock notifications table is rendered on My Account.
		 *
		 * @since 11.2.0
		 *
		 * @param bool $has_pending Whether there were any pending notifications rendered.
		 */
		do_action( 'poocommerce_after_account_customer_stock_notifications_pending', $has_pending );
		?>
	<?php endif; ?>
<?php endforeach; ?>

<?php if ( ! empty( $active_rows ) ) : ?>

	<?php
	/**
	 * Fires before the stock notifications pagination is rendered on My Account.
	 *
	 * @since 11.2.0
	 */
	do_action( 'poocommerce_before_account_customer_stock_notifications_pagination' );
	?>

	<?php if ( '' !== $previous_page_url || '' !== $next_page_url ) : ?>
		<div class="poocommerce-pagination poocommerce-pagination--without-numbers poocommerce-Pagination" role="navigation" aria-label="<?php esc_attr_e( 'Active stock notifications pagination', 'poocommerce' ); ?>">
			<?php if ( '' !== $previous_page_url ) : ?>
				<a class="poocommerce-button poocommerce-button--previous poocommerce-Button poocommerce-Button--previous button<?php echo esc_attr( $wp_button_class ); ?>" href="<?php echo esc_url( $previous_page_url ); ?>"><?php esc_html_e( 'Previous', 'poocommerce' ); ?></a>
			<?php endif; ?>

			<?php if ( '' !== $next_page_url ) : ?>
				<a class="poocommerce-button poocommerce-button--next poocommerce-Button poocommerce-Button--next button<?php echo esc_attr( $wp_button_class ); ?>" href="<?php echo esc_url( $next_page_url ); ?>"><?php esc_html_e( 'Next', 'poocommerce' ); ?></a>
			<?php endif; ?>
		</div>
	<?php endif; ?>

<?php endif; ?>

<?php if ( ! $has_items ) : ?>

	<?php wc_print_notice( esc_html__( "You haven't signed up for any back-in-stock notifications yet.", 'poocommerce' ) . ' <a class="poocommerce-Button wc-forward button' . esc_attr( $wp_button_class ) . '" href="' . esc_url( apply_filters( 'poocommerce_return_to_shop_redirect', $shop_url ) ) . '">' . esc_html__( 'Browse products', 'poocommerce' ) . '</a>', 'notice' ); // phpcs:ignore PooCommerce.Commenting.CommentHooks.MissingHookComment ?>

<?php endif; ?>

<?php
/**
 * Fires after the back in stock notifications table is rendered on My Account.
 *
 * @since 11.2.0
 *
 * @param bool $has_items Whether there were any notifications rendered.
 */
do_action( 'poocommerce_after_account_customer_stock_notifications', $has_items );
