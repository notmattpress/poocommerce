<?php
/**
 * PooCommerce Async Product Editor Category Field.
 */

namespace Automattic\PooCommerce\Admin\Features\AsyncProductEditorCategoryField;

use Automattic\Jetpack\Constants;
use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Internal\Admin\WCAdminAssets;
use Automattic\PooCommerce\Admin\PageController;

/**
 * Loads assets related to the async category field for the product editor.
 */
class Init {

	const FEATURE_ID = 'async-product-editor-category-field';

	/**
	 * Constructor
	 */
	public function __construct() {
		if ( Features::is_enabled( self::FEATURE_ID ) ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
			add_filter( 'poocommerce_taxonomy_args_product_cat', array( $this, 'add_metabox_args' ) );
		}
	}

	/**
	 * Adds meta_box_cb callback arguments for custom metabox.
	 *
	 * @param array $args Category taxonomy args.
	 * @return array $args category taxonomy args.
	 */
	public function add_metabox_args( $args ) {
		if ( ! isset( $args['meta_box_cb'] ) ) {
			$args['meta_box_cb']          = 'WC_Meta_Box_Product_Categories::output';
			$args['meta_box_sanitize_cb'] = 'taxonomy_meta_box_sanitize_cb_checkboxes';
		}
		return $args;
	}

	/**
	 * Enqueue scripts needed for the product form block editor.
	 */
	public function enqueue_scripts() {
		if ( ! PageController::is_embed_page() ) {
			return;
		}

		WCAdminAssets::register_script( 'wp-admin-scripts', 'product-category-metabox', true );
		wp_localize_script(
			'wc-admin-product-category-metabox',
			'wc_product_category_metabox_params',
			array(
				'search_categories_nonce'     => wp_create_nonce( 'search-categories' ),
				'search_taxonomy_terms_nonce' => wp_create_nonce( 'search-taxonomy-terms' ),
			)
		);
		wp_enqueue_script( 'product-category-metabox' );

	}

	/**
	 * Enqueue styles needed for the rich text editor.
	 */
	public function enqueue_styles() {
		if ( ! PageController::is_embed_page() ) {
			return;
		}
		$version = Constants::get_constant( 'WC_VERSION' );

		wp_register_style(
			'poocommerce_admin_product_category_metabox_styles',
			WCAdminAssets::get_url( 'product-category-metabox/style', 'css' ),
			array(),
			$version
		);
		wp_style_add_data( 'poocommerce_admin_product_category_metabox_styles', 'rtl', 'replace' );

		wp_enqueue_style( 'poocommerce_admin_product_category_metabox_styles' );
	}

}
