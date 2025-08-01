<?php
/**
 * Order notes HTML for meta box.
 *
 * @package PooCommerce\Admin
 */

defined( 'ABSPATH' ) || exit;

?>
<ul class="order_notes">
	<?php
	if ( $notes ) {
		foreach ( $notes as $note ) {
			$css_class   = array( 'note' );
			$css_class[] = $note->customer_note ? 'customer-note' : '';
			$css_class[] = 'system' === $note->added_by ? 'system-note' : '';
			$css_class   = apply_filters( 'poocommerce_order_note_class', array_filter( $css_class ), $note );
			?>
			<li rel="<?php echo absint( $note->id ); ?>" class="<?php echo esc_attr( implode( ' ', $css_class ) ); ?>">
				<div class="note_content">
					<?php
					$content = wp_kses_post( $note->content );
					$content = wc_wptexturize_order_note( $content );
					// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- the content goes through wp_kses_post above.
					echo wpautop( $content );
					?>
				</div>
				<p class="meta">
					<abbr class="exact-date" title="<?php echo esc_attr( $note->date_created->date( 'Y-m-d H:i:s' ) ); ?>">
						<?php
						/* translators: %1$s: note date %2$s: note time */
						echo esc_html( sprintf( __( '%1$s at %2$s', 'poocommerce' ), $note->date_created->date_i18n( wc_date_format() ), $note->date_created->date_i18n( wc_time_format() ) ) );
						?>
					</abbr>
					<?php
					if ( 'system' !== $note->added_by ) :
						/* translators: %s: note author */
						echo esc_html( sprintf( ' ' . __( 'by %s', 'poocommerce' ), $note->added_by ) );
					endif;
					?>
					<a href="#" class="delete_note" role="button"><?php esc_html_e( 'Delete note', 'poocommerce' ); ?></a>
				</p>
			</li>
			<?php
		}
	} else {
		?>
		<li class="no-items"><?php esc_html_e( 'There are no notes yet.', 'poocommerce' ); ?></li>
		<?php
	}
	?>
</ul>
