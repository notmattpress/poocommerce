<?php
/**
 * Class WC_Product_CSV_Importer_Controller file.
 *
 * @package PooCommerce\Admin\Importers
 */

use Automattic\PooCommerce\Internal\CostOfGoodsSold\CostOfGoodsSoldController;
use Automattic\PooCommerce\Internal\Utilities\FilesystemUtil;
use Automattic\PooCommerce\Internal\Utilities\URL;
use Automattic\PooCommerce\Utilities\I18nUtil;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WP_Importer' ) ) {
	return;
}

/**
 * Product importer controller - handles file upload and forms in admin.
 *
 * @package     PooCommerce\Admin\Importers
 * @version     3.1.0
 */
class WC_Product_CSV_Importer_Controller {

	/**
	 * The path to the current file.
	 *
	 * @var string
	 */
	protected $file = '';

	/**
	 * The current import step.
	 *
	 * @var string
	 */
	protected $step = '';

	/**
	 * Progress steps.
	 *
	 * @var array
	 */
	protected $steps = array();

	/**
	 * Errors.
	 *
	 * @var array
	 */
	protected $errors = array();

	/**
	 * The current delimiter for the file being read.
	 *
	 * @var string
	 */
	protected $delimiter = ',';

	/**
	 * Whether to use previous mapping selections.
	 *
	 * @var bool
	 */
	protected $map_preferences = false;

	/**
	 * Whether to skip existing products.
	 *
	 * @var bool
	 */
	protected $update_existing = false;

	/**
	 * The character encoding to use to interpret the input file, or empty string for autodetect.
	 *
	 * @var string
	 */
	protected $character_encoding = 'UTF-8';

	/**
	 * Get importer instance.
	 *
	 * @param  string $file File to import.
	 * @param  array  $args Importer arguments.
	 * @return WC_Product_CSV_Importer
	 */
	public static function get_importer( $file, $args = array() ) {
		$importer_class = apply_filters( 'poocommerce_product_csv_importer_class', 'WC_Product_CSV_Importer' );
		$args           = apply_filters( 'poocommerce_product_csv_importer_args', $args, $importer_class );
		return new $importer_class( $file, $args );
	}

	/**
	 * Check whether a file is a valid CSV file.
	 *
	 * @param string $file File path.
	 * @param bool   $check_path Whether to also check the file is located in a valid location (Default: true).
	 * @return bool
	 */
	public static function is_file_valid_csv( $file, $check_path = true ) {
		return wc_is_file_valid_csv( $file, $check_path );
	}

	/**
	 * Runs before controller actions to check that the file used during the import is valid.
	 *
	 * @since 9.3.0
	 *
	 * @param string $path Path to test.
	 *
	 * @throws \Exception When file validation fails.
	 */
	protected static function validate_file_path( string $path ): void {
		try {
			FilesystemUtil::validate_upload_file_path( $path );
		} catch ( \Exception $e ) {
			throw new \Exception( esc_html__( 'File path provided for import is invalid.', 'poocommerce' ) );
		}

		if ( ! self::is_file_valid_csv( $path ) ) {
			throw new \Exception( esc_html__( 'Invalid file type. The importer supports CSV and TXT file formats.', 'poocommerce' ) );
		}
	}

	/**
	 * Get all the valid filetypes for a CSV file.
	 *
	 * @return array
	 */
	protected static function get_valid_csv_filetypes() {
		return apply_filters(
			'poocommerce_csv_product_import_valid_filetypes',
			array(
				'csv' => 'text/csv',
				'txt' => 'text/plain',
			)
		);
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		$default_steps = array(
			'upload'  => array(
				'name'    => __( 'Upload CSV file', 'poocommerce' ),
				'view'    => array( $this, 'upload_form' ),
				'handler' => array( $this, 'upload_form_handler' ),
			),
			'mapping' => array(
				'name'    => __( 'Column mapping', 'poocommerce' ),
				'view'    => array( $this, 'mapping_form' ),
				'handler' => '',
			),
			'import'  => array(
				'name'    => __( 'Import', 'poocommerce' ),
				'view'    => array( $this, 'import' ),
				'handler' => '',
			),
			'done'    => array(
				'name'    => __( 'Done!', 'poocommerce' ),
				'view'    => array( $this, 'done' ),
				'handler' => '',
			),
		);

		$this->steps = apply_filters( 'poocommerce_product_csv_importer_steps', $default_steps );

		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$this->step               = isset( $_REQUEST['step'] ) ? sanitize_key( $_REQUEST['step'] ) : current( array_keys( $this->steps ) );
		$this->file               = isset( $_REQUEST['file'] ) ? wc_clean( wp_unslash( $_REQUEST['file'] ) ) : '';
		$this->update_existing    = isset( $_REQUEST['update_existing'] ) ? (bool) $_REQUEST['update_existing'] : false;
		$this->delimiter          = ! empty( $_REQUEST['delimiter'] ) ? wc_clean( wp_unslash( $_REQUEST['delimiter'] ) ) : ',';
		$this->map_preferences    = isset( $_REQUEST['map_preferences'] ) ? (bool) $_REQUEST['map_preferences'] : false;
		$this->character_encoding = isset( $_REQUEST['character_encoding'] ) ? wc_clean( wp_unslash( $_REQUEST['character_encoding'] ) ) : 'UTF-8';
		// phpcs:enable

		// Import mappings for CSV data.
		include_once __DIR__ . '/mappings/mappings.php';

		if ( $this->map_preferences ) {
			add_filter( 'poocommerce_csv_product_import_mapped_columns', array( $this, 'auto_map_user_preferences' ), 9999 );
		}
	}

	/**
	 * Get the URL for the next step's screen.
	 *
	 * @param string $step  slug (default: current step).
	 * @return string       URL for next step if a next step exists.
	 *                      Admin URL if it's the last step.
	 *                      Empty string on failure.
	 */
	public function get_next_step_link( $step = '' ) {
		if ( ! $step ) {
			$step = $this->step;
		}

		$keys = array_keys( $this->steps );

		if ( end( $keys ) === $step ) {
			return admin_url();
		}

		$step_index = array_search( $step, $keys, true );

		if ( false === $step_index ) {
			return '';
		}

		$params = array(
			'step'               => $keys[ $step_index + 1 ],
			'file'               => str_replace( DIRECTORY_SEPARATOR, '/', $this->file ),
			'delimiter'          => $this->delimiter,
			'update_existing'    => $this->update_existing,
			'map_preferences'    => $this->map_preferences,
			'character_encoding' => $this->character_encoding,
			'_wpnonce'           => wp_create_nonce( 'poocommerce-csv-importer' ), // wp_nonce_url() escapes & to &amp; breaking redirects.
		);

		return add_query_arg( $params );
	}

	/**
	 * Output header view.
	 */
	protected function output_header() {
		include __DIR__ . '/views/html-csv-import-header.php';
	}

	/**
	 * Output steps view.
	 */
	protected function output_steps() {
		include __DIR__ . '/views/html-csv-import-steps.php';
	}

	/**
	 * Output footer view.
	 */
	protected function output_footer() {
		include __DIR__ . '/views/html-csv-import-footer.php';
	}

	/**
	 * Add error message.
	 *
	 * @param string $message Error message.
	 * @param array  $actions List of actions with 'url' and 'label'.
	 */
	protected function add_error( $message, $actions = array() ) {
		$this->errors[] = array(
			'message' => $message,
			'actions' => $actions,
		);
	}

	/**
	 * Add error message.
	 */
	protected function output_errors() {
		if ( ! $this->errors ) {
			return;
		}

		foreach ( $this->errors as $error ) {
			echo '<div class="error inline">';
			echo '<p>' . esc_html( $error['message'] ) . '</p>';

			if ( ! empty( $error['actions'] ) ) {
				echo '<p>';
				foreach ( $error['actions'] as $action ) {
					echo '<a class="button button-primary" href="' . esc_url( $action['url'] ) . '">' . esc_html( $action['label'] ) . '</a> ';
				}
				echo '</p>';
			}
			echo '</div>';
		}
	}

	/**
	 * Dispatch current step and show correct view.
	 */
	public function dispatch() {
		$output = '';

		try {
			// phpcs:ignore WordPress.Security.NonceVerification.Missing
			if ( ! empty( $_POST['save_step'] ) && ! empty( $this->steps[ $this->step ]['handler'] ) ) {
				if ( is_callable( $this->steps[ $this->step ]['handler'] ) ) {
					call_user_func( $this->steps[ $this->step ]['handler'], $this );
				}
			}

			ob_start();

			if ( is_callable( $this->steps[ $this->step ]['view'] ) ) {
				call_user_func( $this->steps[ $this->step ]['view'], $this );
			}

			$output = ob_get_clean();
		} catch ( \Exception $e ) {
			$this->add_error( $e->getMessage() );
		}

		$this->output_header();
		$this->output_steps();
		$this->output_errors();
		echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- output is HTML we've generated ourselves.
		$this->output_footer();
	}

	/**
	 * Processes AJAX requests related to a product CSV import.
	 *
	 * @since 9.3.0
	 */
	public static function dispatch_ajax() {
		global $wpdb;

		check_ajax_referer( 'wc-product-import', 'security' );

		try {
			$file = wc_clean( wp_unslash( $_POST['file'] ?? '' ) ); // PHPCS: input var ok.
			self::validate_file_path( $file );

			$params = array(
				'delimiter'          => ! empty( $_POST['delimiter'] ) ? wc_clean( wp_unslash( $_POST['delimiter'] ) ) : ',', // PHPCS: input var ok.
				'start_pos'          => isset( $_POST['position'] ) ? absint( $_POST['position'] ) : 0, // PHPCS: input var ok.
				'mapping'            => isset( $_POST['mapping'] ) ? (array) wc_clean( wp_unslash( $_POST['mapping'] ) ) : array(), // PHPCS: input var ok.
				'update_existing'    => isset( $_POST['update_existing'] ) ? (bool) $_POST['update_existing'] : false, // PHPCS: input var ok.
				'character_encoding' => isset( $_POST['character_encoding'] ) ? wc_clean( wp_unslash( $_POST['character_encoding'] ) ) : '',

				/**
				 * Batch size for the product import process.
				 *
				 * @param int $size Batch size.
				 *
				 * @since 3.1.0
				 */
				'lines'              => apply_filters( 'poocommerce_product_import_batch_size', 30 ),
				'parse'              => true,
			);

			// Log failures.
			if ( 0 !== $params['start_pos'] ) {
				$error_log = array_filter( (array) get_user_option( 'product_import_error_log' ) );
			} else {
				$error_log = array();
			}

			include_once WC_ABSPATH . 'includes/import/class-wc-product-csv-importer.php';

			$importer         = self::get_importer( $file, $params );
			$results          = $importer->import();
			$percent_complete = $importer->get_percent_complete();
			$error_log        = array_merge( $error_log, $results['failed'], $results['skipped'] );

			update_user_option( get_current_user_id(), 'product_import_error_log', $error_log );

			if ( 100 === $percent_complete ) {
				// @codingStandardsIgnoreStart.
				$wpdb->delete( $wpdb->postmeta, array( 'meta_key' => '_original_id' ) );
				$wpdb->delete( $wpdb->posts, array(
					'post_type'   => 'product',
					'post_status' => 'importing',
				) );
				$wpdb->delete( $wpdb->posts, array(
					'post_type'   => 'product_variation',
					'post_status' => 'importing',
				) );
				// @codingStandardsIgnoreEnd.

				// Clean up orphaned data.
				$wpdb->query(
					"
					DELETE {$wpdb->posts}.* FROM {$wpdb->posts}
					LEFT JOIN {$wpdb->posts} wp ON wp.ID = {$wpdb->posts}.post_parent
					WHERE wp.ID IS NULL AND {$wpdb->posts}.post_type = 'product_variation'
				"
				);
				$wpdb->query(
					"
					DELETE {$wpdb->postmeta}.* FROM {$wpdb->postmeta}
					LEFT JOIN {$wpdb->posts} wp ON wp.ID = {$wpdb->postmeta}.post_id
					WHERE wp.ID IS NULL
				"
				);
				// @codingStandardsIgnoreStart.
				$wpdb->query( "
					DELETE tr.* FROM {$wpdb->term_relationships} tr
					LEFT JOIN {$wpdb->posts} wp ON wp.ID = tr.object_id
					LEFT JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
					WHERE wp.ID IS NULL
					AND tt.taxonomy IN ( '" . implode( "','", array_map( 'esc_sql', get_object_taxonomies( 'product' ) ) ) . "' )
				" );
				// @codingStandardsIgnoreEnd.

				// Send success.
				wp_send_json_success(
					array(
						'position'            => 'done',
						'percentage'          => 100,
						'url'                 => add_query_arg( array( '_wpnonce' => wp_create_nonce( 'poocommerce-csv-importer' ) ), admin_url( 'edit.php?post_type=product&page=product_importer&step=done' ) ),
						'imported'            => is_countable( $results['imported'] ) ? count( $results['imported'] ) : 0,
						'imported_variations' => is_countable( $results['imported_variations'] ) ? count( $results['imported_variations'] ) : 0,
						'failed'              => is_countable( $results['failed'] ) ? count( $results['failed'] ) : 0,
						'updated'             => is_countable( $results['updated'] ) ? count( $results['updated'] ) : 0,
						'skipped'             => is_countable( $results['skipped'] ) ? count( $results['skipped'] ) : 0,
					)
				);
			} else {
				wp_send_json_success(
					array(
						'position'            => $importer->get_file_position(),
						'percentage'          => $percent_complete,
						'imported'            => is_countable( $results['imported'] ) ? count( $results['imported'] ) : 0,
						'imported_variations' => is_countable( $results['imported_variations'] ) ? count( $results['imported_variations'] ) : 0,
						'failed'              => is_countable( $results['failed'] ) ? count( $results['failed'] ) : 0,
						'updated'             => is_countable( $results['updated'] ) ? count( $results['updated'] ) : 0,
						'skipped'             => is_countable( $results['skipped'] ) ? count( $results['skipped'] ) : 0,
					)
				);
			}
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * Output information about the uploading process.
	 */
	protected function upload_form() {
		$bytes      = apply_filters( 'import_upload_size_limit', wp_max_upload_size() );
		$size       = size_format( $bytes );
		$upload_dir = wp_upload_dir();

		include __DIR__ . '/views/html-product-csv-import-form.php';
	}

	/**
	 * Handle the upload form and store options.
	 */
	public function upload_form_handler() {
		check_admin_referer( 'poocommerce-csv-importer' );

		$file = $this->handle_upload();

		if ( is_wp_error( $file ) ) {
			$this->add_error( $file->get_error_message() );
			return;
		} else {
			$this->file = $file;
		}

		wp_redirect( esc_url_raw( $this->get_next_step_link() ) );
		exit;
	}

	/**
	 * Handles the CSV upload and initial parsing of the file to prepare for
	 * displaying author import options.
	 *
	 * @return string|WP_Error
	 */
	public function handle_upload() {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Nonce already verified in WC_Product_CSV_Importer_Controller::upload_form_handler()
		$file_url = isset( $_POST['file_url'] ) ? wc_clean( wp_unslash( $_POST['file_url'] ) ) : '';

		try {
			if ( ! empty( $file_url ) ) {
				$path = ABSPATH . $file_url;
				self::validate_file_path( $path );
			} else {
				$csv_import_util = wc_get_container()->get( Automattic\PooCommerce\Internal\Admin\ImportExport\CSVUploadHelper::class );
				$upload          = $csv_import_util->handle_csv_upload( 'product', 'import', self::get_valid_csv_filetypes() );
				$path            = $upload['file'];
			}

			return $path;
		} catch ( \Exception $e ) {
			return new \WP_Error( 'poocommerce_product_csv_importer_upload_invalid_file', $e->getMessage() );
		}
	}

	/**
	 * Mapping step.
	 */
	protected function mapping_form() {
		check_admin_referer( 'poocommerce-csv-importer' );
		self::validate_file_path( $this->file );

		$args = array(
			'lines'              => 1,
			'delimiter'          => $this->delimiter,
			'character_encoding' => $this->character_encoding,
		);

		$importer     = self::get_importer( $this->file, $args );
		$headers      = $importer->get_raw_keys();
		$mapped_items = $this->auto_map_columns( $headers );
		$sample       = current( $importer->get_raw_data() );

		if ( empty( $sample ) ) {
			$this->add_error(
				__( 'The file is empty or using a different encoding than UTF-8, please try again with a new file.', 'poocommerce' ),
				array(
					array(
						'url'   => admin_url( 'edit.php?post_type=product&page=product_importer' ),
						'label' => __( 'Upload a new file', 'poocommerce' ),
					),
				)
			);

			// Force output the errors in the same page.
			$this->output_errors();
			return;
		}

		include_once __DIR__ . '/views/html-csv-import-mapping.php';
	}

	/**
	 * Import the file if it exists and is valid.
	 */
	public function import() {
		// Displaying this page triggers Ajax action to run the import with a valid nonce,
		// therefore this page needs to be nonce protected as well.
		check_admin_referer( 'poocommerce-csv-importer' );
		self::validate_file_path( $this->file );

		if ( ! empty( $_POST['map_from'] ) && ! empty( $_POST['map_to'] ) ) {
			$mapping_from = wc_clean( wp_unslash( $_POST['map_from'] ) );
			$mapping_to   = wc_clean( wp_unslash( $_POST['map_to'] ) );

			// Save mapping preferences for future imports.
			update_user_option( get_current_user_id(), 'poocommerce_product_import_mapping', $mapping_to );
		} else {
			wp_redirect( esc_url_raw( $this->get_next_step_link( 'upload' ) ) );
			exit;
		}

		wp_localize_script(
			'wc-product-import',
			'wc_product_import_params',
			array(
				'import_nonce'       => wp_create_nonce( 'wc-product-import' ),
				'mapping'            => array(
					'from' => $mapping_from,
					'to'   => $mapping_to,
				),
				'file'               => $this->file,
				'update_existing'    => $this->update_existing,
				'delimiter'          => $this->delimiter,
				'character_encoding' => $this->character_encoding,
			)
		);
		wp_enqueue_script( 'wc-product-import' );

		include_once __DIR__ . '/views/html-csv-import-progress.php';
	}

	/**
	 * Done step.
	 */
	protected function done() {
		check_admin_referer( 'poocommerce-csv-importer' );
		$imported            = isset( $_GET['products-imported'] ) ? absint( $_GET['products-imported'] ) : 0;
		$imported_variations = isset( $_GET['products-imported-variations'] ) ? absint( $_GET['products-imported-variations'] ) : 0;
		$updated             = isset( $_GET['products-updated'] ) ? absint( $_GET['products-updated'] ) : 0;
		$failed              = isset( $_GET['products-failed'] ) ? absint( $_GET['products-failed'] ) : 0;
		$skipped             = isset( $_GET['products-skipped'] ) ? absint( $_GET['products-skipped'] ) : 0;
		$file_name           = isset( $_GET['file-name'] ) ? sanitize_text_field( wp_unslash( $_GET['file-name'] ) ) : '';
		$errors              = array_filter( (array) get_user_option( 'product_import_error_log' ) );

		include_once __DIR__ . '/views/html-csv-import-done.php';
	}

	/**
	 * Columns to normalize.
	 *
	 * @param  array $columns List of columns names and keys.
	 * @return array
	 */
	protected function normalize_columns_names( $columns ) {
		$normalized = array();

		foreach ( $columns as $key => $value ) {
			$normalized[ strtolower( $key ) ] = $value;
		}

		return $normalized;
	}

	/**
	 * Auto map column names.
	 *
	 * @param  array $raw_headers Raw header columns.
	 * @param  bool  $num_indexes If should use numbers or raw header columns as indexes.
	 * @return array
	 */
	protected function auto_map_columns( $raw_headers, $num_indexes = true ) {
		$weight_unit_label    = I18nUtil::get_weight_unit_label( get_option( 'poocommerce_weight_unit', 'kg' ) );
		$dimension_unit_label = I18nUtil::get_dimensions_unit_label( get_option( 'poocommerce_dimension_unit', 'cm' ) );

		$default_columns = array(
			__( 'ID', 'poocommerce' )                      => 'id',
			__( 'Type', 'poocommerce' )                    => 'type',
			__( 'SKU', 'poocommerce' )                     => 'sku',
			__( 'Name', 'poocommerce' )                    => 'name',
			__( 'Published', 'poocommerce' )               => 'published',
			__( 'Is featured?', 'poocommerce' )            => 'featured',
			__( 'Visibility in catalog', 'poocommerce' )   => 'catalog_visibility',
			__( 'Short description', 'poocommerce' )       => 'short_description',
			__( 'Description', 'poocommerce' )             => 'description',
			__( 'Date sale price starts', 'poocommerce' )  => 'date_on_sale_from',
			__( 'Date sale price ends', 'poocommerce' )    => 'date_on_sale_to',
			__( 'Tax status', 'poocommerce' )              => 'tax_status',
			__( 'Tax class', 'poocommerce' )               => 'tax_class',
			__( 'In stock?', 'poocommerce' )               => 'stock_status',
			__( 'Stock', 'poocommerce' )                   => 'stock_quantity',
			__( 'Backorders allowed?', 'poocommerce' )     => 'backorders',
			__( 'Low stock amount', 'poocommerce' )        => 'low_stock_amount',
			__( 'Sold individually?', 'poocommerce' )      => 'sold_individually',
			/* translators: %s: Weight unit */
			sprintf( __( 'Weight (%s)', 'poocommerce' ), $weight_unit_label ) => 'weight',
			/* translators: %s: Length unit */
			sprintf( __( 'Length (%s)', 'poocommerce' ), $dimension_unit_label ) => 'length',
			/* translators: %s: Width unit */
			sprintf( __( 'Width (%s)', 'poocommerce' ), $dimension_unit_label ) => 'width',
			/* translators: %s: Height unit */
			sprintf( __( 'Height (%s)', 'poocommerce' ), $dimension_unit_label ) => 'height',
			__( 'Allow customer reviews?', 'poocommerce' ) => 'reviews_allowed',
			__( 'Purchase note', 'poocommerce' )           => 'purchase_note',
			__( 'Sale price', 'poocommerce' )              => 'sale_price',
			__( 'Regular price', 'poocommerce' )           => 'regular_price',
			__( 'Categories', 'poocommerce' )              => 'category_ids',
			__( 'Tags', 'poocommerce' )                    => 'tag_ids',
			__( 'Shipping class', 'poocommerce' )          => 'shipping_class_id',
			__( 'Images', 'poocommerce' )                  => 'images',
			__( 'Download limit', 'poocommerce' )          => 'download_limit',
			__( 'Download expiry days', 'poocommerce' )    => 'download_expiry',
			__( 'Parent', 'poocommerce' )                  => 'parent_id',
			__( 'Upsells', 'poocommerce' )                 => 'upsell_ids',
			__( 'Cross-sells', 'poocommerce' )             => 'cross_sell_ids',
			__( 'Grouped products', 'poocommerce' )        => 'grouped_products',
			__( 'External URL', 'poocommerce' )            => 'product_url',
			__( 'Button text', 'poocommerce' )             => 'button_text',
			__( 'Position', 'poocommerce' )                => 'menu_order',
		);

		if ( wc_get_container()->get( CostOfGoodsSoldController::class )->feature_is_enabled() ) {
			$default_columns[ __( 'Cost of goods', 'poocommerce' ) ] = 'cogs_value';
		}

		/*
		 * @hooked wc_importer_generic_mappings - 10
		 * @hooked wc_importer_wordpress_mappings - 10
		 * @hooked wc_importer_default_english_mappings - 100
		 */
		$default_columns = $this->normalize_columns_names(
			apply_filters(
				'poocommerce_csv_product_import_mapping_default_columns',
				$default_columns,
				$raw_headers
			)
		);

		$special_columns = $this->get_special_columns(
			$this->normalize_columns_names(
				apply_filters(
					'poocommerce_csv_product_import_mapping_special_columns',
					array(
						/* translators: %d: Attribute number */
						__( 'Attribute %d name', 'poocommerce' ) => 'attributes:name',
						/* translators: %d: Attribute number */
						__( 'Attribute %d value(s)', 'poocommerce' ) => 'attributes:value',
						/* translators: %d: Attribute number */
						__( 'Attribute %d visible', 'poocommerce' ) => 'attributes:visible',
						/* translators: %d: Attribute number */
						__( 'Attribute %d global', 'poocommerce' ) => 'attributes:taxonomy',
						/* translators: %d: Attribute number */
						__( 'Attribute %d default', 'poocommerce' ) => 'attributes:default',
						/* translators: %d: Download number */
						__( 'Download %d ID', 'poocommerce' ) => 'downloads:id',
						/* translators: %d: Download number */
						__( 'Download %d name', 'poocommerce' ) => 'downloads:name',
						/* translators: %d: Download number */
						__( 'Download %d URL', 'poocommerce' ) => 'downloads:url',
						/* translators: %d: Meta number */
						__( 'Meta: %s', 'poocommerce' ) => 'meta:',
					),
					$raw_headers
				)
			)
		);

		$headers = array();
		foreach ( $raw_headers as $key => $field ) {
			$normalized_field  = strtolower( $field );
			$index             = $num_indexes ? $key : $field;
			$headers[ $index ] = $normalized_field;

			if ( isset( $default_columns[ $normalized_field ] ) ) {
				$headers[ $index ] = $default_columns[ $normalized_field ];
			} else {
				foreach ( $special_columns as $regex => $special_key ) {
					// Don't use the normalized field in the regex since meta might be case-sensitive.
					if ( preg_match( $regex, $field, $matches ) ) {
						$headers[ $index ] = $special_key . $matches[1];
						break;
					}
				}
			}
		}

		return apply_filters( 'poocommerce_csv_product_import_mapped_columns', $headers, $raw_headers );
	}

	/**
	 * Map columns using the user's latest import mappings.
	 *
	 * @param  array $headers Header columns.
	 * @return array
	 */
	public function auto_map_user_preferences( $headers ) {
		$mapping_preferences = get_user_option( 'poocommerce_product_import_mapping' );

		if ( ! empty( $mapping_preferences ) && is_array( $mapping_preferences ) ) {
			return $mapping_preferences;
		}

		return $headers;
	}

	/**
	 * Sanitize special column name regex.
	 *
	 * @param  string $value Raw special column name.
	 * @return string
	 */
	protected function sanitize_special_column_name_regex( $value ) {
		return '/' . str_replace( array( '%d', '%s' ), '(.*)', trim( quotemeta( $value ) ) ) . '/i';
	}

	/**
	 * Get special columns.
	 *
	 * @param  array $columns Raw special columns.
	 * @return array
	 */
	protected function get_special_columns( $columns ) {
		$formatted = array();

		foreach ( $columns as $key => $value ) {
			$regex = $this->sanitize_special_column_name_regex( $key );

			$formatted[ $regex ] = $value;
		}

		return $formatted;
	}

	/**
	 * Get mapping options.
	 *
	 * @param  string $item Item name.
	 * @return array
	 */
	protected function get_mapping_options( $item = '' ) {
		// Get index for special column names.
		$index = $item;

		if ( preg_match( '/\d+/', $item, $matches ) ) {
			$index = $matches[0];
		}

		// Properly format for meta field.
		$meta = str_replace( 'meta:', '', $item );

		// Available options.
		$weight_unit_label    = I18nUtil::get_weight_unit_label( get_option( 'poocommerce_weight_unit', 'kg' ) );
		$dimension_unit_label = I18nUtil::get_dimensions_unit_label( get_option( 'poocommerce_dimension_unit', 'cm' ) );
		$options              = array(
			'id'                 => __( 'ID', 'poocommerce' ),
			'type'               => __( 'Type', 'poocommerce' ),
			'sku'                => __( 'SKU', 'poocommerce' ),
			'global_unique_id'   => __( 'GTIN, UPC, EAN, or ISBN', 'poocommerce' ),
			'name'               => __( 'Name', 'poocommerce' ),
			'published'          => __( 'Published', 'poocommerce' ),
			'featured'           => __( 'Is featured?', 'poocommerce' ),
			'catalog_visibility' => __( 'Visibility in catalog', 'poocommerce' ),
			'short_description'  => __( 'Short description', 'poocommerce' ),
			'description'        => __( 'Description', 'poocommerce' ),
			'price'              => array(
				'name'    => __( 'Price', 'poocommerce' ),
				'options' => array(
					'regular_price'     => __( 'Regular price', 'poocommerce' ),
					'sale_price'        => __( 'Sale price', 'poocommerce' ),
					'date_on_sale_from' => __( 'Date sale price starts', 'poocommerce' ),
					'date_on_sale_to'   => __( 'Date sale price ends', 'poocommerce' ),
				),
			),
			'tax_status'         => __( 'Tax status', 'poocommerce' ),
			'tax_class'          => __( 'Tax class', 'poocommerce' ),
			'stock_status'       => __( 'In stock?', 'poocommerce' ),
			'stock_quantity'     => _x( 'Stock', 'Quantity in stock', 'poocommerce' ),
			'backorders'         => __( 'Backorders allowed?', 'poocommerce' ),
			'low_stock_amount'   => __( 'Low stock amount', 'poocommerce' ),
			'sold_individually'  => __( 'Sold individually?', 'poocommerce' ),
			/* translators: %s: weight unit */
			'weight'             => sprintf( __( 'Weight (%s)', 'poocommerce' ), $weight_unit_label ),
			'dimensions'         => array(
				'name'    => __( 'Dimensions', 'poocommerce' ),
				'options' => array(
					/* translators: %s: dimension unit */
					'length' => sprintf( __( 'Length (%s)', 'poocommerce' ), $dimension_unit_label ),
					/* translators: %s: dimension unit */
					'width'  => sprintf( __( 'Width (%s)', 'poocommerce' ), $dimension_unit_label ),
					/* translators: %s: dimension unit */
					'height' => sprintf( __( 'Height (%s)', 'poocommerce' ), $dimension_unit_label ),
				),
			),
			'category_ids'       => __( 'Categories', 'poocommerce' ),
			'tag_ids'            => __( 'Tags (comma separated)', 'poocommerce' ),
			'tag_ids_spaces'     => __( 'Tags (space separated)', 'poocommerce' ),
			'shipping_class_id'  => __( 'Shipping class', 'poocommerce' ),
			'images'             => __( 'Images', 'poocommerce' ),
			'parent_id'          => __( 'Parent', 'poocommerce' ),
			'upsell_ids'         => __( 'Upsells', 'poocommerce' ),
			'cross_sell_ids'     => __( 'Cross-sells', 'poocommerce' ),
			'grouped_products'   => __( 'Grouped products', 'poocommerce' ),
			'external'           => array(
				'name'    => __( 'External product', 'poocommerce' ),
				'options' => array(
					'product_url' => __( 'External URL', 'poocommerce' ),
					'button_text' => __( 'Button text', 'poocommerce' ),
				),
			),
			'downloads'          => array(
				'name'    => __( 'Downloads', 'poocommerce' ),
				'options' => array(
					'downloads:id' . $index   => __( 'Download ID', 'poocommerce' ),
					'downloads:name' . $index => __( 'Download name', 'poocommerce' ),
					'downloads:url' . $index  => __( 'Download URL', 'poocommerce' ),
					'download_limit'          => __( 'Download limit', 'poocommerce' ),
					'download_expiry'         => __( 'Download expiry days', 'poocommerce' ),
				),
			),
			'attributes'         => array(
				'name'    => __( 'Attributes', 'poocommerce' ),
				'options' => array(
					'attributes:name' . $index     => __( 'Attribute name', 'poocommerce' ),
					'attributes:value' . $index    => __( 'Attribute value(s)', 'poocommerce' ),
					'attributes:taxonomy' . $index => __( 'Is a global attribute?', 'poocommerce' ),
					'attributes:visible' . $index  => __( 'Attribute visibility', 'poocommerce' ),
					'attributes:default' . $index  => __( 'Default attribute', 'poocommerce' ),
				),
			),
			'reviews_allowed'    => __( 'Allow customer reviews?', 'poocommerce' ),
			'purchase_note'      => __( 'Purchase note', 'poocommerce' ),
			'meta:' . $meta      => __( 'Import as meta data', 'poocommerce' ),
			'menu_order'         => __( 'Position', 'poocommerce' ),
		);

		if ( wc_get_container()->get( CostOfGoodsSoldController::class )->feature_is_enabled() ) {
			$options['cogs_value'] = __( 'Cost of goods', 'poocommerce' );
		}

		return apply_filters( 'poocommerce_csv_product_import_mapping_options', $options, $item );
	}
}
