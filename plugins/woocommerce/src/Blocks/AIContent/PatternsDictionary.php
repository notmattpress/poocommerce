<?php
declare( strict_types = 1 );

namespace Automattic\PooCommerce\Blocks\AIContent;

/**
 * Patterns Dictionary class.
 *
 * @internal
 */
class PatternsDictionary {
	/**
	 * Returns the patterns' dictionary.
	 *
	 * @return array[]
	 */
	public static function get() {
		return [
			[
				'name'          => 'Banner',
				'slug'          => 'poocommerce-blocks/banner',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Up to 60% off', 'poocommerce' ),
							'ai_prompt' => __( 'A four words title advertising the sale', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Holiday Sale', 'poocommerce' ),
							'ai_prompt' => __( 'A two words label with the sale name', 'poocommerce' ),
						],
						[
							'default'   => __( 'Get your favorite vinyl at record-breaking prices.', 'poocommerce' ),
							'ai_prompt' => __( 'The main description of the sale with at least 65 characters', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Shop vinyl records', 'poocommerce' ),
							'ai_prompt' => __( 'A 3 words button text to go to the sale page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Discount Banner',
				'slug'    => 'poocommerce-blocks/discount-banner',
				'content' => [
					'descriptions' => [
						[
							'default'   => __( 'Select products', 'poocommerce' ),
							'ai_prompt' => __( 'A two words description of the products on sale', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Discount Banner with Image',
				'slug'          => 'poocommerce-blocks/discount-banner-with-image',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'descriptions' => [
						[
							'default'   => __( 'Select products', 'poocommerce' ),
							'ai_prompt' => __( 'A two words description of the products on sale', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Featured Category Focus',
				'slug'          => 'poocommerce-blocks/featured-category-focus',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'  => [
						[
							'default'   => __( 'Black and white high-quality prints', 'poocommerce' ),
							'ai_prompt' => __( 'The four words title of the featured category related to the following image description: [image.0]', 'poocommerce' ),
						],
					],
					'buttons' => [
						[
							'default'   => __( 'Shop prints', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the featured category', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Featured Category Triple',
				'slug'          => 'poocommerce-blocks/featured-category-triple',
				'images_total'  => 3,
				'images_format' => 'portrait',
				'content'       => [
					'titles' => [
						[
							'default'   => __( 'Home decor', 'poocommerce' ),
							'ai_prompt' => __( 'A one-word graphic title that encapsulates the essence of the business, inspired by the following image description: [image.0] and the nature of the business. The title should reflect the key elements and characteristics of the business, as portrayed in the image', 'poocommerce' ),
						],
						[
							'default'   => __( 'Retro photography', 'poocommerce' ),
							'ai_prompt' => __( 'A two-words graphic title that encapsulates the essence of the business, inspired by the following image description: [image.1] and the nature of the business. The title should reflect the key elements and characteristics of the business, as portrayed in the image', 'poocommerce' ),
						],
						[
							'default'   => __( 'Handmade gifts', 'poocommerce' ),
							'ai_prompt' => __( 'A two-words graphic title that encapsulates the essence of the business, inspired by the following image description: [image.2] and the nature of the business. The title should reflect the key elements and characteristics of the business, as portrayed in the image', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Featured Products: Fresh & Tasty',
				'slug'          => 'poocommerce-blocks/featured-products-fresh-and-tasty',
				'images_total'  => 4,
				'images_format' => 'portrait',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Fresh & tasty goods', 'poocommerce' ),
							'ai_prompt' => __( 'The title of the featured products with at least 20 characters', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Sweet Organic Lemons', 'poocommerce' ),
							'ai_prompt' => __( 'The three words description of the featured product related to the following image description: [image.0]', 'poocommerce' ),
						],
						[
							'default'   => __( 'Fresh Organic Tomatoes', 'poocommerce' ),
							'ai_prompt' => __( 'The three words description of the featured product related to the following image description: [image.1]', 'poocommerce' ),
						],
						[
							'default'   => __( 'Fresh Lettuce (Washed)', 'poocommerce' ),
							'ai_prompt' => __( 'The three words description of the featured product related to the following image description: [image.2]', 'poocommerce' ),
						],
						[
							'default'   => __( 'Russet Organic Potatoes', 'poocommerce' ),
							'ai_prompt' => __( 'The three words description of the featured product related to the following image description: [image.3]', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Hero Product 3 Split',
				'slug'          => 'poocommerce-blocks/hero-product-3-split',
				'images_total'  => 1,
				'images_format' => 'portrait',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Timeless elegance', 'poocommerce' ),
							'ai_prompt' => __( 'Write a two words title for advertising the store', 'poocommerce' ),
						],
						[
							'default'   => __( 'Durable glass', 'poocommerce' ),
							'ai_prompt' => __( 'Write a two words title for advertising the store', 'poocommerce' ),
						],
						[
							'default'   => __( 'Versatile charm', 'poocommerce' ),
							'ai_prompt' => __( 'Write a two words title for advertising the store', 'poocommerce' ),
						],
						[
							'default'   => __( 'New: Retro Glass Jug', 'poocommerce' ),
							'ai_prompt' => __( 'Write a title with less than 20 characters for advertising the store', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Elevate your table with a 330ml Retro Glass Jug, blending classic design and durable hardened glass.', 'poocommerce' ),
							'ai_prompt' => __( 'Write a text with approximately 130 characters, to describe a product the business is selling', 'poocommerce' ),
						],
						[
							'default'   => __( 'Crafted from resilient thick glass, this jug ensures lasting quality, making it perfect for everyday use with a touch of vintage charm.', 'poocommerce' ),
							'ai_prompt' => __( 'Write a text with approximately 130 characters, to describe a product the business is selling', 'poocommerce' ),
						],
						[
							'default'   => __( "The Retro Glass Jug's classic silhouette effortlessly complements any setting, making it the ideal choice for serving beverages with style and flair.", 'poocommerce' ),
							'ai_prompt' => __( 'Write a long text, with at least 130 characters, to describe a product the business is selling', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Hero Product Chessboard',
				'slug'          => 'poocommerce-blocks/hero-product-chessboard',
				'images_total'  => 2,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Quality Materials', 'poocommerce' ),
							'ai_prompt' => __( 'A two words title describing the first displayed product feature', 'poocommerce' ),
						],
						[
							'default'   => __( 'Unique design', 'poocommerce' ),
							'ai_prompt' => __( 'A two words title describing the second displayed product feature', 'poocommerce' ),
						],
						[
							'default'   => __( 'Make your house feel like home', 'poocommerce' ),
							'ai_prompt' => __( 'A two words title describing the fourth displayed product feature', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'We use only the highest-quality materials in our products, ensuring that they look great and last for years to come.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the product feature with at least 115 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'From bold prints to intricate details, our products are a perfect combination of style and function.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the product feature with at least 115 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'Add a touch of charm and coziness this holiday season with a wide selection of hand-picked decorations — from minimalist vases to designer furniture.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the product feature with at least 115 characters', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Shop home decor', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the product page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Hero Product Split',
				'slug'          => 'poocommerce-blocks/hero-product-split',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles' => [
						[
							'default'   => __( 'Keep dry with 50% off rain jackets', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the product the store is selling with at least 35 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Just Arrived Full Hero',
				'slug'          => 'poocommerce-blocks/just-arrived-full-hero',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Sound like no other', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the displayed product collection with at least 10 characters', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Experience your music like never before with our latest generation of hi-fidelity headphones.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the product collection with at least 35 characters', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Shop now', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the product collection page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Product Collection Banner',
				'slug'          => 'poocommerce-blocks/product-collection-banner',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Brand New for the Holidays', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the displayed product collection with at least 25 characters related to the following image description: [image.0]', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Check out our brand new collection of holiday products and find the right gift for anyone.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the product collection with at least 90 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Collections Featured Collection',
				'slug'    => 'poocommerce-blocks/product-collections-featured-collection',
				'content' => [
					'titles' => [
						[
							'default'   => "This week's popular products",
							'ai_prompt' => __( 'An impact phrase that advertises the displayed product collection with at least 30 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Product Collections Featured Collections',
				'slug'          => 'poocommerce-blocks/product-collections-featured-collections',
				'images_total'  => 4,
				'images_format' => 'landscape',
				'content'       => [
					'titles'  => [
						[
							'default'   => __( 'Tech gifts under $100', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the product collection with at least 20 characters related to the following image descriptions: [image.0], [image.1]', 'poocommerce' ),
						],
						[
							'default'   => __( 'For the gamers', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the product collection with at least 15 characters related to the following image descriptions: [image.2], [image.3]', 'poocommerce' ),
						],
					],
					'buttons' => [
						[
							'default'   => __( 'Shop tech', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the product collection page', 'poocommerce' ),
						],
						[
							'default'   => __( 'Shop games', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the product collection page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Collections Newest Arrivals',
				'slug'    => 'poocommerce-blocks/product-collections-newest-arrivals',
				'content' => [
					'titles'  => [
						[
							'default'   => __( 'Our newest arrivals', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the displayed product collection with at least 20 characters', 'poocommerce' ),
						],
					],
					'buttons' => [
						[
							'default'   => __( 'More new products', 'poocommerce' ),
							'ai_prompt' => __( 'The button text to go to the product collection page with at least 15 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Collection 4 Columns',
				'slug'    => 'poocommerce-blocks/product-collection-4-columns',
				'content' => [
					'titles' => [
						[
							'default'   => __( 'Staff picks', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the displayed product collection with at least 20 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Collection 5 Columns',
				'slug'    => 'poocommerce-blocks/product-collection-5-columns',
				'content' => [
					'titles' => [
						[
							'default'   => __( 'Our latest and greatest', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase with that advertises the product collection with at least 20 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Gallery',
				'slug'    => 'poocommerce-blocks/product-query-product-gallery',
				'content' => [
					'titles' => [
						[
							'default'   => __( 'Bestsellers', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the featured products with at least 10 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Featured Products 2 Columns',
				'slug'    => 'poocommerce-blocks/featured-products-2-cols',
				'content' => [
					'titles'       => [
						[
							'default'   => __( 'Fan favorites', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the featured products with at least 10 characters', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Get ready to start the season right. All the fan favorites in one place at the best price.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the featured products with at least 90 characters', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Shop All', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the featured products page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Shop by Price',
				'slug'    => 'poocommerce-blocks/shop-by-price',
				'content' => [
					'titles' => [
						[
							'default'   => __( 'Outdoor Furniture & Accessories', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the first product collection with at least 30 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'Summer Dinning', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the second product collection with at least 20 characters', 'poocommerce' ),
						],
						[
							'default'   => "Women's Styles",
							'ai_prompt' => __( 'An impact phrase that advertises the third product collection with at least 20 characters', 'poocommerce' ),
						],
						[
							'default'   => "Kids' Styles",
							'ai_prompt' => __( 'An impact phrase that advertises the fourth product collection with at least 20 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Small Discount Banner with Image',
				'slug'          => 'poocommerce-blocks/small-discount-banner-with-image',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles' => [
						[
							'default'   => __( 'Chairs', 'poocommerce' ),
							'ai_prompt' => __( 'A single word that advertises the product and is related to the following image description: [image.0]', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Social: Follow us on social media',
				'slug'          => 'poocommerce-blocks/social-follow-us-in-social-media',
				'images_total'  => 4,
				'images_format' => 'landscape',
				'content'       => [
					'titles' => [
						[
							'default'   => __( 'Stay in the loop', 'poocommerce' ),
							'ai_prompt' => __( 'A phrase that advertises the social media accounts of the store with at least 25 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Alternating Image and Text',
				'slug'          => 'poocommerce-blocks/alt-image-and-text',
				'images_total'  => 2,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Our products', 'poocommerce' ),
							'ai_prompt' => __( 'A two words impact phrase that advertises the products', 'poocommerce' ),
						],
						[
							'default'   => __( 'Sustainable blends, stylish accessories', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the products with at least 40 characters and related to the following image description: [image.0]', 'poocommerce' ),
						],
						[
							'default'   => __( 'About us', 'poocommerce' ),
							'ai_prompt' => __( 'A two words impact phrase that advertises the brand', 'poocommerce' ),
						],
						[
							'default'   => __( 'Committed to a greener lifestyle', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the brand with at least 50 characters related to the following image description: [image.1]', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Indulge in the finest organic coffee beans, teas, and hand-picked accessories, all locally sourced and sustainable for a mindful lifestyle.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the products with at least 180 characters', 'poocommerce' ),
						],
						[
							'default'   => "Our passion is crafting mindful moments with locally sourced, organic, and sustainable products. We're more than a store; we're your path to a community-driven, eco-friendly lifestyle that embraces premium quality.",
							'ai_prompt' => __( 'A description of the products with at least 180 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'Locally sourced ingredients', 'poocommerce' ),
							'ai_prompt' => __( 'A three word description of the products', 'poocommerce' ),
						],
						[
							'default'   => __( 'Premium organic blends', 'poocommerce' ),
							'ai_prompt' => __( 'A three word description of the products', 'poocommerce' ),
						],
						[
							'default'   => __( 'Hand-picked accessories', 'poocommerce' ),
							'ai_prompt' => __( 'A three word description of the products', 'poocommerce' ),
						],
						[
							'default'   => __( 'Sustainable business practices', 'poocommerce' ),
							'ai_prompt' => __( 'A three word description of the products', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Meet us', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the product page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Testimonials 3 Columns',
				'slug'    => 'poocommerce-blocks/testimonials-3-columns',
				'content' => [
					'titles'       => [
						[
							'default'   => __( 'Eclectic finds, ethical delights', 'poocommerce' ),
							'ai_prompt' => __( 'Write a short title advertising a testimonial from a customer', 'poocommerce' ),
						],
						[
							'default'   => __( 'Sip, Shop, Savor', 'poocommerce' ),
							'ai_prompt' => __( 'Write a short title advertising a testimonial from a customer', 'poocommerce' ),
						],
						[
							'default'   => __( 'LOCAL LOVE', 'poocommerce' ),
							'ai_prompt' => __( 'Write a short title advertising a testimonial from a customer', 'poocommerce' ),
						],
						[
							'default'   => __( 'What our customers say', 'poocommerce' ),
							'ai_prompt' => __( 'Write just 4 words to advertise testimonials from customers', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Transformed my daily routine with unique, eco-friendly treasures. Exceptional quality and service. Proud to support a store that aligns with my values.', 'poocommerce' ),
							'ai_prompt' => __( 'Write the testimonial from a customer with approximately 150 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'The organic coffee beans are a revelation. Each sip feels like a journey. Beautifully crafted accessories add a touch of elegance to my home.', 'poocommerce' ),
							'ai_prompt' => __( 'Write the testimonial from a customer with approximately 150 characters', 'poocommerce' ),
						],
						[
							'default'   => __( 'From sustainably sourced teas to chic vases, this store is a treasure trove. Love knowing my purchases contribute to a greener planet.', 'poocommerce' ),
							'ai_prompt' => __( 'Write the testimonial from a customer with approximately 150 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Testimonials Single',
				'slug'          => 'poocommerce-blocks/testimonials-single',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'A ‘brewtiful’ experience :-)', 'poocommerce' ),
							'ai_prompt' => __( 'A two words title that advertises the testimonial', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'Exceptional flavors, sustainable choices. The carefully curated collection of coffee pots and accessories turned my kitchen into a haven of style and taste.', 'poocommerce' ),
							'ai_prompt' => __( 'A description of the testimonial with at least 225 characters', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'          => 'Featured Category Cover Image',
				'slug'          => 'poocommerce-blocks/featured-category-cover-image',
				'images_total'  => 1,
				'images_format' => 'landscape',
				'content'       => [
					'titles'       => [
						[
							'default'   => __( 'Sit back and relax', 'poocommerce' ),
							'ai_prompt' => __( 'A description for a product with at least 20 characters', 'poocommerce' ),
						],
					],
					'descriptions' => [
						[
							'default'   => __( 'With a wide range of designer chairs to elevate your living space.', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the products with at least 55 characters', 'poocommerce' ),
						],
					],
					'buttons'      => [
						[
							'default'   => __( 'Shop chairs', 'poocommerce' ),
							'ai_prompt' => __( 'A two words button text to go to the shop page', 'poocommerce' ),
						],
					],
				],
			],
			[
				'name'    => 'Product Collection: Featured Products 5 Columns',
				'slug'    => 'poocommerce-blocks/product-collection-featured-products-5-columns',
				'content' => [
					'titles' => [
						[
							'default'   => __( 'Shop new arrivals', 'poocommerce' ),
							'ai_prompt' => __( 'An impact phrase that advertises the newest additions to the store with at least 20 characters', 'poocommerce' ),
						],
					],
				],
			],
		];
	}
}
