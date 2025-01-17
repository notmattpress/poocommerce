<?php
/**
 * Displays the inventory tab in the product data meta box.
 *
 * @package PooCommerce\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="inventory_product_data" class="panel poocommerce_options_panel hidden">
	<div class="options_group">
		<?php
		$info_img_url = WC_ADMIN_IMAGES_FOLDER_URL . '/icons/info.svg';

		if ( wc_product_sku_enabled() ) {
			poocommerce_wp_text_input(
				array(
					'id'          => '_sku',
					'value'       => $product_object->get_sku( 'edit' ),
					'label'       => '<abbr title="' . esc_attr__( 'Stock Keeping Unit', 'poocommerce' ) . '">' . esc_html__( 'SKU', 'poocommerce' ) . '</abbr>',
					'desc_tip'    => true,
					'description' => __( 'SKU refers to a Stock-keeping unit, a unique identifier for each distinct product and service that can be purchased.', 'poocommerce' ),
				)
			);
		}

		do_action( 'poocommerce_product_options_sku' );

		poocommerce_wp_text_input(
			array(
				'id'          => '_global_unique_id',
				'value'       => $product_object->get_global_unique_id( 'edit' ),
				// translators: %1$s GTIN %2$s UPC %3$s EAN %4$s ISBN.
				'label'       => sprintf( __( '%1$s, %2$s, %3$s, or %4$s', 'poocommerce' ), '<abbr title="' . esc_attr__( 'Global Trade Item Number', 'poocommerce' ) . '">' . esc_html__( 'GTIN', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'Universal Product Code', 'poocommerce' ) . '">' . esc_html__( 'UPC', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'European Article Number', 'poocommerce' ) . '">' . esc_html__( 'EAN', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'International Standard Book Number', 'poocommerce' ) . '">' . esc_html__( 'ISBN', 'poocommerce' ) . '</abbr>' ),
				'desc_tip'    => true,
				'description' => __( 'Enter a barcode or any other identifier unique to this product. It can help you list this product on other channels or marketplaces.', 'poocommerce' ),
			)
		);

		do_action( 'poocommerce_product_options_global_unique_id' );

		?>
		<div class="inline notice poocommerce-message show_if_variable">
			<img class="info-icon" src="<?php echo esc_url( $info_img_url ); ?>" />
			<p>
				<?php echo esc_html_e( 'Settings below apply to all variations without manual stock management enabled. ', 'poocommerce' ); ?> <a target="_blank" href="https://poocommerce.com/document/variable-product/"><?php esc_html_e( 'Learn more', 'poocommerce' ); ?></a>
			</p>
		</div>
		<?php

		if ( 'yes' === get_option( 'poocommerce_manage_stock' ) ) {

			poocommerce_wp_checkbox(
				array(
					'id'            => '_manage_stock',
					'value'         => $product_object->get_manage_stock( 'edit' ) ? 'yes' : 'no',
					'wrapper_class' => 'show_if_simple show_if_variable',
					'label'         => __( 'Stock management', 'poocommerce' ),
					'description'   => __( 'Track stock quantity for this product', 'poocommerce' ),
				)
			);

			do_action( 'poocommerce_product_options_stock' );

			echo '<div class="stock_fields show_if_simple show_if_variable">';

			poocommerce_wp_text_input(
				array(
					'id'                => '_stock',
					'value'             => wc_stock_amount( $product_object->get_stock_quantity( 'edit' ) ?? 1 ),
					'label'             => __( 'Quantity', 'poocommerce' ),
					'desc_tip'          => true,
					'description'       => __( 'Stock quantity. If this is a variable product this value will be used to control stock for all variations, unless you define stock at variation level.', 'poocommerce' ),
					'type'              => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
					'data_type'         => 'stock',
				)
			);

			echo '<input type="hidden" name="_original_stock" value="' . esc_attr( wc_stock_amount( $product_object->get_stock_quantity( 'edit' ) ) ) . '" />';

			$backorder_args = array(
				'id'      => '_backorders',
				'value'   => $product_object->get_backorders( 'edit' ),
				'label'   => __( 'Allow backorders?', 'poocommerce' ),
				'options' => wc_get_product_backorder_options(),
			);

			/**
			 * Allow 3rd parties to control whether "Allow backorder?" option will use radio buttons or a select.
			 *
			 * @since 7.6.0
			 *
			 * @param bool If false, "Allow backorders?" will be shown as a select. Default: it will use radio buttons.
			 */
			if ( apply_filters( 'poocommerce_product_allow_backorder_use_radio', true ) ) {
				poocommerce_wp_radio( $backorder_args );
			} else {
				poocommerce_wp_select( $backorder_args );
			}

			poocommerce_wp_text_input(
				array(
					'id'                => '_low_stock_amount',
					'value'             => $product_object->get_low_stock_amount( 'edit' ),
					'placeholder'       => sprintf(
						/* translators: %d: Amount of stock left */
						esc_attr__( 'Store-wide threshold (%d)', 'poocommerce' ),
						esc_attr( get_option( 'poocommerce_notify_low_stock_amount' ) )
					),
					'label'             => __( 'Low stock threshold', 'poocommerce' ),
					'desc_tip'          => true,
					'description'       => __( 'When product stock reaches this amount you will be notified by email. It is possible to define different values for each variation individually. The shop default value can be set in Settings > Products > Inventory.', 'poocommerce' ),
					'type'              => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
				)
			);

			do_action( 'poocommerce_product_options_stock_fields' );

			echo '</div>';
		} else {

			poocommerce_wp_note(
				array(
					'id'               => '_manage_stock_disabled',
					'label'            => __( 'Stock management', 'poocommerce' ),
					'label-aria-label' => __( 'Stock management disabled in store settings', 'poocommerce' ),
					'message'          => sprintf(
						/* translators: %s: url for store settings */
						__( 'Disabled in <a href="%s" aria-label="stock management store settings">store settings</a>.', 'poocommerce' ),
						esc_url( 'admin.php?page=wc-settings&tab=products&section=inventory' )
					),
					'wrapper_class'    => 'show_if_simple show_if_variable',
				)
			);

		}

		$stock_status_options = wc_get_product_stock_status_options();
		$stock_status_count   = count( $stock_status_options );
		$stock_status_args    = array(
			'id'            => '_stock_status',
			'value'         => $product_object->get_stock_status( 'edit' ),
			'wrapper_class' => 'stock_status_field hide_if_variable hide_if_external hide_if_grouped',
			'label'         => __( 'Stock status', 'poocommerce' ),
			'options'       => $stock_status_options,
			'desc_tip'      => true,
			'description'   => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'poocommerce' ),
		);

		/**
		 * Allow 3rd parties to control whether the "Stock status" option will use radio buttons or a select.
		 *
		 * @since 7.6.0
		 *
		 * @param bool If false, the "Stock status" will be shown as a select. Default: it will use radio buttons.
		 */
		if ( apply_filters( 'poocommerce_product_stock_status_use_radio', $stock_status_count <= 3 && $stock_status_count >= 1 ) ) {
			poocommerce_wp_radio( $stock_status_args );
		} else {
			poocommerce_wp_select( $stock_status_args );
		}

		do_action( 'poocommerce_product_options_stock_status' );
		?>
	</div>

	<div class="inventory_sold_individually options_group show_if_simple show_if_variable">
		<?php
		poocommerce_wp_checkbox(
			array(
				'id'            => '_sold_individually',
				'value'         => $product_object->get_sold_individually( 'edit' ) ? 'yes' : 'no',
				'wrapper_class' => 'show_if_simple show_if_variable',
				'label'         => __( 'Sold individually', 'poocommerce' ),
				'description'   => __( 'Limit purchases to 1 item per order', 'poocommerce' ),
			)
		);

		echo wc_help_tip( __( 'Check to let customers to purchase only 1 item in a single order. This is particularly useful for items that have limited quantity, for example art or handmade goods.', 'poocommerce' ) );

		do_action( 'poocommerce_product_options_sold_individually' );
		?>
	</div>

	<?php do_action( 'poocommerce_product_options_inventory_product_data' ); ?>
</div>
