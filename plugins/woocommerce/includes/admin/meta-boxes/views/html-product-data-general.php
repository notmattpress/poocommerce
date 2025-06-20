<?php
/**
 * Product general data panel.
 *
 * @package PooCommerce\Admin
 */

use Automattic\PooCommerce\Internal\CostOfGoodsSold\CostOfGoodsSoldController;

defined( 'ABSPATH' ) || exit;

use Automattic\PooCommerce\Enums\ProductTaxStatus;

?>
<div id="general_product_data" class="panel poocommerce_options_panel">

	<div class="options_group show_if_external">
		<?php
		poocommerce_wp_text_input(
			array(
				'id'          => '_product_url',
				'value'       => is_callable( array( $product_object, 'get_product_url' ) ) ? $product_object->get_product_url( 'edit' ) : '',
				'label'       => __( 'Product URL', 'poocommerce' ),
				'placeholder' => 'https://',
				'description' => __( 'Enter the external URL to the product.', 'poocommerce' ),
			)
		);

		poocommerce_wp_text_input(
			array(
				'id'          => '_button_text',
				'value'       => is_callable( array( $product_object, 'get_button_text' ) ) ? $product_object->get_button_text( 'edit' ) : '',
				'label'       => __( 'Button text', 'poocommerce' ),
				'placeholder' => _x( 'Buy product', 'placeholder', 'poocommerce' ),
				'description' => __( 'This text will be shown on the button linking to the external product.', 'poocommerce' ),
			)
		);

		do_action( 'poocommerce_product_options_external' );
		?>
	</div>

	<?php
		$cogs_controller = wc_get_container()->get( CostOfGoodsSoldController::class );
		$cogs_is_enabled = $cogs_controller->feature_is_enabled();
	?>
	<div class="options_group pricing show_if_simple show_if_external hidden<?php echo $cogs_is_enabled ? ' show_if_variable' : ''; ?>">
		<?php if ( $cogs_is_enabled ) : ?>
			<span class="show_if_simple show_if_external">
		<?php endif; ?>
		<?php
			poocommerce_wp_text_input(
				array(
					'id'        => '_regular_price',
					'value'     => $product_object->get_regular_price( 'edit' ),
					'label'     => __( 'Regular price', 'poocommerce' ) . ' (' . get_poocommerce_currency_symbol() . ')',
					'data_type' => 'price',
				)
			);

			poocommerce_wp_text_input(
				array(
					'id'          => '_sale_price',
					'value'       => $product_object->get_sale_price( 'edit' ),
					'data_type'   => 'price',
					'label'       => __( 'Sale price', 'poocommerce' ) . ' (' . get_poocommerce_currency_symbol() . ')',
					'description' => '<a href="#" class="sale_schedule">' . __( 'Schedule', 'poocommerce' ) . '</a>',
				)
			);

			$sale_price_dates_from_timestamp = $product_object->get_date_on_sale_from( 'edit' ) ? $product_object->get_date_on_sale_from( 'edit' )->getOffsetTimestamp() : false;
			$sale_price_dates_to_timestamp   = $product_object->get_date_on_sale_to( 'edit' ) ? $product_object->get_date_on_sale_to( 'edit' )->getOffsetTimestamp() : false;

			$sale_price_dates_from = $sale_price_dates_from_timestamp ? date_i18n( 'Y-m-d', $sale_price_dates_from_timestamp ) : '';
			$sale_price_dates_to   = $sale_price_dates_to_timestamp ? date_i18n( 'Y-m-d', $sale_price_dates_to_timestamp ) : '';

			// phpcs:disable PooCommerce.Commenting.CommentHooks.MissingSinceComment

			/**
			 * Hook to customize the regular expression that validates dates entered in the PooCommerce admin editors.
			 *
			 * @param string $pattern Default pattern to use.
			 */
			$date_input_html_pattern = apply_filters( 'poocommerce_date_input_html_pattern', '[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])' );

			echo '<p class="form-field sale_price_dates_fields">
					<label for="_sale_price_dates_from">' . esc_html__( 'Sale price dates', 'poocommerce' ) . '</label>
					<input type="text" class="short" name="_sale_price_dates_from" id="_sale_price_dates_from" value="' . esc_attr( $sale_price_dates_from ) . '" placeholder="' . esc_html( _x( 'From&hellip;', 'placeholder', 'poocommerce' ) ) . ' YYYY-MM-DD" maxlength="10" pattern="' . esc_attr( $date_input_html_pattern ) . '" />
					<input type="text" class="short" name="_sale_price_dates_to" id="_sale_price_dates_to" value="' . esc_attr( $sale_price_dates_to ) . '" placeholder="' . esc_html( _x( 'To&hellip;', 'placeholder', 'poocommerce' ) ) . '  YYYY-MM-DD" maxlength="10" pattern="' . esc_attr( $date_input_html_pattern ) . '" />
					<a href="#" class="description cancel_sale_schedule">' . esc_html__( 'Cancel', 'poocommerce' ) . '</a>' . wc_help_tip( __( 'The sale will start at 00:00:00 of "From" date and end at 23:59:59 of "To" date.', 'poocommerce' ) ) . '
				</p>';

			/**
			 * Action that allows to render additional fields for price related settings in the product editor.
			 */
			do_action( 'poocommerce_product_options_pricing' );

			// phpcs:enable PooCommerce.Commenting.CommentHooks.MissingSinceComment
			?>
		<?php if ( $cogs_is_enabled ) : ?>
			</span>
		<?php endif; ?>
		<?php if ( $cogs_is_enabled ) : ?>
			<span class="show_if_simple show_if_variable show_if_external hidden">
				<?php
				$is_variable = $product_object instanceof WC_Product_Variable;

				poocommerce_wp_text_input(
					array(
						'id'          => '_cogs_value',
						'value'       => $product_object->get_cogs_value() ?? '',
						'label'       => __( 'Cost of goods', 'poocommerce' ) . ' (' . get_poocommerce_currency_symbol() . ')',
						'data_type'   => 'price',
						'desc_tip'    => 'true',
						'placeholder' => '0',
						'description' => $cogs_controller->get_general_cost_edit_field_tooltip( $is_variable ),
					)
				);
				?>
			</span>
		<?php endif; ?>
	</div>

	<div class="options_group show_if_downloadable hidden">
		<div class="form-field downloadable_files">
			<label><?php esc_html_e( 'Downloadable files', 'poocommerce' ); ?></label>
			<table class="widefat">
				<thead>
					<tr>
						<th class="sort">&nbsp;</th>
						<th><?php esc_html_e( 'Name', 'poocommerce' ); ?> <?php echo wc_help_tip( __( 'This is the name of the download shown to the customer.', 'poocommerce' ) ); ?></th>
						<th colspan="2"><?php esc_html_e( 'File URL', 'poocommerce' ); ?> <?php echo wc_help_tip( __( 'This is the URL or absolute path to the file which customers will get access to. URLs entered here should already be encoded.', 'poocommerce' ) ); ?></th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					<?php
					$downloadable_files       = $product_object->get_downloads( 'edit' );
					$disabled_downloads_count = 0;

					if ( $downloadable_files ) {
						foreach ( $downloadable_files as $key => $file ) {
							$disabled_download         = isset( $file['enabled'] ) && false === $file['enabled'];
							$disabled_downloads_count += (int) $disabled_download;
							include __DIR__ . '/html-product-download.php';
						}
					}
					?>
				</tbody>
				<tfoot>
					<tr>
						<th colspan="2">
							<a href="#" class="button insert" data-row="
							<?php
								$key               = '';
								$file              = array(
									'file' => '',
									'name' => '',
								);
								$disabled_download = false;
								ob_start();
								require __DIR__ . '/html-product-download.php';
								echo esc_attr( ob_get_clean() );
								?>
							"><?php esc_html_e( 'Add File', 'poocommerce' ); ?></a>
						</th>
						<th colspan="3">
							<?php if ( $disabled_downloads_count ) : ?>
								<span class="disabled">*</span>
								<?php
									printf(
										/* translators: 1: opening link tag, 2: closing link tag. */
										esc_html__( 'The indicated downloads have been disabled (invalid location or filetype&mdash;%1$slearn more%2$s).', 'poocommerce' ),
										'<a href="https://poocommerce.com/document/approved-download-directories" target="_blank">',
										'</a>'
									);
								?>
							<?php endif; ?>
						</th>
					</tr>
				</tfoot>
			</table>
		</div>
		<?php
		poocommerce_wp_text_input(
			array(
				'id'                => '_download_limit',
				'value'             => -1 === $product_object->get_download_limit( 'edit' ) ? '' : $product_object->get_download_limit( 'edit' ),
				'label'             => __( 'Download limit', 'poocommerce' ),
				'placeholder'       => __( 'Unlimited', 'poocommerce' ),
				'description'       => __( 'Leave blank for unlimited re-downloads.', 'poocommerce' ),
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '1',
					'min'  => '0',
				),
			)
		);

		poocommerce_wp_text_input(
			array(
				'id'                => '_download_expiry',
				'value'             => -1 === $product_object->get_download_expiry( 'edit' ) ? '' : $product_object->get_download_expiry( 'edit' ),
				'label'             => __( 'Download expiry', 'poocommerce' ),
				'placeholder'       => __( 'Never', 'poocommerce' ),
				'description'       => __( 'Enter the number of days before a download link expires, or leave blank.', 'poocommerce' ),
				'type'              => 'number',
				'custom_attributes' => array(
					'step' => '1',
					'min'  => '0',
				),
			)
		);

		do_action( 'poocommerce_product_options_downloads' );
		?>
	</div>

	<?php if ( wc_tax_enabled() ) : ?>
		<div class="options_group show_if_simple show_if_external show_if_variable">
			<?php
			poocommerce_wp_select(
				array(
					'id'          => '_tax_status',
					'value'       => $product_object->get_tax_status( 'edit' ),
					'label'       => __( 'Tax status', 'poocommerce' ),
					'options'     => array(
						ProductTaxStatus::TAXABLE  => __( 'Taxable', 'poocommerce' ),
						ProductTaxStatus::SHIPPING => __( 'Shipping only', 'poocommerce' ),
						ProductTaxStatus::NONE     => _x( 'None', 'Tax status', 'poocommerce' ),
					),
					'desc_tip'    => 'true',
					'description' => __( 'Define whether or not the entire product is taxable, or just the cost of shipping it.', 'poocommerce' ),
				)
			);

			poocommerce_wp_select(
				array(
					'id'          => '_tax_class',
					'value'       => $product_object->get_tax_class( 'edit' ),
					'label'       => __( 'Tax class', 'poocommerce' ),
					'options'     => wc_get_product_tax_class_options(),
					'desc_tip'    => 'true',
					'description' => __( 'Choose a tax class for this product. Tax classes are used to apply different tax rates specific to certain types of product.', 'poocommerce' ),
				)
			);

			do_action( 'poocommerce_product_options_tax' );
			?>
		</div>
	<?php endif; ?>

	<?php do_action( 'poocommerce_product_options_general_product_data' ); ?>
</div>
