<?php
use Automattic\PooCommerce\Utilities\I18nUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="shipping_product_data" class="panel poocommerce_options_panel hidden">
	<div class="options_group">
		<?php
		if ( wc_product_weight_enabled() ) {
			poocommerce_wp_text_input(
				array(
					'id'          => '_weight',
					'value'       => $product_object->get_weight( 'edit' ),
					'label'       => sprintf(
						/* translators: %s: Weight unit */
						__( 'Weight (%s)', 'poocommerce' ),
						I18nUtil::get_weight_unit_label( get_option( 'poocommerce_weight_unit', 'kg' ) )
					),
					'placeholder' => wc_format_localized_decimal( 0 ),
					'desc_tip'    => true,
					'description' => __( 'Weight in decimal form', 'poocommerce' ),
					'type'        => 'text',
					'data_type'   => 'decimal',
				)
			);
		}

		if ( wc_product_dimensions_enabled() ) {
			?>
			<p class="form-field dimensions_field">
				<label for="product_length">
					<?php
					printf(
						/* translators: PooCommerce dimension unit */
						esc_html__( 'Dimensions (%s)', 'poocommerce' ),
						esc_html( I18nUtil::get_dimensions_unit_label( get_option( 'poocommerce_dimension_unit' ) ) )
					);
					?>
				</label>
				<span class="wrap">
					<input id="product_length" placeholder="<?php esc_attr_e( 'Length', 'poocommerce' ); ?>" class="input-text wc_input_decimal" size="6" type="text" name="_length" value="<?php echo esc_attr( wc_format_localized_decimal( $product_object->get_length( 'edit' ) ) ); ?>" />
					<input id="product_width" placeholder="<?php esc_attr_e( 'Width', 'poocommerce' ); ?>" class="input-text wc_input_decimal" size="6" type="text" name="_width" value="<?php echo esc_attr( wc_format_localized_decimal( $product_object->get_width( 'edit' ) ) ); ?>" />
					<input id="product_height" placeholder="<?php esc_attr_e( 'Height', 'poocommerce' ); ?>" class="input-text wc_input_decimal last" size="6" type="text" name="_height" value="<?php echo esc_attr( wc_format_localized_decimal( $product_object->get_height( 'edit' ) ) ); ?>" />
				</span>
				<?php echo wc_help_tip( __( 'LxWxH in decimal form', 'poocommerce' ) ); ?>
			</p>
			<?php
		}

		do_action( 'poocommerce_product_options_dimensions' );
		?>
	</div>

	<div class="options_group">
		<?php
		$args = array(
			'taxonomy'         => 'product_shipping_class',
			'hide_empty'       => 0,
			'show_option_none' => __( 'No shipping class', 'poocommerce' ),
			'name'             => 'product_shipping_class',
			'id'               => 'product_shipping_class',
			'selected'         => $product_object->get_shipping_class_id( 'edit' ),
			'class'            => 'select short',
			'orderby'          => 'name',
		);
		?>
		<p class="form-field shipping_class_field">
			<label for="product_shipping_class"><?php esc_html_e( 'Shipping class', 'poocommerce' ); ?></label>
			<?php wp_dropdown_categories( $args ); ?>
			<?php echo wc_help_tip( __( 'Shipping classes are used by certain shipping methods to group similar products.', 'poocommerce' ) ); ?>
		</p>
		<?php

		do_action( 'poocommerce_product_options_shipping' );
		?>
	</div>
	<?php do_action( 'poocommerce_product_options_shipping_product_data' ); ?>
</div>
