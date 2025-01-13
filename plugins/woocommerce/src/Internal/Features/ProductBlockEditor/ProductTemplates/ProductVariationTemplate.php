<?php
/**
 * ProductVariationTemplate
 */

namespace Automattic\PooCommerce\Internal\Features\ProductBlockEditor\ProductTemplates;

use Automattic\PooCommerce\Admin\Features\Features;
use Automattic\PooCommerce\Admin\Features\ProductBlockEditor\ProductTemplates\ProductFormTemplateInterface;

/**
 * Product Variation Template.
 */
class ProductVariationTemplate extends AbstractProductFormTemplate implements ProductFormTemplateInterface {
	use DownloadableProductTrait;

	/**
	 * The context name used to identify the editor.
	 */
	const GROUP_IDS = array(
		'GENERAL'   => 'general',
		'PRICING'   => 'pricing',
		'INVENTORY' => 'inventory',
		'SHIPPING'  => 'shipping',
	);

	/**
	 * The option name used check whether the single variation notice has been dismissed.
	 */
	const SINGLE_VARIATION_NOTICE_DISMISSED_OPTION = 'poocommerce_single_variation_notice_dismissed';

	/**
	 * ProductVariationTemplate constructor.
	 */
	public function __construct() {
		$this->add_group_blocks();
		$this->add_general_group_blocks();
		$this->add_inventory_group_blocks();
		$this->add_shipping_group_blocks();
	}

	/**
	 * Get the template ID.
	 */
	public function get_id(): string {
		return 'product-variation';
	}

	/**
	 * Get the template title.
	 */
	public function get_title(): string {
		return __( 'Product Variation Template', 'poocommerce' );
	}

	/**
	 * Get the template description.
	 */
	public function get_description(): string {
		return __( 'Template for the product variation form', 'poocommerce' );
	}

	/**
	 * Adds the group blocks to the template.
	 */
	protected function add_group_blocks() {
		$this->add_group(
			array(
				'id'         => $this::GROUP_IDS['GENERAL'],
				'order'      => 10,
				'attributes' => array(
					'title' => __( 'General', 'poocommerce' ),
				),
			)
		);
		$this->add_group(
			array(
				'id'         => $this::GROUP_IDS['INVENTORY'],
				'order'      => 30,
				'attributes' => array(
					'title' => __( 'Inventory', 'poocommerce' ),
				),
			)
		);
		$this->add_group(
			array(
				'id'         => $this::GROUP_IDS['SHIPPING'],
				'order'      => 40,
				'attributes' => array(
					'title' => __( 'Shipping', 'poocommerce' ),
				),
			)
		);
	}

	/**
	 * Adds the general group blocks to the template.
	 */
	protected function add_general_group_blocks() {
		$is_calc_taxes_enabled = wc_tax_enabled();

		$general_group = $this->get_group_by_id( $this::GROUP_IDS['GENERAL'] );
		$general_group->add_block(
			array(
				'id'         => 'general-single-variation-notice',
				'blockName'  => 'poocommerce/product-single-variation-notice',
				'order'      => 10,
				'attributes' => array(
					'content'       => __( '<strong>You’re editing details specific to this variation.</strong> Some information, like description and images, will be inherited from the main product, <noticeLink><parentProductName/></noticeLink>.', 'poocommerce' ),
					'type'          => 'info',
					'isDismissible' => true,
					'name'          => $this::SINGLE_VARIATION_NOTICE_DISMISSED_OPTION,
				),
			)
		);
		// Basic Details Section.
		$basic_details = $general_group->add_section(
			array(
				'id'         => 'product-variation-details-section',
				'order'      => 10,
				'attributes' => array(
					'title'       => __( 'Variation details', 'poocommerce' ),
					'description' => __( 'This info will be displayed on the product page, category pages, social media, and search results.', 'poocommerce' ),
				),
			)
		);

		// Product Pricing columns.
		$pricing_columns  = $basic_details->add_block(
			array(
				'id'        => 'product-pricing-group-pricing-columns',
				'blockName' => 'core/columns',
				'order'     => 10,
			)
		);
		$pricing_column_1 = $pricing_columns->add_block(
			array(
				'id'         => 'product-pricing-group-pricing-column-1',
				'blockName'  => 'core/column',
				'order'      => 10,
				'attributes' => array(
					'templateLock' => 'all',
				),
			)
		);
		$pricing_column_1->add_block(
			array(
				'id'         => 'product-pricing-regular-price',
				'blockName'  => 'poocommerce/product-regular-price-field',
				'order'      => 10,
				'attributes' => array(
					'name'       => 'regular_price',
					'label'      => __( 'Regular price', 'poocommerce' ),
					'isRequired' => true,
					'help'       => $is_calc_taxes_enabled ? null : sprintf(
					/* translators: %1$s: store settings link opening tag. %2$s: store settings link closing tag.*/
						__( 'Per your %1$sstore settings%2$s, taxes are not enabled.', 'poocommerce' ),
						'<a href="' . admin_url( 'admin.php?page=wc-settings&tab=general' ) . '" target="_blank" rel="noreferrer">',
						'</a>'
					),
				),
			)
		);
		$pricing_column_2 = $pricing_columns->add_block(
			array(
				'id'         => 'product-pricing-group-pricing-column-2',
				'blockName'  => 'core/column',
				'order'      => 20,
				'attributes' => array(
					'templateLock' => 'all',
				),
			)
		);
		$pricing_column_2->add_block(
			array(
				'id'         => 'product-pricing-sale-price',
				'blockName'  => 'poocommerce/product-sale-price-field',
				'order'      => 10,
				'attributes' => array(
					'label' => __( 'Sale price', 'poocommerce' ),
				),
			)
		);
		$basic_details->add_block(
			array(
				'id'        => 'product-pricing-schedule-sale-fields',
				'blockName' => 'poocommerce/product-schedule-sale-fields',
				'order'     => 20,
			)
		);

		if ( $is_calc_taxes_enabled ) {
			$basic_details->add_block(
				array(
					'id'         => 'product-tax-class',
					'blockName'  => 'poocommerce/product-select-field',
					'order'      => 40,
					'attributes' => array(
						'label'    => __( 'Tax class', 'poocommerce' ),
						'help'     => sprintf(
						/* translators: %1$s: Learn more link opening tag. %2$s: Learn more link closing tag.*/
							__( 'Apply a tax rate if this product qualifies for tax reduction or exemption. %1$sLearn more%2$s', 'poocommerce' ),
							'<a href="https://poocommerce.com/document/setting-up-taxes-in-poocommerce/#shipping-tax-class" target="_blank" rel="noreferrer">',
							'</a>'
						),
						'property' => 'tax_class',
						'options'  => SimpleProductTemplate::get_tax_classes( 'product_variation' ),
					),
				)
			);
		}

		$basic_details->add_block(
			array(
				'id'         => 'product-variation-note',
				'blockName'  => 'poocommerce/product-text-area-field',
				'order'      => 20,
				'attributes' => array(
					'property' => 'description',
					'label'    => __( 'Note', 'poocommerce' ),
					'help'     => 'Enter an optional note displayed on the product page when customers select this variation.',
				),
			)
		);
		$basic_details->add_block(
			array(
				'id'         => 'product-variation-visibility',
				'blockName'  => 'poocommerce/product-checkbox-field',
				'order'      => 30,
				'attributes' => array(
					'property'       => 'status',
					'label'          => __( 'Hide in product catalog', 'poocommerce' ),
					'checkedValue'   => 'private',
					'uncheckedValue' => 'publish',
				),
			)
		);

		// Images section.
		$images_section = $general_group->add_section(
			array(
				'id'         => 'product-variation-images-section',
				'order'      => 30,
				'attributes' => array(
					'title'       => __( 'Image', 'poocommerce' ),
					'description' => sprintf(
					/* translators: %1$s: Images guide link opening tag. %2$s: Images guide link closing tag. */
						__( 'Drag images, upload new ones or select files from your library. For best results, use JPEG files that are 1000 by 1000 pixels or larger. %1$sHow to prepare images?%2$s', 'poocommerce' ),
						'<a href="https://poocommerce.com/posts/how-to-take-professional-product-photos-top-tips" target="_blank" rel="noreferrer">',
						'</a>'
					),
				),
			)
		);
		$images_section->add_block(
			array(
				'id'         => 'product-variation-image',
				'blockName'  => 'poocommerce/product-images-field',
				'order'      => 10,
				'attributes' => array(
					'property' => 'image',
					'multiple' => false,
				),
			)
		);

		// Downloads section.
		$this->add_downloadable_product_blocks( $general_group );
	}

	/**
	 * Adds the inventory group blocks to the template.
	 */
	protected function add_inventory_group_blocks() {
		$inventory_group = $this->get_group_by_id( $this::GROUP_IDS['INVENTORY'] );
		$inventory_group->add_block(
			array(
				'id'         => 'inventory-single-variation-notice',
				'blockName'  => 'poocommerce/product-single-variation-notice',
				'order'      => 10,
				'attributes' => array(
					'content'       => __( '<strong>You’re editing details specific to this variation.</strong> Some information, like description and images, will be inherited from the main product, <noticeLink><parentProductName/></noticeLink>.', 'poocommerce' ),
					'type'          => 'info',
					'isDismissible' => true,
					'name'          => $this::SINGLE_VARIATION_NOTICE_DISMISSED_OPTION,
				),
			)
		);
		// Product Inventory Section.
		$product_inventory_section       = $inventory_group->add_section(
			array(
				'id'         => 'product-variation-inventory-section',
				'order'      => 20,
				'attributes' => array(
					'title'       => __( 'Inventory', 'poocommerce' ),
					'description' => sprintf(
					/* translators: %1$s: Inventory settings link opening tag. %2$s: Inventory settings link closing tag.*/
						__( 'Set up and manage inventory for this product, including status and available quantity. %1$sManage store inventory settings%2$s', 'poocommerce' ),
						'<a href="' . admin_url( 'admin.php?page=wc-settings&tab=products&section=inventory' ) . '" target="_blank" rel="noreferrer">',
						'</a>'
					),
					'blockGap'    => 'unit-40',
				),
			)
		);
		$product_inventory_inner_section = $product_inventory_section->add_subsection(
			array(
				'id'    => 'product-variation-inventory-inner-section',
				'order' => 10,
			)
		);
		$inventory_columns               = $product_inventory_inner_section->add_block(
			array(
				'id'        => 'product-inventory-inner-columns',
				'blockName' => 'core/columns',
			)
		);
		$inventory_columns->add_block(
			array(
				'id'        => 'product-inventory-inner-column1',
				'blockName' => 'core/column',
			)
		)->add_block(
			array(
				'id'        => 'product-variation-sku-field',
				'blockName' => 'poocommerce/product-sku-field',
				'order'     => 10,
			)
		);
		$inventory_columns->add_block(
			array(
				'id'        => 'product-inventory-inner-column2',
				'blockName' => 'core/column',
			)
		)->add_block(
			array(
				'id'         => 'product-unique-id-field',
				'blockName'  => 'poocommerce/product-text-field',
				'order'      => 20,
				'attributes' => array(
					'property' => 'global_unique_id',
					// translators: %1$s GTIN %2$s UPC %3$s EAN %4$s ISBN.
					'label'    => sprintf( __( '%1$s, %2$s, %3$s, or %4$s', 'poocommerce' ), '<abbr title="' . esc_attr__( 'Global Trade Item Number', 'poocommerce' ) . '">' . esc_html__( 'GTIN', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'Universal Product Code', 'poocommerce' ) . '">' . esc_html__( 'UPC', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'European Article Number', 'poocommerce' ) . '">' . esc_html__( 'EAN', 'poocommerce' ) . '</abbr>', '<abbr title="' . esc_attr__( 'International Standard Book Number', 'poocommerce' ) . '">' . esc_html__( 'ISBN', 'poocommerce' ) . '</abbr>' ),
					'tooltip'  => __( 'Enter a barcode or any other identifier unique to this product. It can help you list this product on other channels or marketplaces.', 'poocommerce' ),
					'pattern'  => array(
						'value'   => '[0-9\-]*',
						'message' => __( 'Please enter only numbers and hyphens (-).', 'poocommerce' ),
					),
				),
			)
		);
		$product_inventory_inner_section->add_block(
			array(
				'id'         => 'product-variation-track-stock',
				'blockName'  => 'poocommerce/product-toggle-field',
				'order'      => 20,
				'attributes' => array(
					'label'        => __( 'Track inventory', 'poocommerce' ),
					'property'     => 'manage_stock',
					'disabled'     => 'yes' !== get_option( 'poocommerce_manage_stock' ),
					'disabledCopy' => sprintf(
						/* translators: %1$s: Learn more link opening tag. %2$s: Learn more link closing tag.*/
						__( 'Per your %1$sstore settings%2$s, inventory management is <strong>disabled</strong>.', 'poocommerce' ),
						'<a href="' . admin_url( 'admin.php?page=wc-settings&tab=products&section=inventory' ) . '" target="_blank" rel="noreferrer">',
						'</a>'
					),
				),
			)
		);
		$product_inventory_inner_section->add_block(
			array(
				'id'             => 'product-variation-inventory-quantity',
				'blockName'      => 'poocommerce/product-inventory-quantity-field',
				'order'          => 10,
				'hideConditions' => array(
					array(
						'expression' => 'editedProduct.manage_stock === false',
					),
				),
			)
		);
		$product_inventory_section->add_block(
			array(
				'id'             => 'product-variation-stock-status',
				'blockName'      => 'poocommerce/product-radio-field',
				'order'          => 10,
				'attributes'     => array(
					'title'    => __( 'Stock status', 'poocommerce' ),
					'property' => 'stock_status',
					'options'  => array(
						array(
							'label' => __( 'In stock', 'poocommerce' ),
							'value' => 'instock',
						),
						array(
							'label' => __( 'Out of stock', 'poocommerce' ),
							'value' => 'outofstock',
						),
						array(
							'label' => __( 'On backorder', 'poocommerce' ),
							'value' => 'onbackorder',
						),
					),
				),
				'hideConditions' => array(
					array(
						'expression' => 'editedProduct.manage_stock === true',
					),
				),
			)
		);
	}

	/**
	 * Adds the shipping group blocks to the template.
	 */
	protected function add_shipping_group_blocks() {
		$shipping_group = $this->get_group_by_id( $this::GROUP_IDS['SHIPPING'] );
		$shipping_group->add_block(
			array(
				'id'         => 'shipping-single-variation-notice',
				'blockName'  => 'poocommerce/product-single-variation-notice',
				'order'      => 10,
				'attributes' => array(
					'content'       => __( '<strong>You’re editing details specific to this variation.</strong> Some information, like description and images, will be inherited from the main product, <noticeLink><parentProductName/></noticeLink>.', 'poocommerce' ),
					'type'          => 'info',
					'isDismissible' => true,
					'name'          => $this::SINGLE_VARIATION_NOTICE_DISMISSED_OPTION,
				),
			)
		);
		// Virtual section.
		$shipping_group->add_section(
			array(
				'id'    => 'product-variation-virtual-section',
				'order' => 20,
			)
		)->add_block(
			array(
				'id'         => 'product-variation-virtual',
				'blockName'  => 'poocommerce/product-toggle-field',
				'order'      => 10,
				'attributes' => array(
					'property'       => 'virtual',
					'checkedValue'   => false,
					'uncheckedValue' => true,
					'label'          => __( 'This variation requires shipping or pickup', 'poocommerce' ),
					'uncheckedHelp'  => __( 'This variation will not trigger your customer\'s shipping calculator in cart or at checkout. This product also won\'t require your customers to enter their shipping details at checkout. <a href="https://poocommerce.com/document/managing-products/#adding-a-virtual-product" target="_blank" rel="noreferrer">Read more about virtual products</a>.', 'poocommerce' ),
				),
			)
		);
		// Product Shipping Section.
		$product_fee_and_dimensions_section = $shipping_group->add_section(
			array(
				'id'         => 'product-variation-fee-and-dimensions-section',
				'order'      => 30,
				'attributes' => array(
					'title'       => __( 'Fees & dimensions', 'poocommerce' ),
					'description' => sprintf(
					/* translators: %1$s: How to get started? link opening tag. %2$s: How to get started? link closing tag.*/
						__( 'Set up shipping costs and enter dimensions used for accurate rate calculations. %1$sHow to get started?%2$s', 'poocommerce' ),
						'<a href="https://poocommerce.com/posts/how-to-calculate-shipping-costs-for-your-poocommerce-store/" target="_blank" rel="noreferrer">',
						'</a>'
					),
				),
			)
		);
		$product_fee_and_dimensions_section->add_block(
			array(
				'id'        => 'product-variation-shipping-class',
				'blockName' => 'poocommerce/product-shipping-class-field',
				'order'     => 10,
			)
		);
		$product_fee_and_dimensions_section->add_block(
			array(
				'id'        => 'product-variation-shipping-dimensions',
				'blockName' => 'poocommerce/product-shipping-dimensions-fields',
				'order'     => 20,
			)
		);
	}
}
