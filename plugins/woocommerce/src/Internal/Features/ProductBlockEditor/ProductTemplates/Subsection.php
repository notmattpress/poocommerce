<?php
/**
 * PooCommerce Subsection Block class.
 */

namespace Automattic\PooCommerce\Internal\Features\ProductBlockEditor\ProductTemplates;

use Automattic\PooCommerce\Admin\BlockTemplates\BlockTemplateInterface;
use Automattic\PooCommerce\Admin\BlockTemplates\ContainerInterface;
use Automattic\PooCommerce\Admin\Features\ProductBlockEditor\ProductTemplates\SubsectionInterface;

/**
 * Class for Subsection block.
 */
class Subsection extends ProductBlock implements SubsectionInterface {
	// phpcs:disable Squiz.Commenting.FunctionCommentThrowTag.WrongNumber
	/**
	 * Subsection Block constructor.
	 *
	 * @param array                   $config The block configuration.
	 * @param BlockTemplateInterface  $root_template The block template that this block belongs to.
	 * @param ContainerInterface|null $parent The parent block container.
	 *
	 * @throws \ValueError If the block configuration is invalid.
	 * @throws \ValueError If the parent block container does not belong to the same template as the block.
	 * @throws \InvalidArgumentException If blockName key and value are passed into block configuration.
	 */
	public function __construct( array $config, BlockTemplateInterface &$root_template, ?ContainerInterface &$parent = null ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.parentFound
		if ( ! empty( $config['blockName'] ) ) {
			throw new \InvalidArgumentException( 'Unexpected key "blockName", this defaults to "poocommerce/product-subsection".' );
		}
		parent::__construct( array_merge( array( 'blockName' => 'poocommerce/product-subsection' ), $config ), $root_template, $parent );
	}
	// phpcs:enable Squiz.Commenting.FunctionCommentThrowTag.WrongNumber
}
