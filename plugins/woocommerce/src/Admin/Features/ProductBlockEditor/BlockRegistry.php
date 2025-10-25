<?php
/**
 * PooCommerce Product Editor Block Registration
 */

namespace Automattic\PooCommerce\Admin\Features\ProductBlockEditor;

use Automattic\PooCommerce\Internal\Admin\WCAdminAssets;
use Automattic\PooCommerce\Blocks\Utils\Utils;

/**
 * Product block registration and style registration functionality.
 */
class BlockRegistry {

	/**
	 * Generic blocks directory.
	 */
	const GENERIC_BLOCKS_DIR = 'product-editor/blocks/generic';
	/**
	 * Product fields blocks directory.
	 */
	const PRODUCT_FIELDS_BLOCKS_DIR = 'product-editor/blocks/product-fields';
	/**
	 * Array of all available generic blocks.
	 */
	const GENERIC_BLOCKS = array(
		'poocommerce/conditional',
		'poocommerce/product-checkbox-field',
		'poocommerce/product-collapsible',
		'poocommerce/product-radio-field',
		'poocommerce/product-pricing-field',
		'poocommerce/product-section',
		'poocommerce/product-section-description',
		'poocommerce/product-subsection',
		'poocommerce/product-subsection-description',
		'poocommerce/product-details-section-description',
		'poocommerce/product-tab',
		'poocommerce/product-toggle-field',
		'poocommerce/product-taxonomy-field',
		'poocommerce/product-text-field',
		'poocommerce/product-text-area-field',
		'poocommerce/product-number-field',
		'poocommerce/product-linked-list-field',
		'poocommerce/product-select-field',
		'poocommerce/product-notice-field',
	);

	/**
	 * Array of all available product fields blocks.
	 */
	const PRODUCT_FIELDS_BLOCKS = array(
		'poocommerce/product-catalog-visibility-field',
		'poocommerce/product-custom-fields',
		'poocommerce/product-custom-fields-toggle-field',
		'poocommerce/product-description-field',
		'poocommerce/product-downloads-field',
		'poocommerce/product-images-field',
		'poocommerce/product-inventory-email-field',
		'poocommerce/product-sku-field',
		'poocommerce/product-name-field',
		'poocommerce/product-regular-price-field',
		'poocommerce/product-sale-price-field',
		'poocommerce/product-schedule-sale-fields',
		'poocommerce/product-shipping-class-field',
		'poocommerce/product-shipping-dimensions-fields',
		'poocommerce/product-summary-field',
		'poocommerce/product-tag-field',
		'poocommerce/product-inventory-quantity-field',
		'poocommerce/product-variation-items-field',
		'poocommerce/product-password-field',
		'poocommerce/product-list-field',
		'poocommerce/product-has-variations-notice',
		'poocommerce/product-single-variation-notice',
	);

	/**
	 * Singleton instance.
	 *
	 * @var BlockRegistry
	 */
	private static $instance = null;

	/**
	 * Get the singleton instance.
	 */
	public static function get_instance(): BlockRegistry {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 */
	protected function __construct() {
		add_filter( 'block_categories_all', array( $this, 'register_categories' ), 10, 2 );
		$this->register_product_blocks();
	}

	/**
	 * Get a file path for a given block file.
	 *
	 * @param string $path File path.
	 * @param string $dir File directory.
	 */
	private function get_file_path( $path, $dir ) {
		return WC_ABSPATH . WCAdminAssets::get_path( 'js' ) . trailingslashit( $dir ) . $path;
	}

	/**
	 * Register all the product blocks.
	 */
	private function register_product_blocks() {
		foreach ( self::PRODUCT_FIELDS_BLOCKS as $block_name ) {
			$this->register_block( $block_name, self::PRODUCT_FIELDS_BLOCKS_DIR );
		}
		foreach ( self::GENERIC_BLOCKS as $block_name ) {
			$this->register_block( $block_name, self::GENERIC_BLOCKS_DIR );
		}
	}

	/**
	 * Register product related block categories.
	 *
	 * @param array[]                 $block_categories Array of categories for block types.
	 * @param WP_Block_Editor_Context $editor_context   The current block editor context.
	 */
	public function register_categories( $block_categories, $editor_context ) {
		if ( INIT::EDITOR_CONTEXT_NAME === $editor_context->name ) {
			$block_categories[] = array(
				'slug'  => 'poocommerce',
				'title' => __( 'PooCommerce', 'poocommerce' ),
				'icon'  => null,
			);
		}

		return $block_categories;
	}

	/**
	 * Get the block name without the "poocommerce/" prefix.
	 *
	 * @param string $block_name Block name.
	 *
	 * @return string
	 */
	private function remove_block_prefix( $block_name ) {
		if ( 0 === strpos( $block_name, 'poocommerce/' ) ) {
			return substr_replace( $block_name, '', 0, strlen( 'poocommerce/' ) );
		}

		return $block_name;
	}

	/**
	 * Augment the attributes of a block by adding attributes that are used by the product editor.
	 *
	 * @param array $attributes Block attributes.
	 */
	private function augment_attributes( $attributes ) {
		global $wp_version;
		// Note: If you modify this function, also update the client-side
		// registerWooBlockType function in @poocommerce/block-templates.
		$augmented_attributes = array_merge(
			$attributes,
			array(
				'_templateBlockId'                => array(
					'type' => 'string',
					'role' => 'content',
				),
				'_templateBlockOrder'             => array(
					'type' => 'integer',
					'role' => 'content',
				),
				'_templateBlockHideConditions'    => array(
					'type' => 'array',
					'role' => 'content',
				),
				'_templateBlockDisableConditions' => array(
					'type' => 'array',
					'role' => 'content',
				),
				'disabled'                        => isset( $attributes['disabled'] ) ? $attributes['disabled'] : array(
					'type' => 'boolean',
					'role' => 'content',
				),
			)
		);
		if ( ! $this->has_role_support() ) {
			foreach ( $augmented_attributes as $key => $attribute ) {
				if ( isset( $attribute['role'] ) ) {
					$augmented_attributes[ $key ]['__experimentalRole'] = $attribute['role'];
				}
			}
		}
		return $augmented_attributes;
	}

	/**
	 * Checks for block attribute role support.
	 */
	private function has_role_support() {
		if ( Utils::wp_version_compare( '6.7', '>=' ) ) {
			return true;
		}

		if ( is_plugin_active( 'gutenberg/gutenberg.php' ) ) {
			$gutenberg_version = '';

			if ( defined( 'GUTENBERG_VERSION' ) ) {
				$gutenberg_version = GUTENBERG_VERSION;
			}

			if ( ! $gutenberg_version ) {
				$gutenberg_data    = get_file_data(
					WP_PLUGIN_DIR . '/gutenberg/gutenberg.php',
					array( 'Version' => 'Version' )
				);
				$gutenberg_version = $gutenberg_data['Version'];
			}
			return version_compare( $gutenberg_version, '19.4', '>=' );
		}

		return false;
	}

	/**
	 * Augment the uses_context of a block by adding attributes that are used by the product editor.
	 *
	 * @param array $uses_context Block uses_context.
	 */
	private function augment_uses_context( $uses_context ) {
		// Note: If you modify this function, also update the client-side
		// registerProductEditorBlockType function in @poocommerce/product-editor.
		return array_merge(
			isset( $uses_context ) ? $uses_context : array(),
			array(
				'postType',
			)
		);
	}

	/**
	 * Register a single block.
	 *
	 * @param string $block_name Block name.
	 * @param string $block_dir Block directory.
	 *
	 * @return WP_Block_Type|false The registered block type on success, or false on failure.
	 */
	private function register_block( $block_name, $block_dir ) {
		$block_name      = $this->remove_block_prefix( $block_name );
		$block_json_file = $this->get_file_path( $block_name . '/block.json', $block_dir );

		return $this->register_block_type_from_metadata( $block_json_file );
	}

	/**
	 * Check if a block is registered.
	 *
	 * @param string $block_name Block name.
	 */
	public function is_registered( $block_name ): bool {
		$registry = \WP_Block_Type_Registry::get_instance();

		return $registry->is_registered( $block_name );
	}

	/**
	 * Unregister a block.
	 *
	 * @param string $block_name Block name.
	 */
	public function unregister( $block_name ) {
		$registry = \WP_Block_Type_Registry::get_instance();

		if ( $registry->is_registered( $block_name ) ) {
			$registry->unregister( $block_name );
		}
	}

	/**
	 * Register a block type from metadata stored in the block.json file.
	 *
	 * @param string $file_or_folder Path to the JSON file with metadata definition for the block or
	 * path to the folder where the `block.json` file is located.
	 *
	 * @return \WP_Block_Type|false The registered block type on success, or false on failure.
	 */
	public function register_block_type_from_metadata( $file_or_folder ) {
		$metadata_file = ( ! str_ends_with( $file_or_folder, 'block.json' ) )
			? trailingslashit( $file_or_folder ) . 'block.json'
			: $file_or_folder;

		if ( ! file_exists( $metadata_file ) ) {
			return false;
		}

		// We are dealing with a local file, so we can use file_get_contents.
		// phpcs:disable WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$metadata = json_decode( file_get_contents( $metadata_file ), true );
		if ( ! is_array( $metadata ) || ! $metadata['name'] ) {
			return false;
		}

		$this->unregister( $metadata['name'] );

		return register_block_type_from_metadata(
			$metadata_file,
			array(
				'attributes'   => $this->augment_attributes( isset( $metadata['attributes'] ) ? $metadata['attributes'] : array() ),
				'uses_context' => $this->augment_uses_context( isset( $metadata['usesContext'] ) ? $metadata['usesContext'] : array() ),
			)
		);
	}
}
