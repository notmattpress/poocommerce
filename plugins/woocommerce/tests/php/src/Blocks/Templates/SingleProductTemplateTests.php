<?php

namespace Automattic\PooCommerce\Tests\Blocks\Templates;

use Automattic\PooCommerce\Blocks\Templates\SingleProductTemplate;
use WP_UnitTestCase;

/**
 * Tests the SingleProductTemplate class
 *
 */
class SingleProductTemplateTests extends WP_UnitTestCase {

	/**
	 * Test that the Product Catalog template content isn't updated mistakenly.
	 * In other words, make sure the Single Product template logic doesn't leak
	 * into other templates.
	 *
	 */
	public function test_dont_update_single_product_content_for_other_templates() {
		$single_product_template                  = new SingleProductTemplate();
		$default_product_catalog_template_content = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:poocommerce/product-image-gallery /-->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$template          = new \WP_Block_Template();
		$template->slug    = 'archive-product';
		$template->title   = 'Product Catalog';
		$template->content = $default_product_catalog_template_content;
		$template->type    = 'wp_template';

		$result = $single_product_template->update_single_product_content(
			array(
				$template,
			),
		);

		$this->assertEquals(
			$default_product_catalog_template_content,
			$result[0]->content
		);
	}

	/**
	 * Test that the Single Product template content isn't updated if it
	 * contains the Legacy Template block.
	 *
	 */
	public function test_dont_update_single_product_content_with_legacy_template() {
		$single_product_template                 = new SingleProductTemplate();
		$default_single_product_template_content = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:poocommerce/legacy-template {"template":"single-product"} /-->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$template          = new \WP_Block_Template();
		$template->slug    = 'single-product';
		$template->title   = 'Single Product';
		$template->content = $default_single_product_template_content;
		$template->type    = 'wp_template';

		$result = $single_product_template->update_single_product_content(
			array(
				$template,
			),
		);

		$this->assertEquals(
			$default_single_product_template_content,
			$result[0]->content
		);
	}

	/**
	 * Test that the Single Product template content is updated if it doesn't
	 * contain the Legacy Template block.
	 *
	 */
	public function test_update_single_product_content_with_legacy_template() {
		$single_product_template                  = new SingleProductTemplate();
		$default_single_product_template_content  = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:poocommerce/product-image-gallery /-->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';
		$expected_single_product_template_content = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:group {"className":"poocommerce product","__wooCommerceIsFirstBlock":true,"__wooCommerceIsLastBlock":true} -->
			<div class="wp-block-group poocommerce product">
			<!-- wp:poocommerce/product-image-gallery /-->
			</div>
			<!-- /wp:group -->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$template          = new \WP_Block_Template();
		$template->slug    = 'single-product';
		$template->title   = 'Single Product';
		$template->content = $default_single_product_template_content;
		$template->type    = 'wp_template';

		$result = $single_product_template->update_single_product_content(
			array(
				$template,
			),
		);

		$expected_single_product_template_without_whitespace = preg_replace(
			'/\s+/',
			'',
			$expected_single_product_template_content
		);
		$result_without_whitespace                           = preg_replace( '/\s+/', '', $result[0]->content );

		$this->assertEquals(
			$expected_single_product_template_without_whitespace,
			$result_without_whitespace
		);
	}

	/**
	 * Test that the Single Product template content isn't updated if it
	 * contains a pattern with the Legacy Template block.
	 *
	 */
	public function test_dont_update_single_product_content_with_legacy_template_inside_a_pattern() {
		register_block_pattern(
			'test-pattern',
			array(
				'title'       => 'Test Pattern',
				'description' => 'Test Pattern Description',
				'content'     => '<!-- wp:poocommerce/legacy-template {"template":"single-product"} /-->',
			)
		);
		$single_product_template                 = new SingleProductTemplate();
		$default_single_product_template_content = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:pattern {"slug":"test-pattern"} /-->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$template          = new \WP_Block_Template();
		$template->slug    = 'single-product';
		$template->title   = 'Single Product';
		$template->content = $default_single_product_template_content;
		$template->type    = 'wp_template';

		$result = $single_product_template->update_single_product_content(
			array(
				$template,
			),
		);

		$this->assertEquals(
			$default_single_product_template_content,
			$result[0]->content
		);
	}

	/**
	 * Test that the Single Product template content is updated if it doesn't
	 * contain the Legacy Template block.
	 *
	 */
	public function test_update_single_product_content_with_legacy_template_inside_a_pattern() {
		register_block_pattern(
			'test-pattern',
			array(
				'title'       => 'Test Pattern',
				'description' => 'Test Pattern Description',
				'content'     => '<!-- wp:poocommerce/product-image-gallery /-->',
			)
		);
		$single_product_template                  = new SingleProductTemplate();
		$default_single_product_template_content  = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:pattern {"slug":"test-pattern"} /-->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';
		$expected_single_product_template_content = '
			<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
			<!-- wp:group {"className":"poocommerce product","__wooCommerceIsFirstBlock":true,"__wooCommerceIsLastBlock":true} -->
			<div class="wp-block-group poocommerce product">
			<!-- wp:pattern {"slug":"test-pattern"} /-->
			</div>
			<!-- /wp:group -->
			<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$template          = new \WP_Block_Template();
		$template->slug    = 'single-product';
		$template->title   = 'Single Product';
		$template->content = $default_single_product_template_content;
		$template->type    = 'wp_template';

		$result = $single_product_template->update_single_product_content(
			array(
				$template,
			),
		);

		$expected_single_product_template_without_whitespace = preg_replace(
			'/\s+/',
			'',
			$expected_single_product_template_content
		);
		$result_without_whitespace                           = preg_replace( '/\s+/', '', $result[0]->content );

		$this->assertEquals(
			$expected_single_product_template_without_whitespace,
			$result_without_whitespace
		);
	}

	/**
	 * Test that the password form isn't added to the Single Product Template.
	 *
	 */
	public function test_no_remove_block_when_no_single_product_is_in_the_template() {
		$default_single_product_template = '
	<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
	<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
	<div class="wp-block-group">
	<!-- wp:poocommerce/legacy-template {"template":"single-product"} /-->
	</div>
	<!-- /wp:group -->
	<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$expected_single_product_template = '
	<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
	<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
	<div class="wp-block-group">
	<!-- wp:poocommerce/legacy-template {"template":"single-product"} /-->
	</div>
	<!-- /wp:group -->
	<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$result = SingleProductTemplate::add_password_form(
			$default_single_product_template
		);

		$result_without_whitespace                           = preg_replace( '/\s+/', '', $result );
		$expected_single_product_template_without_whitespace = preg_replace(
			'/\s+/',
			'',
			$expected_single_product_template
		);

		$this->assertEquals(
			$result_without_whitespace,
			$expected_single_product_template_without_whitespace
		);
	}

	/**
	 * Test that the password form is added to the Single Product Template.
	 */
	public function test_replace_single_product_blocks_with_input_form() {
		$default_single_product_template = '
	<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
	<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
	<div class="wp-block-group">
	<!-- wp:poocommerce/product-image-gallery {"layout":{"inherit":true,"type":"constrained"}} /-->
	</div>
	<!-- /wp:group -->
	<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->';

		$expected_single_product_template = sprintf(
			'
	<!-- wp:template-part {"slug":"header","theme":"twentytwentythree","tagName":"header"} /-->
	<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
	<div class="wp-block-group">
		<!-- wp:html -->%s<!-- /wp:html -->
	</div>
	<!-- /wp:group -->
	<!-- wp:template-part {"slug":"footer","theme":"twentytwentythree","tagName":"footer"} /-->',
			get_the_password_form()
		);

		$result = SingleProductTemplate::add_password_form(
			$default_single_product_template
		);

		$result_without_whitespace                          = preg_replace( '/\s+/', '', $result );
		$result_without_whitespace_without_custom_pwbox_ids = preg_replace(
			'/pwbox-\d+/',
			'',
			$result_without_whitespace
		);

		$expected_single_product_template_without_whitespace = preg_replace(
			'/\s+/',
			'',
			$expected_single_product_template
		);

		$expected_single_product_template_without_whitespace_without_custom_pwbox_ids = preg_replace(
			'/pwbox-\d+/',
			'',
			$expected_single_product_template_without_whitespace
		);

		$this->assertEquals(
			$result_without_whitespace_without_custom_pwbox_ids,
			$expected_single_product_template_without_whitespace_without_custom_pwbox_ids
		);
	}

	/**
	 * Test that the password form is added to the Single Product Template with the default template.
	 */
	public function test_replace_default_template_single_product_blocks_with_input_form() {
		$default_single_product_template = '
		<!-- wp:template-part {"slug":"header"} /-->

		<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
		<div class="wp-block-group">
			<!-- wp:poocommerce/breadcrumbs /-->
			<!-- wp:poocommerce/store-notices /-->

			<!-- wp:columns {"align":"wide"} -->
			<div class="wp-block-columns alignwide">
				<!-- wp:column {"width":"512px"} -->
				<div class="wp-block-column" style="flex-basis:512px">
					<!-- wp:poocommerce/product-image-gallery /-->
				</div>
				<!-- /wp:column -->

				<!-- wp:column -->
				<div class="wp-block-column">
					<!-- wp:post-title {"level": 1, "__poocommerceNamespace":"poocommerce/product-query/product-title"} /-->

					<!-- wp:poocommerce/product-rating {"isDescendentOfSingleProductTemplate":true} /-->

					<!-- wp:poocommerce/product-price {"isDescendentOfSingleProductTemplate":true, "fontSize":"large"} /-->

					<!-- wp:post-excerpt {"__poocommerceNamespace":"poocommerce/product-query/product-summary", "excerptLength":100} /-->

					<!-- wp:poocommerce/add-to-cart-form /-->

					<!-- wp:poocommerce/product-meta -->
					<div class="wp-block-poocommerce-product-meta">
						<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
						<div class="wp-block-group">
							<!-- wp:poocommerce/product-sku {"isDescendentOfSingleProductTemplate":true} /-->

							<!-- wp:post-terms {"term":"product_cat","prefix":"Category: "} /-->

							<!-- wp:post-terms {"term":"product_tag","prefix":"Tags: "} /-->
						</div>
						<!-- /wp:group -->
					</div>
					<!-- /wp:poocommerce/product-meta -->
				</div>
				<!-- /wp:column -->
			</div>
			<!-- /wp:columns -->

			<!-- wp:poocommerce/product-details {"align":"wide"} /-->

			<!-- wp:poocommerce/related-products {"align":"wide"} -->
			<div class="wp-block-poocommerce-related-products alignwide">
				<!-- wp:query {"queryId":0,"query":{"perPage":5,"pages":0,"offset":0,"postType":"product","order":"asc","orderBy":"title","author":"","search":"","exclude":[],"sticky":"","inherit":false},"displayLayout":{"type":"flex","columns":5},"namespace":"poocommerce/related-products","lock":{"remove":true,"move":true}} -->
				<div class="wp-block-query">
					<!-- wp:heading -->
					<h2 class="wp-block-heading">Related products</h2>
					<!-- /wp:heading -->

					<!-- wp:post-template {"className":"products-block-post-template","__poocommerceNamespace":"poocommerce/product-query/product-template"} -->
					<!-- wp:poocommerce/product-image {"isDescendentOfQueryLoop":true} /-->

					<!-- wp:post-title {"textAlign":"center","level":3,"fontSize":"medium","__poocommerceNamespace":"poocommerce/product-query/product-title"} /-->

					<!-- wp:poocommerce/product-price {"isDescendentOfQueryLoop":true,"textAlign":"center","fontSize":"small","style":{"spacing":{"margin":{"bottom":"1rem"}}}} /-->

					<!-- wp:poocommerce/product-button {"isDescendentOfQueryLoop":true,"textAlign":"center","fontSize":"small","style":{"spacing":{"margin":{"bottom":"1rem"}}}} /-->
					<!-- /wp:post-template -->
				</div>
				<!-- /wp:query -->
			</div>
			<!-- /wp:poocommerce/related-products -->
		</div>
		<!-- /wp:group -->

		<!-- wp:template-part {"slug":"footer"} /-->

		';

		$expected_single_product_template = sprintf(
			'
			<!-- wp:template-part {"slug":"header"} /-->
			<!-- wp:group {"layout":{"inherit":true,"type":"constrained"}} -->
			<div class="wp-block-group">
			<!-- wp:poocommerce/breadcrumbs /-->
			   <!-- wp:poocommerce/store-notices /-->
			   <!-- wp:columns {"align":"wide"} -->
			   <div class="wp-block-columns alignwide">
				  <!-- wp:column {"width":"512px"} -->
				  <div class="wp-block-column" style="flex-basis:512px">
				  <!-- wp:html -->%s<!-- /wp:html -->
				  </div>
				  <!-- /wp:column -->
				  <!-- wp:column -->
				  <div class="wp-block-column">
					 <!-- wp:post-title {"level": 1, "__poocommerceNamespace":"poocommerce/product-query/product-title"} /-->
					 <!-- wp:post-excerpt {"__poocommerceNamespace":"poocommerce/product-query/product-summary", "excerptLength":100} /-->
				  </div>
				  <!-- /wp:column -->
			   </div>
			   <!-- /wp:columns -->
			</div>
			<!-- /wp:group -->
			<!-- wp:template-part {"slug":"footer"} /-->',
			get_the_password_form()
		);

		$result = SingleProductTemplate::add_password_form(
			$default_single_product_template
		);

		$result_without_whitespace                          = preg_replace( '/\s+/', '', $result );
		$result_without_whitespace_without_custom_pwbox_ids = preg_replace(
			'/pwbox-\d+/',
			'',
			$result_without_whitespace
		);

		$expected_single_product_template_without_whitespace = preg_replace(
			'/\s+/',
			'',
			$expected_single_product_template
		);

		$expected_single_product_template_without_whitespace_without_custom_pwbox_ids = preg_replace(
			'/pwbox-\d+/',
			'',
			$expected_single_product_template_without_whitespace
		);

		$this->assertEquals(
			$result_without_whitespace_without_custom_pwbox_ids,
			$expected_single_product_template_without_whitespace_without_custom_pwbox_ids
		);
	}
}
